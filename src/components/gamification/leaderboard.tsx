'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    badge?: string;
  };
  score: number;
  metric: string;
  change?: number; // rank change from previous period
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
  period: 'weekly' | 'monthly' | 'allTime';
  onChangePeriod: (period: 'weekly' | 'monthly' | 'allTime') => void;
  currentUserRank?: LeaderboardEntry;
}

export function Leaderboard({ title, entries, period, onChangePeriod, currentUserRank }: LeaderboardProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayEntries = showAll ? entries : entries.slice(0, 10);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-400 text-black';
      case 3:
        return 'bg-gradient-to-br from-amber-600 to-orange-700 text-white';
      default:
        return 'bg-white/10 text-white';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🏆 {title}
          </h3>
          
          {/* Period selector */}
          <div className="flex gap-1 rounded-full bg-white/5 p-1">
            {(['weekly', 'monthly', 'allTime'] as const).map((p) => (
              <button
                key={p}
                onClick={() => onChangePeriod(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  period === p
                    ? 'bg-neon-cyan text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === 'weekly' ? 'Week' : p === 'monthly' ? 'Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="flex justify-center items-end gap-4 py-6 px-4 bg-gradient-to-b from-white/5 to-transparent">
        {/* 2nd place */}
        {entries[1] && (
          <div className="flex flex-col items-center w-24">
            <div className="relative">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-gray-400">
                {entries[1].user.avatarUrl ? (
                  <Image src={entries[1].user.avatarUrl} alt={entries[1].user.name} width={64} height={64} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-white/10 text-xl">
                    {entries[1].user.name[0]}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">🥈</span>
            </div>
            <p className="mt-4 text-sm font-medium text-white truncate w-full text-center">{entries[1].user.name}</p>
            <p className="text-xs text-gray-400">{entries[1].score.toLocaleString()}</p>
            <div className="mt-2 h-16 w-full rounded-t-lg bg-gradient-to-t from-gray-400/20 to-gray-400/10" />
          </div>
        )}

        {/* 1st place */}
        {entries[0] && (
          <div className="flex flex-col items-center w-28 -mt-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                {entries[0].user.avatarUrl ? (
                  <Image src={entries[0].user.avatarUrl} alt={entries[0].user.name} width={80} height={80} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-white/10 text-2xl">
                    {entries[0].user.name[0]}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl">🥇</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-white truncate w-full text-center">{entries[0].user.name}</p>
            <p className="text-xs text-yellow-400">{entries[0].score.toLocaleString()}</p>
            <div className="mt-2 h-24 w-full rounded-t-lg bg-gradient-to-t from-yellow-400/20 to-yellow-400/10" />
          </div>
        )}

        {/* 3rd place */}
        {entries[2] && (
          <div className="flex flex-col items-center w-24">
            <div className="relative">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-amber-600">
                {entries[2].user.avatarUrl ? (
                  <Image src={entries[2].user.avatarUrl} alt={entries[2].user.name} width={64} height={64} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-white/10 text-xl">
                    {entries[2].user.name[0]}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">🥉</span>
            </div>
            <p className="mt-4 text-sm font-medium text-white truncate w-full text-center">{entries[2].user.name}</p>
            <p className="text-xs text-gray-400">{entries[2].score.toLocaleString()}</p>
            <div className="mt-2 h-12 w-full rounded-t-lg bg-gradient-to-t from-amber-600/20 to-amber-600/10" />
          </div>
        )}
      </div>

      {/* Rest of the list */}
      <div className="px-4 pb-4">
        {displayEntries.slice(3).map((entry) => (
          <div
            key={entry.user.id}
            className={`flex items-center gap-4 rounded-xl p-3 transition-colors ${
              entry.isCurrentUser 
                ? 'bg-neon-cyan/10 border border-neon-cyan/30' 
                : 'hover:bg-white/5'
            }`}
          >
            {/* Rank */}
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankStyle(entry.rank)}`}>
              {getRankEmoji(entry.rank) || entry.rank}
            </div>

            {/* Avatar */}
            <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
              {entry.user.avatarUrl ? (
                <Image src={entry.user.avatarUrl} alt={entry.user.name} width={40} height={40} />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  {entry.user.name[0]}
                </div>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${entry.isCurrentUser ? 'text-neon-cyan' : 'text-white'}`}>
                {entry.user.name}
                {entry.isCurrentUser && ' (You)'}
              </p>
              {entry.user.badge && (
                <span className="text-xs text-gray-400">{entry.user.badge}</span>
              )}
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="font-semibold text-white">{entry.score.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{entry.metric}</p>
            </div>

            {/* Change indicator */}
            {entry.change !== undefined && entry.change !== 0 && (
              <div className={`flex items-center text-xs ${
                entry.change > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {entry.change > 0 ? '↑' : '↓'} {Math.abs(entry.change)}
              </div>
            )}
          </div>
        ))}

        {/* Current user if not in top 10 */}
        {currentUserRank && currentUserRank.rank > 10 && (
          <>
            <div className="py-2 text-center text-gray-500">• • •</div>
            <div className="flex items-center gap-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 p-3">
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
              <p className="font-semibold text-white">{currentUserRank.score.toLocaleString()}</p>
            </div>
          </>
        )}

        {/* Show more button */}
        {entries.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 w-full rounded-xl border border-white/10 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            {showAll ? 'Show Less' : `Show All (${entries.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
