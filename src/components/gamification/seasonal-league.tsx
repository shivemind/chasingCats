'use client';

import Image from 'next/image';

interface LeagueTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints: number;
  rewards: string[];
}

interface SeasonInfo {
  id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  currentTier: LeagueTier;
  currentPoints: number;
  rank: number;
  totalParticipants: number;
}

const LEAGUE_TIERS: LeagueTier[] = [
  { id: 'bronze', name: 'Bronze', icon: '🥉', color: 'from-amber-700 to-orange-800', minPoints: 0, maxPoints: 500, rewards: ['Bronze Badge'] },
  { id: 'silver', name: 'Silver', icon: '🥈', color: 'from-gray-300 to-gray-500', minPoints: 500, maxPoints: 1500, rewards: ['Silver Badge', 'Exclusive Preset'] },
  { id: 'gold', name: 'Gold', icon: '🥇', color: 'from-yellow-400 to-amber-500', minPoints: 1500, maxPoints: 3000, rewards: ['Gold Badge', 'Premium Preset Pack', '1 Month Free'] },
  { id: 'platinum', name: 'Platinum', icon: '💎', color: 'from-cyan-300 to-blue-500', minPoints: 3000, maxPoints: 5000, rewards: ['Platinum Badge', 'All Presets', '3 Months Free'] },
  { id: 'diamond', name: 'Diamond', icon: '👑', color: 'from-purple-400 to-pink-500', minPoints: 5000, maxPoints: Infinity, rewards: ['Diamond Crown', 'Lifetime Perks', 'Custom Title', 'Featured Profile'] },
];

function getTierFromPoints(points: number): LeagueTier {
  return LEAGUE_TIERS.find(t => points >= t.minPoints && points < t.maxPoints) || LEAGUE_TIERS[LEAGUE_TIERS.length - 1];
}

