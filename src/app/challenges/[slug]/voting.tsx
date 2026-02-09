'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Entry {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    votes: number;
  };
}

interface ChallengeVotingProps {
  entries: Entry[];
  votedEntryIds: Set<string>;
  userId?: string;
}

export function ChallengeVoting({ entries, votedEntryIds, userId }: ChallengeVotingProps) {
  const router = useRouter();
  const [voting, setVoting] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(votedEntryIds);

  const handleVote = async (entryId: string) => {
    if (!userId) return;
    if (voted.has(entryId)) return;

    setVoting(entryId);

    try {
      const response = await fetch('/api/challenges/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId })
      });

      if (response.ok) {
        setVoted(prev => new Set([...prev, entryId]));
        router.refresh();
      }
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVoting(null);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-8 text-center">
        <div className="text-4xl mb-4">🗳️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Voting is Open!</h2>
        <p className="text-white/60">No entries to vote on yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">🗳️ Vote for Your Favorites</h2>
        <p className="text-white/60">
          Click the vote button on entries you love. You can vote for multiple entries!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => {
          const hasVoted = voted.has(entry.id);
          const isOwnEntry = entry.user.id === userId;

          return (
            <div
              key={entry.id}
              className={`rounded-xl overflow-hidden border transition-all ${
                hasVoted
                  ? 'border-neon-purple bg-neon-purple/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={entry.imageUrl}
                  alt={entry.title || 'Entry'}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                {entry.title && <h3 className="font-semibold text-white">{entry.title}</h3>}
                <div className="flex items-center gap-2 mt-2">
                  {entry.user.image && (
                    <Image
                      src={entry.user.image}
                      alt={entry.user.name || ''}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  )}
                  <p className="text-sm text-white/60">{entry.user.name}</p>
                </div>
                
                {entry.caption && (
                  <p className="text-sm text-white/50 mt-2 line-clamp-2">{entry.caption}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-neon-cyan">
                    {entry._count.votes} {entry._count.votes === 1 ? 'vote' : 'votes'}
                  </span>

                  {isOwnEntry ? (
                    <span className="text-sm text-white/40">Your entry</span>
                  ) : (
                    <button
                      onClick={() => handleVote(entry.id)}
                      disabled={hasVoted || voting === entry.id}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                        hasVoted
                          ? 'bg-neon-purple/30 text-neon-purple cursor-default'
                          : 'bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30'
                      }`}
                    >
                      {voting === entry.id ? '...' : hasVoted ? '✓ Voted' : 'Vote'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
