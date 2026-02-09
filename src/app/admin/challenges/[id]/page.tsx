import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { DeleteEntryButton } from './delete-entry-button';
import { ChallengeStatusForm } from './status-form';
import type { Prisma } from '@prisma/client';

interface Props {
  params: Promise<{ id: string }>;
}

type ChallengeWithEntries = Prisma.PhotoChallengeGetPayload<{
  include: {
    entries: {
      include: {
        user: { select: { id: true; name: true; email: true; image: true } };
        _count: { select: { votes: true } };
      };
    };
    _count: { select: { entries: true } };
  };
}>;

export default async function AdminChallengePage({ params }: Props) {
  const { id } = await params;

  const challenge = await prisma.photoChallenge.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true }
          },
          _count: {
            select: { votes: true }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ]
      },
      _count: {
        select: { entries: true }
      }
    }
  }) as ChallengeWithEntries | null;

  if (!challenge) {
    notFound();
  }

  // Sort entries by votes
  const sortedEntries = [...challenge.entries].sort((a, b) => b._count.votes - a._count.votes);

  const statusConfig = {
    UPCOMING: { label: 'Upcoming', color: 'bg-blue-500/20 text-blue-400' },
    ACTIVE: { label: 'Active', color: 'bg-green-500/20 text-green-400' },
    VOTING: { label: 'Voting', color: 'bg-purple-500/20 text-purple-400' },
    COMPLETED: { label: 'Completed', color: 'bg-gray-500/20 text-gray-400' }
  };

  const config = statusConfig[challenge.status];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link 
            href="/admin/challenges" 
            className="text-white/50 hover:text-white text-sm mb-2 inline-block"
          >
            ← Back to Challenges
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
            <span className={`rounded-full px-3 py-1 text-sm ${config.color}`}>
              {config.label}
            </span>
            {challenge.featured && (
              <span className="rounded-full bg-cat-eye px-3 py-1 text-sm font-bold text-black">
                Featured
              </span>
            )}
          </div>
          <p className="text-neon-cyan mt-1">{challenge.theme}</p>
        </div>

        <Link
          href={`/challenges/${challenge.slug}`}
          target="_blank"
          className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
        >
          View Public Page →
        </Link>
      </div>

      {/* Challenge Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="font-semibold text-white">Challenge Details</h2>
          
          <div>
            <div className="text-sm text-white/50 mb-1">Description</div>
            <p className="text-white/80">{challenge.description}</p>
          </div>

          {challenge.rules && (
            <div>
              <div className="text-sm text-white/50 mb-1">Rules</div>
              <p className="text-white/80 whitespace-pre-wrap">{challenge.rules}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <div className="text-sm text-white/50">Start Date</div>
              <div className="text-white">{new Date(challenge.startDate).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-white/50">Submissions End</div>
              <div className="text-white">{new Date(challenge.endDate).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-white/50">Voting End</div>
              <div className="text-white">{new Date(challenge.votingEnd).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Status Control */}
        <ChallengeStatusForm challenge={challenge} />
      </div>

      {/* Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Entries ({challenge._count.entries})
          </h2>
        </div>

        {sortedEntries.length === 0 ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center">
            <p className="text-white/50">No entries yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="rounded-xl bg-white/5 border border-white/10 p-4"
              >
                <div className="flex gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className={`text-lg font-bold ${
                      index === 0 ? 'text-cat-eye' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-500' :
                      'text-white/30'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={entry.imageUrl}
                      alt={entry.title || 'Entry'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {entry.title && <h3 className="font-semibold text-white truncate">{entry.title}</h3>}
                    
                    <div className="flex items-center gap-2 mt-1">
                      {entry.user.image && (
                        <Image
                          src={entry.user.image}
                          alt={entry.user.name || ''}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )}
                      <span className="text-sm text-white/60">{entry.user.name}</span>
                      <span className="text-sm text-white/40">{entry.user.email}</span>
                    </div>

                    {entry.caption && (
                      <p className="text-sm text-white/50 mt-2 line-clamp-2">{entry.caption}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-neon-cyan font-medium">
                        {entry._count.votes} votes
                      </span>
                      <span className="text-white/40">
                        Submitted {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <DeleteEntryButton entryId={entry.id} entryTitle={entry.title || 'Entry'} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
