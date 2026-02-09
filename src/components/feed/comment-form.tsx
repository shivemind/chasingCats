'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import type { PostComment } from '@/types/feed';

type CommentFormProps = {
  postId: string;
  onCommentAdded: (comment: PostComment) => void;
};

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/feed/${postId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: body.trim() })
        });

        if (res.ok) {
          const comment = await res.json();
          onCommentAdded(comment);
          setBody('');
        }
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 min-w-0 rounded-full border border-night/10 bg-white px-3 sm:px-4 py-2 text-sm placeholder:text-night/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        disabled={isPending}
        maxLength={1000}
      />
      <Button
        type="submit"
        disabled={isPending || !body.trim()}
        className="rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm flex-shrink-0"
      >
        {isPending ? '...' : 'Post'}
      </Button>
    </form>
  );
}
