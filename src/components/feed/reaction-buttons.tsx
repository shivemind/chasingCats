'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import type { ReactionCounts } from '@/types/feed';

type ReactionButtonsProps = {
  postId: string;
  initialCounts: ReactionCounts;
  initialUserReaction: 'PURR' | 'ROAR' | null;
  disabled?: boolean;
  disabledReason?: 'not-logged-in' | 'no-paid-access';
  onReactionChange?: (counts: ReactionCounts, userReaction: 'PURR' | 'ROAR' | null) => void;
};

export function ReactionButtons({
  postId,
  initialCounts,
  initialUserReaction,
  disabled = false,
  disabledReason,
  onReactionChange
}: ReactionButtonsProps) {
  const disabledTitle = disabledReason === 'not-logged-in' 
    ? 'Sign in to react' 
    : disabledReason === 'no-paid-access' 
    ? 'Upgrade to react' 
    : undefined;
  const [counts, setCounts] = useState(initialCounts);
  const [userReaction, setUserReaction] = useState(initialUserReaction);
  const [isPending, startTransition] = useTransition();

  const handleReaction = (type: 'PURR' | 'ROAR') => {
    if (disabled) return;
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
        disabled={isPending || disabled}
        className={cn(
          'flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all',
          userReaction === 'PURR'
            ? 'bg-amber-500/30 text-amber-300 hover:bg-amber-500/40'
            : 'bg-emerald-800/50 text-emerald-300/70 hover:bg-emerald-700/50 hover:text-emerald-200',
          (isPending || disabled) && 'opacity-50 cursor-not-allowed',
          !disabled && 'active:scale-95'
        )}
        title={disabled ? disabledTitle : 'Purr (like)'}
      >
        <span className="text-sm sm:text-base">🐱</span>
        <span>{counts.purrs}</span>
      </button>

      {/* Roar (super like) button */}
      <button
        onClick={() => handleReaction('ROAR')}
        disabled={isPending || disabled}
        className={cn(
          'flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all',
          userReaction === 'ROAR'
            ? 'bg-orange-500/30 text-orange-300 hover:bg-orange-500/40'
            : 'bg-emerald-800/50 text-emerald-300/70 hover:bg-emerald-700/50 hover:text-emerald-200',
          (isPending || disabled) && 'opacity-50 cursor-not-allowed',
          !disabled && 'active:scale-95'
        )}
        title={disabled ? disabledTitle : 'Roar (super like)'}
      >
        <span className="text-sm sm:text-base">🦁</span>
        <span>{counts.roars}</span>
      </button>
    </div>
  );
}
