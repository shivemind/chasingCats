import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';
import { ChallengeEntryForm } from './entry-form';
import { ChallengeVoting } from './voting';
import { ChallengeEntries } from './entries';
import type { ChallengeStatus } from '@prisma/client';

interface Props {
  params: Promise<{ slug: string }>;
}

interface EntryWithUser {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null };
  _count: { votes: number };
}

interface ChallengeWithEntries {
  id: string;
  title: string;
  slug: string;
  theme: string;
  description: string;
  rules: string | null;
  startDate: Date;
  endDate: Date;
  votingEnd: Date;
  status: ChallengeStatus;
  featured: boolean;
  entries: EntryWithUser[];
  _count: { entries: number };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await prisma.photoChallenge.findUnique({
    where: { slug }
  });

  if (!challenge) {
    return { title: 'Challenge Not Found' };
  }

  return {
    title: `${challenge.title} | Photo Challenge`,
    description: challenge.description,
    openGraph: {
      title: `${challenge.title} | Photo Challenge`,
      description: challenge.description,
      type: 'website',
      url: `${SITE_URL}/challenges/${slug}`
    },
    alternates: {
      canonical: `${SITE_URL}/challenges/${slug}`
    }
  };
}

export default async function ChallengePage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const challenge = await prisma.photoChallenge.findUnique({
    where: { slug },
    include: {
      entries: {
        include: {
          user: {
            select: { id: true, name: true, image: true }
          },
          _count: {
            select: { votes: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { entries: true }
      }
    }
  }) as unknown as ChallengeWithEntries | null;

  if (!challenge) {
    notFound();
  }

  // Check if current user has already entered
  const userEntry = session?.user?.id
    ? challenge.entries.find(e => e.user.id === session.user?.id)
    : null;

  // Check if current user has voted (for voting phase)
  const userVotes = session?.user?.id
    ? await prisma.challengeVote.findMany({
        where: {
          voterId: session.user.id,
          entry: { challengeId: challenge.id }
        },
        select: { entryId: true }
      })
    : [];

  const votedEntryIds = new Set(userVotes.map(v => v.entryId));

  const statusConfig = {
    UPCOMING: { 
      label: 'Starting Soon', 
      color: 'bg-blue-500/20 text-blue-400',
      description: 'This challenge hasn\'t started yet. Check back soon!'
    },
    ACTIVE: { 
      label: 'Open for Entries', 
      color: 'bg-green-500/20 text-green-400',
      description: 'Submit your best shot before the deadline!'
    },
    VOTING: { 
      label: 'Voting Open', 
      color: 'bg-purple-500/20 text-purple-400',
      description: 'Vote for your favorite entries!'
    },
    COMPLETED: { 
      label: 'Completed', 
      color: 'bg-gray-500/20 text-gray-400',
      description: 'This challenge has ended. Check out the winners!'
    }
  };

  const config = statusConfig[challenge.status];

  // Calculate time remaining
  const now = new Date();
  const endDate = new Date(challenge.endDate);
  const votingEnd = new Date(challenge.votingEnd);
  
  const getTimeRemaining = (targetDate: Date) => {
    const diff = targetDate.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  const timeRemaining = challenge.status === 'ACTIVE' 
    ? getTimeRemaining(endDate)
    : challenge.status === 'VOTING'
    ? getTimeRemaining(votingEnd)
    : null;

  // Sort entries by votes for completed challenges
  const sortedEntries = challenge.status === 'COMPLETED' || challenge.status === 'VOTING'
    ? [...challenge.entries].sort((a, b) => b._count.votes - a._count.votes)
    : challenge.entries;

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight via-deep-space to-midnight">
      <div className="container-section py-12 sm:py-16">
        {/* Back link */}
        <Link 
          href="/challenges" 
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          ← Back to Challenges
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
            {challenge.featured && (
              <span className="rounded-full bg-cat-eye px-4 py-1.5 text-sm font-bold text-black">
                ⭐ Featured Challenge
              </span>
            )}
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            {challenge.title}
          </h1>
          <p className="text-lg text-neon-cyan mb-4">{challenge.theme}</p>
          <p className="text-white/70 max-w-3xl">{challenge.description}</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <div className="text-2xl font-bold text-white">{challenge._count.entries}</div>
            <div className="text-sm text-white/50">Entries</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {new Date(challenge.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-white/50">Started</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {new Date(challenge.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-white/50">Entries Close</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            {timeRemaining ? (
              <>
                <div className="text-2xl font-bold text-neon-cyan">
                  {timeRemaining.days}d {timeRemaining.hours}h
                </div>
                <div className="text-sm text-white/50">Remaining</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">—</div>
                <div className="text-sm text-white/50">Ended</div>
              </>
            )}
          </div>
        </div>

        {/* Rules */}
        {challenge.rules && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 mb-10">
            <h2 className="text-lg font-semibold text-white mb-3">📋 Rules & Guidelines</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-white/70 whitespace-pre-wrap">{challenge.rules}</p>
            </div>
          </div>
        )}

        {/* Status-specific content */}
        <div className="mb-10">
          {challenge.status === 'UPCOMING' && (
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-8 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold text-white mb-2">Challenge Starting Soon</h2>
              <p className="text-white/60 mb-4">
                This challenge begins on {new Date(challenge.startDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              {!session && (
                <Link
                  href="/join"
                  className="inline-block rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-2 font-semibold text-black"
                >
                  Join to Participate
                </Link>
              )}
            </div>
          )}

          {challenge.status === 'ACTIVE' && (
            <div className="space-y-8">
              {session ? (
                userEntry ? (
                  <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-6">
                    <h2 className="text-lg font-semibold text-white mb-2">✅ You've Entered!</h2>
                    <p className="text-white/60 mb-4">
                      Your entry has been submitted. Good luck!
                    </p>
                    <div className="rounded-lg overflow-hidden max-w-md">
                      <Image
                        src={userEntry.imageUrl}
                        alt={userEntry.title || 'Your entry'}
                        width={400}
                        height={300}
                        className="w-full h-auto"
                      />
                      <div className="bg-white/5 p-3">
                        {userEntry.title && <p className="font-medium text-white">{userEntry.title}</p>}
                        {userEntry.caption && (
                          <p className="text-sm text-white/60 mt-1">{userEntry.caption}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ChallengeEntryForm challengeId={challenge.id} />
                )
              ) : (
                <div className="rounded-xl bg-neon-purple/10 border border-neon-purple/30 p-8 text-center">
                  <div className="text-4xl mb-4">📸</div>
                  <h2 className="text-xl font-semibold text-white mb-2">Ready to Enter?</h2>
                  <p className="text-white/60 mb-4">
                    Sign in to submit your entry to this challenge.
                  </p>
                  <Link
                    href="/join"
                    className="inline-block rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-2 font-semibold text-black"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          )}

          {challenge.status === 'VOTING' && session && (
            <ChallengeVoting
              entries={sortedEntries}
              votedEntryIds={votedEntryIds}
              userId={session.user?.id}
            />
          )}

          {challenge.status === 'COMPLETED' && sortedEntries.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">🏆 Winners</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {sortedEntries.slice(0, 3).map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`rounded-xl overflow-hidden border ${
                      index === 0 
                        ? 'border-cat-eye bg-cat-eye/10' 
                        : index === 1
                        ? 'border-gray-400 bg-gray-400/10'
                        : 'border-orange-600 bg-orange-600/10'
                    }`}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={entry.imageUrl}
                        alt={entry.title || 'Entry'}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`rounded-full px-3 py-1 text-lg font-bold ${
                          index === 0 ? 'bg-cat-eye text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          'bg-orange-600 text-white'
                        }`}>
                          {index === 0 ? '🥇 1st' : index === 1 ? '🥈 2nd' : '🥉 3rd'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      {entry.title && <h3 className="font-semibold text-white">{entry.title}</h3>}
                      <p className="text-sm text-white/60 mt-1">by {entry.user.name}</p>
                      <p className="text-sm text-neon-cyan mt-2">{entry._count.votes} votes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* All Entries */}
        {challenge.entries.length > 0 && (
          <ChallengeEntries 
            entries={sortedEntries} 
            status={challenge.status}
            showVotes={challenge.status === 'VOTING' || challenge.status === 'COMPLETED'}
          />
        )}
      </div>
    </div>
  );
}
