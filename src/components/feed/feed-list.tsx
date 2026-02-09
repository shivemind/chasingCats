'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { PostCard } from './post-card';
import { CreatePostForm } from './create-post-form';
import type { FeedPost } from '@/types/feed';

type FeedListProps = {
  initialPosts: FeedPost[];
  initialCursor?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  hasPaidAccess?: boolean;
};

export function FeedList({ initialPosts, initialCursor, currentUserId = '', isAdmin = false, hasPaidAccess = false }: FeedListProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialCursor);

  const handlePostCreated = useCallback((newPost: FeedPost) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const handlePostDeleted = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/feed?cursor=${cursor}`);
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [...prev, ...data.posts]);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {currentUserId ? (
        <CreatePostForm onPostCreated={handlePostCreated} hasPaidAccess={hasPaidAccess} />
      ) : (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800/50 ring-2 ring-emerald-500/30">
              <LogIn className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm sm:text-base">Join the Pride!</p>
              <p className="text-xs sm:text-sm text-emerald-300/60">
                Sign in to post, comment, purr & roar with the community.
              </p>
            </div>
            <Link
              href="/login?callbackUrl=/feed"
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 transition-colors active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/80 backdrop-blur-sm p-8 sm:p-12 text-center">
          <div className="text-4xl mb-4">🐱</div>
          <p className="text-lg font-semibold text-white">The feed is empty!</p>
          <p className="mt-2 text-sm text-emerald-300/60">
            Be the first to share something with the pride.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                hasPaidAccess={hasPaidAccess}
                onDelete={handlePostDeleted}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="rounded-full bg-emerald-800/50 border border-emerald-500/30 px-6 py-3 text-sm font-semibold text-emerald-200 hover:bg-emerald-700/50 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load more posts'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
