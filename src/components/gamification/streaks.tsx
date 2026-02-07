'use client';

import { useState, useEffect } from 'react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  weekActivity: boolean[]; // Last 7 days, [0] = 6 days ago, [6] = today
  totalDaysActive: number;
  streakRewards: { days: number; reward: string; claimed: boolean }[];
}

export function StreakDisplay({ streak }: { streak: StreakData }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animate on mount if streak is maintained today
    if (streak.weekActivity[6]) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [streak.weekActivity]);

  const isAtRisk = !streak.weekActivity[6] && streak.currentStreak > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🔥 Learning Streak
        </h3>
        {isAtRisk && (
          <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400 animate-pulse">
            ⚠️ Learn today to keep your streak!
          </span>
        )}
      </div>

      {/* Main streak number */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold text-orange-400 ${isAnimating ? 'animate-bounce' : ''}`}>
          {streak.currentStreak}
        </div>
        <p className="text-sm text-gray-400 mt-1">day streak</p>
      </div>

      {/* Week activity */}
      <div className="flex justify-between mb-6">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
          const isActive = streak.weekActivity[index];
          const isToday = index === 6;
          
          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{day}</span>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' 
                  : isToday
                  ? 'border-2 border-dashed border-orange-400/50 text-orange-400/50'
                  : 'bg-white/5 text-gray-600'
              }`}>
                {isActive ? '🔥' : isToday ? '?' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 p-3 text-center">
          <p className="text-2xl font-bold text-white">{streak.longestStreak}</p>
          <p className="text-xs text-gray-400">Longest streak</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-center">
          <p className="text-2xl font-bold text-white">{streak.totalDaysActive}</p>
          <p className="text-xs text-gray-400">Total active days</p>
        </div>
      </div>

      {/* Upcoming rewards */}
      {streak.streakRewards.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Streak Rewards</h4>
          <div className="space-y-2">
            {streak.streakRewards.slice(0, 3).map((reward) => {
              const progress = Math.min((streak.currentStreak / reward.days) * 100, 100);
              const isUnlocked = streak.currentStreak >= reward.days;
              
              return (
                <div key={reward.days} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                      : 'bg-white/10'
                  }`}>
                    {isUnlocked ? '🏆' : '🔒'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isUnlocked ? 'text-white' : 'text-gray-400'}>
                        {reward.days} days: {reward.reward}
                      </span>
                      {isUnlocked && !reward.claimed && (
                        <button className="text-xs text-neon-cyan hover:underline">
                          Claim
                        </button>
                      )}
                    </div>
                    {!isUnlocked && (
                      <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact streak badge for navbar/header
export function StreakBadge({ currentStreak, isActiveToday }: { currentStreak: number; isActiveToday: boolean }) {
  if (currentStreak === 0) return null;

  return (
    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${
      isActiveToday 
        ? 'bg-orange-500/20 text-orange-400' 
        : 'bg-orange-500/10 text-orange-400/60 animate-pulse'
    }`}>
      <span>🔥</span>
      <span>{currentStreak}</span>
    </div>
  );
}

// Streak milestone celebration
export function StreakMilestone({ days, onClose }: { days: number; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const milestones: Record<number, { emoji: string; message: string }> = {
    7: { emoji: '🌟', message: 'One week strong!' },
    14: { emoji: '⚡', message: 'Two weeks of dedication!' },
    30: { emoji: '🏆', message: 'One month milestone!' },
    60: { emoji: '💎', message: 'Two months of excellence!' },
    90: { emoji: '👑', message: 'Quarter-year champion!' },
    365: { emoji: '🎖️', message: 'One year legend!' },
  };

  const milestone = milestones[days];
  if (!milestone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="text-center animate-scale-in">
        <div className="text-8xl mb-4 animate-bounce">{milestone.emoji}</div>
        <h2 className="text-3xl font-bold text-white mb-2">{days} Day Streak!</h2>
        <p className="text-xl text-orange-400">{milestone.message}</p>
        <button
          onClick={onClose}
          className="mt-6 rounded-full bg-gradient-to-r from-orange-400 to-red-500 px-8 py-3 font-semibold text-white"
        >
          Keep Going! 🔥
        </button>
      </div>
    </div>
  );
}
