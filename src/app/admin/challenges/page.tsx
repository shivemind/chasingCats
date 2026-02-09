import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { updateChallengeStatuses } from '@/lib/challenges';
import { CreateChallengeForm } from './create-form';
import type { Prisma } from '@prisma/client';

type ChallengeWithCount = Prisma.PhotoChallengeGetPayload<{
  include: { _count: { select: { entries: true } } };
}>;

export default async function AdminChallengesPage() {
  // Update statuses based on dates
  await updateChallengeStatuses();

  const challenges = await prisma.photoChallenge.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { entries: true }
      }
    }
  }) as ChallengeWithCount[];

  const statusConfig = {
    UPCOMING: { label: 'Upcoming', color: 'bg-blue-500/20 text-blue-400' },
    ACTIVE: { label: 'Active', color: 'bg-green-500/20 text-green-400' },
    VOTING: { label: 'Voting', color: 'bg-purple-500/20 text-purple-400' },
    COMPLETED: { label: 'Completed', color: 'bg-gray-500/20 text-gray-400' }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Photo Challenges</h1>
        <p className="text-white/60 mt-1">Create and manage photo challenges for your community</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{challenges.length}</div>
          <div className="text-sm text-white/50">Total Challenges</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-green-400">
            {challenges.filter(c => c.status === 'ACTIVE').length}
          </div>
          <div className="text-sm text-white/50">Active</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-purple-400">
            {challenges.filter(c => c.status === 'VOTING').length}
          </div>
          <div className="text-sm text-white/50">In Voting</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-neon-cyan">
            {challenges.reduce((sum, c) => sum + c._count.entries, 0)}
          </div>
          <div className="text-sm text-white/50">Total Entries</div>
        </div>
      </div>

      {/* Create Challenge Form */}
      <CreateChallengeForm />

      {/* Challenges List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">All Challenges</h2>
        
        {challenges.length === 0 ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center">
            <p className="text-white/50">No challenges yet. Create your first challenge above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const config = statusConfig[challenge.status];
              
              return (
                <div
                  key={challenge.id}
                  className="rounded-xl bg-white/5 border border-white/10 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white">{challenge.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${config.color}`}>
                          {config.label}
                        </span>
                        {challenge.featured && (
                          <span className="rounded-full bg-cat-eye px-2 py-0.5 text-xs font-bold text-black">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neon-cyan mt-1">{challenge.theme}</p>
                      <p className="text-sm text-white/50 mt-1 line-clamp-1">{challenge.description}</p>
                      
                      <div className="flex items-center gap-6 mt-3 text-xs text-white/50">
                        <span>
                          Start: {new Date(challenge.startDate).toLocaleDateString()}
                        </span>
                        <span>
                          End: {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                        <span>
                          Voting: {new Date(challenge.votingEnd).toLocaleDateString()}
                        </span>
                        <span className="text-neon-cyan">
                          {challenge._count.entries} entries
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/challenges/${challenge.slug}`}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition-colors"
                        target="_blank"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/challenges/${challenge.id}`}
                        className="rounded-lg bg-neon-purple/20 px-3 py-1.5 text-sm text-neon-purple hover:bg-neon-purple/30 transition-colors"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
