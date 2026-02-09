import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = {
  title: 'Gamification | Admin'
};

interface StreakWithUser {
  id: string;
  currentStreak: number;
  user: { name: string | null; email: string | null };
}

interface XPWithUser {
  id: string;
  totalXP: number;
  level: number;
  user: { name: string | null; email: string | null };
}

export default async function AdminGamificationPage() {
  // Get gamification stats
  const totalStreaks = await prisma.userStreak.count();
  const activeStreaks = await prisma.userStreak.count({ where: { currentStreak: { gt: 0 } } });
  const totalMissions = await prisma.userMission.count({ where: { expiresAt: { gte: new Date() } } });
  const completedMissions = await prisma.userMission.count({ where: { isCompleted: true, expiresAt: { gte: new Date() } } });
  const claimedMissions = await prisma.userMission.count({ where: { isClaimed: true, expiresAt: { gte: new Date() } } });
  const totalXP = await prisma.userXP.aggregate({ _sum: { totalXP: true } });
  
  const topStreakers: StreakWithUser[] = await prisma.userStreak.findMany({
    where: { currentStreak: { gt: 0 } },
    orderBy: { currentStreak: 'desc' },
    take: 10,
    include: { user: { select: { name: true, email: true } } }
  }) as unknown as StreakWithUser[];

  const topEarners: XPWithUser[] = await prisma.userXP.findMany({
    orderBy: { totalXP: 'desc' },
    take: 10,
    include: { user: { select: { name: true, email: true } } }
  }) as unknown as XPWithUser[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Gamification</h1>
        <p className="mt-2 text-white/60">Manage streaks, missions, and XP rewards</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6">
          <p className="text-sm font-medium text-white/60">Active Streaks</p>
          <p className="mt-2 text-3xl font-bold text-orange-400">{activeStreaks}</p>
          <p className="text-xs text-white/40">of {totalStreaks} total users</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6">
          <p className="text-sm font-medium text-white/60">Active Missions</p>
          <p className="mt-2 text-3xl font-bold text-neon-cyan">{totalMissions}</p>
          <p className="text-xs text-white/40">{completedMissions} completed</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6">
          <p className="text-sm font-medium text-white/60">Claimed Rewards</p>
          <p className="mt-2 text-3xl font-bold text-green-400">{claimedMissions}</p>
          <p className="text-xs text-white/40">missions claimed</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6">
          <p className="text-sm font-medium text-white/60">Total XP Earned</p>
          <p className="mt-2 text-3xl font-bold text-neon-purple">{(totalXP._sum.totalXP || 0).toLocaleString()}</p>
          <p className="text-xs text-white/40">across all users</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Streakers */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              🔥 Top Streakers
            </h2>
          </div>
          <div className="space-y-3">
            {topStreakers.length === 0 ? (
              <p className="text-white/50">No active streaks yet</p>
            ) : (
              topStreakers.map((streak, index) => (
                <div
                  key={streak.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{streak.user.name || 'Anonymous'}</p>
                      <p className="text-xs text-white/50">{streak.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-400">{streak.currentStreak}</p>
                    <p className="text-xs text-white/40">day streak</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top XP Earners */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              ⭐ Top XP Earners
            </h2>
          </div>
          <div className="space-y-3">
            {topEarners.length === 0 ? (
              <p className="text-white/50">No XP earned yet</p>
            ) : (
              topEarners.map((xp, index) => (
                <div
                  key={xp.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{xp.user.name || 'Anonymous'}</p>
                      <p className="text-xs text-white/50">Level {xp.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neon-purple">{xp.totalXP.toLocaleString()}</p>
                    <p className="text-xs text-white/40">XP</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mission Configuration */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Mission Configuration</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-medium text-neon-cyan mb-2">Daily Missions</h3>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• Watch videos (1-3)</li>
              <li>• Leave comments (1-3)</li>
              <li>• Post to Pride Feed</li>
              <li>• React to posts (5)</li>
            </ul>
            <p className="mt-2 text-xs text-white/40">3 random missions per day</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-medium text-neon-purple mb-2">Weekly Missions</h3>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• Watch 10 videos</li>
              <li>• Complete 5 path items</li>
              <li>• Leave 10 comments</li>
              <li>• Maintain 7-day streak</li>
            </ul>
            <p className="mt-2 text-xs text-white/40">3 random missions per week</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-medium text-cat-eye mb-2">Streak Rewards</h3>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• 3 days: Bronze Badge (+50 XP)</li>
              <li>• 7 days: Silver Badge (+100 XP)</li>
              <li>• 30 days: Diamond Badge (+500 XP)</li>
              <li>• 365 days: Year Badge (+5000 XP)</li>
            </ul>
            <p className="mt-2 text-xs text-white/40">Automatic rewards</p>
          </div>
        </div>
      </div>

      {/* XP Level Configuration */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">XP Level Thresholds</h2>
        <div className="flex flex-wrap gap-2">
          {[100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000].map((xp, i) => (
            <div key={i} className="rounded-lg bg-white/10 px-3 py-1 text-sm">
              <span className="text-neon-cyan font-medium">Lv.{i + 1}</span>
              <span className="text-white/60 ml-2">{xp.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
