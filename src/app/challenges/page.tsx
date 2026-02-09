import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
import { getActiveChallenges, updateChallengeStatuses } from '@/lib/challenges';
import { SITE_URL } from '@/lib/seo';
import type { ChallengeStatus } from '@prisma/client';

interface ChallengeWithCount {
  id: string;
  title: string;
  slug: string;
  theme: string;
  description: string;
  startDate: Date;
  endDate: Date;
  votingEnd: Date;
  status: ChallengeStatus;
  featured: boolean;
  _count: { entries: number };
}

export const metadata: Metadata = {
  title: 'Photo Challenges',
  description: 'Join our wildlife photography challenges. Submit your best shots, vote for favorites, and win prizes.',
  openGraph: {
    title: 'Photo Challenges | Chasing Cats Club',
    description: 'Join our wildlife photography challenges. Submit your best shots and win prizes.',
    type: 'website',
    url: `${SITE_URL}/challenges`
  },
  alternates: {
    canonical: `${SITE_URL}/challenges`
  }
};

export default async function ChallengesPage() {
  const session = await auth();
  
  // Update challenge statuses based on dates
  await updateChallengeStatuses();
  
  const challenges = await getActiveChallenges() as unknown as ChallengeWithCount[];

  const statusConfig = {
    UPCOMING: { label: 'Starting Soon', color: 'bg-blue-500/20 text-blue-400' },
    ACTIVE: { label: 'Open for Entries', color: 'bg-green-500/20 text-green-400' },
    VOTING: { label: 'Voting Open', color: 'bg-purple-500/20 text-purple-400' },
    COMPLETED: { label: 'Completed', color: 'bg-gray-500/20 text-gray-400' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight via-deep-space to-midnight">
      <div className="container-section py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-purple">
            Community Challenges
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Photo Challenges
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-white/60">
            Show off your wildlife photography skills! Submit your best shots, vote for your favorites, 
            and compete for prizes and recognition.
          </p>
        </div>

        {/* Challenges Grid */}
        {challenges.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => {
              const config = statusConfig[challenge.status];
              const daysLeft = challenge.status === 'ACTIVE' 
                ? Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : challenge.status === 'VOTING'
                ? Math.ceil((new Date(challenge.votingEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all hover:border-neon-purple/50 hover:bg-white/10"
                >
                  {/* Image placeholder */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl">📸</span>
                    </div>
                    {challenge.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-cat-eye px-3 py-1 text-xs font-bold text-black">
                          ⭐ Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white group-hover:text-neon-purple transition-colors">
                      {challenge.title}
                    </h3>
                    <p className="mt-1 text-sm text-neon-cyan">{challenge.theme}</p>
                    <p className="mt-2 text-sm text-white/60 line-clamp-2">
                      {challenge.description}
                    </p>

                    {/* Stats */}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-white/50">
                        {challenge._count.entries} {challenge._count.entries === 1 ? 'entry' : 'entries'}
                      </span>
                      {daysLeft !== null && daysLeft > 0 && (
                        <span className="text-neon-cyan">
                          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                        </span>
                      )}
                    </div>

                    {/* CTA based on status */}
                    <div className="mt-4">
                      {challenge.status === 'ACTIVE' && (
                        <span className="block w-full rounded-lg bg-gradient-to-r from-neon-purple to-neon-cyan py-2 text-center text-sm font-semibold text-black">
                          Submit Your Entry →
                        </span>
                      )}
                      {challenge.status === 'VOTING' && (
                        <span className="block w-full rounded-lg bg-neon-purple/20 py-2 text-center text-sm font-medium text-neon-purple">
                          Vote Now →
                        </span>
                      )}
                      {challenge.status === 'UPCOMING' && (
                        <span className="block w-full rounded-lg bg-white/10 py-2 text-center text-sm font-medium text-white/60">
                          Starting {new Date(challenge.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h2 className="text-xl font-semibold text-white mb-2">No Active Challenges</h2>
            <p className="text-white/60 mb-6">Check back soon for new photo challenges!</p>
            {!session && (
              <Link
                href="/join"
                className="inline-block rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-8 py-3 font-semibold text-black"
              >
                Join to Get Notified
              </Link>
            )}
          </div>
        )}

        {/* Past Winners Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">🏆 Past Winners</h2>
          <p className="text-center text-white/50">
            Winners from previous challenges will be featured here.
          </p>
        </div>
      </div>
    </div>
  );
}
