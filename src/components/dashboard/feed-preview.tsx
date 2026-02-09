'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, ArrowRight } from 'lucide-react';

export type FeedPreviewPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    name: string | null;
    profile: { username: string } | null;
  };
  _count: { comments: number };
  reactionCounts: { purrs: number; roars: number };
};

type FeedPreviewProps = {
  posts: FeedPreviewPost[];
};

export function FeedPreview({ posts }: FeedPreviewProps) {
  return (
    <section className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-neon-purple/5 to-transparent p-4 sm:p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-brand/20">
            <span className="text-xl sm:text-2xl">🦁</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">Pride Feed</h3>
            <p className="text-xs sm:text-sm text-gray-400">See what the community is sharing</p>
          </div>
        </div>
        <Link 
          href="/feed" 
          className="inline-flex items-center gap-2 rounded-full bg-brand/20 border border-brand/40 px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/30 transition-colors self-start sm:self-auto"
        >
          Open Feed
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/50 mb-4">The feed is waiting for you!</p>
          <Link 
            href="/feed" 
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-night hover:bg-brand/90 transition-colors"
          >
            Be the first to post
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 6).map((post) => {
            const displayName = post.author.profile?.username || post.author.name || 'Anonymous';
            return (
              <Link
                key={post.id}
                href="/feed"
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-brand/40 hover:bg-white/10"
              >
                {/* Author and time */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand to-neon-purple flex items-center justify-center">
                    <span className="text-xs font-bold text-night">
                      {displayName[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-white/80 truncate">{displayName}</span>
                  <span className="text-xs text-white/40">·</span>
                  <span className="text-xs text-white/40 truncate">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {/* Content preview */}
                <p className="text-sm text-white/70 line-clamp-2 mb-3 min-h-[2.5rem]">
                  {post.content}
                </p>

                {/* Image preview if exists */}
                {post.imageUrl && (
                  <div className="relative h-24 w-full mb-3 rounded-lg overflow-hidden bg-white/5">
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Reactions */}
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <span>🐱</span>
                    <span>{post.reactionCounts.purrs}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🦁</span>
                    <span>{post.reactionCounts.roars}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{post._count.comments}</span>
                  </span>
                </div>

                {/* Hover accent */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand via-neon-purple to-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick post CTA */}
      {posts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <Link
            href="/feed"
            className="flex items-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/5 p-3 text-white/50 hover:border-brand/40 hover:bg-white/10 hover:text-white transition-all"
          >
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-sm">✍️</span>
            </div>
            <span className="text-sm">Share something with the pride...</span>
          </Link>
        </div>
      )}
    </section>
  );
}
