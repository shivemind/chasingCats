'use client';

import Image from 'next/image';

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

interface ChallengeEntriesProps {
  entries: Entry[];
  status: string;
  showVotes: boolean;
}

export function ChallengeEntries({ entries, status, showVotes }: ChallengeEntriesProps) {
  if (entries.length === 0) return null;

  // Skip first 3 if completed (already shown as winners)
  const displayEntries = status === 'COMPLETED' ? entries.slice(3) : entries;

  if (displayEntries.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">
        {status === 'COMPLETED' ? '📷 All Entries' : '📷 Entries'}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayEntries.map((entry) => (
          <div
            key={entry.id}
            className="group rounded-xl overflow-hidden border border-white/10 bg-white/5 transition-all hover:border-white/20"
          >
            <div className="relative aspect-square">
              <Image
                src={entry.imageUrl}
                alt={entry.title || 'Entry'}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>

            <div className="p-3">
              {entry.title && <h3 className="font-medium text-white text-sm truncate">{entry.title}</h3>}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  {entry.user.image && (
                    <Image
                      src={entry.user.image}
                      alt={entry.user.name || ''}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                  <p className="text-xs text-white/50 truncate">{entry.user.name}</p>
                </div>
                {showVotes && (
                  <span className="text-xs text-neon-cyan">
                    {entry._count.votes} {entry._count.votes === 1 ? 'vote' : 'votes'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
