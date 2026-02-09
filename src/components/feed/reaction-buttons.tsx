'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import type { ReactionCounts } from '@/types/feed';

type ReactionButtonsProps = {
  postId: string;
  initialCounts: ReactionCounts;
  initialUserReaction: 'PURR' | 'ROAR' | null;
  onReactionChange?: (counts: ReactionCounts, userReaction: 'PURR' | 'ROAR' | null) => void;
};

export function ReactionButtons({
  postId,
  initialCounts,
  initialUserReaction,
  onReactionChange
}: ReactionButtonsProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [userReaction, setUserReaction] = useState(initialUserReaction);
  const [isPending, startTransition] = useTransition();

  const handleReaction = (type: 'PURR' | 'ROAR') => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/feed/${postId}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type })
        });

        if (res.ok) {
          const data = await res.json();
          setCounts(data.reactionCounts);
          setUserReaction(data.userReaction);
          onReactionChange?.(data.reactionCounts, data.userReaction);
        }
      } catch (error) {
        console.error('Failed to react:', error);
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Purr (like) button */}
      <button
        onClick={() => handleReaction('PURR')}
        disabled={isPending}
        className={cn(
          'flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-95',
          userReaction === 'PURR'
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            : 'bg-night/5 text-night/70 hover:bg-night/10 hover:text-night',
          isPending && 'opacity-50 cursor-not-allowed'
        )}
        title="Purr (like)"
      >
        <span className="text-sm sm:text-base">🐱</span>
        <span>{counts.purrs}</span>
      </button>

      {/* Roar (super like) button */}
      <button
        onClick={() => handleReaction('ROAR')}
        disabled={isPending}
        className={cn(
          'flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-95',
          userReaction === 'ROAR'
            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            : 'bg-night/5 text-night/70 hover:bg-night/10 hover:text-night',
          isPending && 'opacity-50 cursor-not-allowed'
        )}
        title="Roar (super like)"
      >
        <span className="text-sm sm:text-base">🦁</span>
        <span>{counts.roars}</span>
      </button>
    </div>
  );
}
