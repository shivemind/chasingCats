'use client';

import { formatDistanceToNow } from 'date-fns';
import type { PostComment } from '@/types/feed';

type CommentListProps = {
  comments: PostComment[];
};

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-emerald-300/50 italic">No comments yet. Be the first to comment!</p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2 sm:gap-3">
          <div className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 rounded-full bg-emerald-800/50 ring-1 ring-emerald-500/30 overflow-hidden">
            {(comment.author.profile?.photoUrl || comment.author.image) ? (
              <img
                src={comment.author.profile?.photoUrl || comment.author.image || ''}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-300">
                {(comment.author.name || comment.author.profile?.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-emerald-100">
                {comment.author.profile?.username || comment.author.name || 'Anonymous'}
              </span>
              <span className="text-xs text-emerald-400/50">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-emerald-100/80 break-words">{comment.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
