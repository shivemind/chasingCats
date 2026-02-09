'use client';

import { useState, useCallback } from 'react';
import { PostCard } from './post-card';
import { CreatePostForm } from './create-post-form';
import type { FeedPost } from '@/types/feed';

type FeedListProps = {
  initialPosts: FeedPost[];
  initialCursor?: string;
  currentUserId: string;
  isAdmin?: boolean;
  hasPaidAccess?: boolean;
};

export function FeedList({ initialPosts, initialCursor, currentUserId, isAdmin = false, hasPaidAccess = false }: FeedListProps) {
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
      <CreatePostForm onPostCreated={handlePostCreated} hasPaidAccess={hasPaidAccess} />

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-night/10 bg-white p-8 sm:p-12 text-center">
          <div className="text-4xl mb-4">🐱</div>
          <p className="text-lg font-semibold text-night">The feed is empty!</p>
          <p className="mt-2 text-sm text-night/60">
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
                className="rounded-full bg-night/5 px-6 py-3 text-sm font-semibold text-night hover:bg-night/10 transition-colors disabled:opacity-50"
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
