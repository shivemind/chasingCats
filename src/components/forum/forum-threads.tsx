'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface ForumThread {
  id: string;
  title: string;
  excerpt: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  replyCount: number;
  viewCount: number;
  lastReply?: {
    author: string;
    createdAt: string;
  };
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  threadCount: number;
}

interface ForumThreadsProps {
  threads: ForumThread[];
  categories: ForumCategory[];
}

export function ForumThreads({ threads, categories }: ForumThreadsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');

  const filteredThreads = threads
    .filter((thread) => selectedCategory === 'all' || thread.category.id === selectedCategory)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'popular') {
        return b.viewCount - a.viewCount;
      }
      if (sortBy === 'unanswered') {
        return a.replyCount - b.replyCount;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(
              selectedCategory === category.id ? 'all' : category.id
            )}
            className={`rounded-2xl border p-4 text-left transition-all ${
              selectedCategory === category.id
                ? 'border-neon-cyan/50 bg-neon-cyan/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} text-lg`}>
                {category.icon}
              </span>
              <div>
                <p className="font-semibold text-white">{category.name}</p>
                <p className="text-xs text-gray-400">{category.threadCount} threads</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <div className="flex gap-1 rounded-full bg-white/5 p-1">
            {(['recent', 'popular', 'unanswered'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  sortBy === sort
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/forum/new"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 text-sm font-medium text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Thread
        </Link>
      </div>

      {/* Threads list */}
      <div className="space-y-3">
        {filteredThreads.map((thread) => (
          <Link
            key={thread.id}
            href={`/forum/${thread.id}`}
            className="group block rounded-2xl border border-white/10 bg-deep-space/50 p-5 transition-all hover:border-neon-cyan/30 hover:bg-deep-space/80"
          >
            <div className="flex items-start gap-4">
              {/* Author avatar */}
              <div className="hidden sm:block h-12 w-12 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                {thread.author.avatarUrl ? (
                  <Image
                    src={thread.author.avatarUrl}
                    alt={thread.author.name}
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-lg">
                    {thread.author.name[0]}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Pinned badge */}
                  {thread.isPinned && (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
                      📌 Pinned
                    </span>
                  )}
                  {/* Locked badge */}
                  {thread.isLocked && (
                    <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                      🔒 Locked
                    </span>
                  )}
                  {/* Category badge */}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${thread.category.color} text-white`}>
                    {thread.category.icon} {thread.category.name}
                  </span>
                </div>

                <h3 className="mt-2 font-semibold text-white group-hover:text-neon-cyan transition-colors line-clamp-1">
                  {thread.title}
                </h3>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{thread.excerpt}</p>

                {/* Meta */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">{thread.author.name}</span>
                    {thread.author.role && (
                      <span className="rounded bg-neon-purple/20 px-1.5 py-0.5 text-neon-purple">
                        {thread.author.role}
                      </span>
                    )}
                  </span>
                  <span>•</span>
                  <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex flex-col items-end gap-1 text-sm">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {thread.replyCount}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {thread.viewCount}
                  </span>
                </div>
                {thread.lastReply && (
                  <p className="text-xs text-gray-500">
                    Last reply by {thread.lastReply.author}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {filteredThreads.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-white/10 bg-white/5">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-gray-400">No threads found</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to start a conversation!</p>
        </div>
      )}
    </div>
  );
}