// Season overview card
export function SeasonOverview({ season }: { season: SeasonInfo }) {
  const daysLeft = Math.ceil((new Date(season.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const tier = getTierFromPoints(season.currentPoints);
  const nextTier = LEAGUE_TIERS[LEAGUE_TIERS.indexOf(tier) + 1];
  const progressToNext = nextTier 
    ? ((season.currentPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100
    : 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-deep-space to-midnight overflow-hidden">
      {/* Header */}
      <div className="relative p-6 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10">
        <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
          <span>⏰</span>
          <span className="text-white">{daysLeft} days left</span>
        </div>
        
        <p className="text-xs uppercase tracking-wider text-neon-cyan">Current Season</p>
        <h2 className="text-2xl font-bold text-white mt-1">{season.name}</h2>
        <p className="text-sm text-gray-400">{season.theme}</p>
      </div>

      {/* Current tier */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${tier.color} shadow-lg`}>
            <span className="text-4xl">{tier.icon}</span>
          </div>
          <div className="flex-1">
            <p className={`text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
              {tier.name} League
            </p>
            <p className="text-sm text-gray-400">
              Rank #{season.rank} of {season.totalParticipants.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{season.currentPoints.toLocaleString()}</p>
            <p className="text-sm text-gray-400">points</p>
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Progress to {nextTier.name}</span>
              <span className="text-white">
                {nextTier.minPoints - season.currentPoints} pts to go
              </span>
            </div>
            <div className="relative h-4 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${tier.color}`}
                style={{ width: `${progressToNext}%` }}
              />
              {/* Tier markers */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 pr-2">
                <span className="text-sm">{nextTier.icon}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current tier rewards */}
      <div className="border-t border-white/10 p-6">
        <p className="text-sm font-medium text-gray-400 mb-3">Your Tier Rewards</p>
        <div className="flex flex-wrap gap-2">
          {tier.rewards.map((reward, i) => (
            <span 
              key={i}
              className={`rounded-full px-3 py-1 text-xs font-medium bg-gradient-to-r ${tier.color} text-white`}
            >
              {reward}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// All tiers display
export function LeagueTiersDisplay({ currentPoints }: { currentPoints: number }) {
  const currentTier = getTierFromPoints(currentPoints);

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">League Tiers</h3>
      
      <div className="space-y-4">
        {LEAGUE_TIERS.map((tier) => {
          const isCurrentTier = tier.id === currentTier.id;
          const isUnlocked = currentPoints >= tier.minPoints;
          const isNext = LEAGUE_TIERS[LEAGUE_TIERS.indexOf(currentTier) + 1]?.id === tier.id;

          return (
            <div 
              key={tier.id}
              className={`relative rounded-xl p-4 transition-all ${
                isCurrentTier 
                  ? `bg-gradient-to-r ${tier.color} bg-opacity-20 border-2 border-white/30` 
                  : isUnlocked 
                  ? 'bg-white/5' 
                  : 'bg-white/5 opacity-50'
              }`}
            >
              {isCurrentTier && (
                <div className="absolute -top-2 -right-2 rounded-full bg-neon-cyan px-2 py-0.5 text-[10px] font-bold text-black">
                  YOU ARE HERE
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  isUnlocked ? `bg-gradient-to-br ${tier.color}` : 'bg-white/10'
                }`}>
                  <span className="text-2xl">{isUnlocked ? tier.icon : '🔒'}</span>
                </div>
                
                <div className="flex-1">
                  <p className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {tier.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {tier.minPoints.toLocaleString()}+ points
                  </p>
                </div>

                <div className="text-right">
                  {isNext && (
                    <p className="text-xs text-neon-cyan">
                      {tier.minPoints - currentPoints} pts away
                    </p>
                  )}
                  {isUnlocked && !isCurrentTier && (
                    <span className="text-green-400 text-sm">✓</span>
                  )}
                </div>
              </div>

              {/* Rewards preview */}
              <div className="mt-3 flex flex-wrap gap-1">
                {tier.rewards.map((reward, i) => (
                  <span 
                    key={i}
                    className={`rounded px-2 py-0.5 text-[10px] ${
                      isUnlocked ? 'bg-white/10 text-gray-300' : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    {reward}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Season leaderboard
interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  points: number;
  tier: LeagueTier;
  isCurrentUser?: boolean;
}

export function SeasonLeaderboard({ entries, currentUserRank }: { entries: LeaderboardEntry[]; currentUserRank?: LeaderboardEntry }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden">
      <div className="border-b border-white/10 bg-white/5 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Season Leaderboard</h3>
      </div>

      <div className="p-4 space-y-2">
        {entries.slice(0, 10).map((entry) => (
          <div 
            key={entry.user.id}
            className={`flex items-center gap-3 rounded-xl p-3 ${
              entry.isCurrentUser ? 'bg-neon-cyan/10 border border-neon-cyan/30' : 'hover:bg-white/5'
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              entry.rank === 1 ? 'bg-yellow-400 text-black' :
              entry.rank === 2 ? 'bg-gray-300 text-black' :
              entry.rank === 3 ? 'bg-amber-600 text-white' :
              'bg-white/10 text-white'
            }`}>
              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
            </div>

            <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10">
              {entry.user.avatarUrl ? (
                <Image src={entry.user.avatarUrl} alt={entry.user.name} width={40} height={40} />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  {entry.user.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className={`font-medium ${entry.isCurrentUser ? 'text-neon-cyan' : 'text-white'}`}>
                {entry.user.name}
                {entry.isCurrentUser && ' (You)'}
              </p>
              <p className="text-xs text-gray-400">{entry.tier.name}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg">{entry.tier.icon}</span>
              <span className="font-bold text-white">{entry.points.toLocaleString()}</span>
            </div>
          </div>
        ))}

        {/* Current user if not in top 10 */}
        {currentUserRank && currentUserRank.rank > 10 && (
          <>
            <div className="py-2 text-center text-gray-500">• • •</div>
            <div className="flex items-center gap-3 rounded-xl p-3 bg-neon-cyan/10 border border-neon-cyan/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                {currentUserRank.rank}
              </div>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10">
                {currentUserRank.user.avatarUrl ? (
                  <Image src={currentUserRank.user.avatarUrl} alt="You" width={40} height={40} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    {currentUserRank.user.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-neon-cyan">{currentUserRank.user.name} (You)</p>
              </div>
              <span className="font-bold text-white">{currentUserRank.points.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Season end countdown banner
export function SeasonEndBanner({ endDate }: { endDate: string }) {
  const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysLeft > 7) return null;

  return (
    <div className="rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-pulse">⏰</span>
        <div>
          <p className="font-semibold text-white">Season ending soon!</p>
          <p className="text-sm text-orange-400">{daysLeft} days left to climb the ranks</p>
        </div>
      </div>
    </div>
  );
}
