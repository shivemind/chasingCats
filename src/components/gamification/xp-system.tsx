'use client';

import { useState, useEffect } from 'react';

interface Level {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
  perks: string[];
}

const LEVELS: Level[] = [
  { level: 1, title: 'Cub', minXP: 0, maxXP: 100, icon: '🐱', color: 'from-gray-400 to-gray-500', perks: ['Access to community'] },
  { level: 2, title: 'Kitten', minXP: 100, maxXP: 300, icon: '😺', color: 'from-green-400 to-emerald-500', perks: ['Custom profile badge'] },
  { level: 3, title: 'Hunter', minXP: 300, maxXP: 600, icon: '🐈', color: 'from-blue-400 to-cyan-500', perks: ['Early access to events'] },
  { level: 4, title: 'Stalker', minXP: 600, maxXP: 1000, icon: '🐆', color: 'from-purple-400 to-violet-500', perks: ['Exclusive content'] },
  { level: 5, title: 'Prowler', minXP: 1000, maxXP: 1500, icon: '🐅', color: 'from-orange-400 to-amber-500', perks: ['Priority support'] },
  { level: 6, title: 'Shadow', minXP: 1500, maxXP: 2200, icon: '🐈‍⬛', color: 'from-indigo-400 to-purple-500', perks: ['Mentor access'] },
  { level: 7, title: 'Predator', minXP: 2200, maxXP: 3000, icon: '🦁', color: 'from-red-400 to-rose-500', perks: ['VIP events'] },
  { level: 8, title: 'Alpha', minXP: 3000, maxXP: 4000, icon: '👑', color: 'from-yellow-400 to-amber-500', perks: ['Featured profile'] },
  { level: 9, title: 'Apex', minXP: 4000, maxXP: 5500, icon: '⚡', color: 'from-neon-cyan to-neon-purple', perks: ['All perks unlocked'] },
  { level: 10, title: 'Apex Predator', minXP: 5500, maxXP: Infinity, icon: '🏆', color: 'from-cat-eye to-amber-400', perks: ['Legendary status', 'Custom title'] },
];

export interface UserXP {
  currentXP: number;
  totalXP: number;
  level: number;
  xpToday: number;
  xpHistory: { date: string; amount: number; source: string }[];
}

// Get level from XP
export function getLevelFromXP(xp: number): Level {
  return LEVELS.find(l => xp >= l.minXP && xp < l.maxXP) || LEVELS[LEVELS.length - 1];
}

// Main XP display component
export function XPDisplay({ userXP, compact = false }: { userXP: UserXP; compact?: boolean }) {
  const level = getLevelFromXP(userXP.totalXP);
  const nextLevel = LEVELS[level.level] || level;
  const progress = level.maxXP === Infinity 
    ? 100 
    : ((userXP.totalXP - level.minXP) / (level.maxXP - level.minXP)) * 100;
  const xpToNext = level.maxXP === Infinity ? 0 : level.maxXP - userXP.totalXP;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${level.color}`}>
          <span className="text-sm">{level.icon}</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{level.title}</p>
          <p className="text-xs text-gray-400">{userXP.totalXP.toLocaleString()} XP</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-deep-space to-midnight p-6">
      {/* Level header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${level.color} shadow-lg`}>
          <span className="text-3xl">{level.icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-400">Level {level.level}</p>
          <h3 className={`text-2xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
            {level.title}
          </h3>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-white">{userXP.totalXP.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Total XP</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Progress to {nextLevel.title}</span>
          <span className="text-neon-cyan font-medium">{xpToNext > 0 ? `${xpToNext} XP to go` : 'Max level!'}</span>
        </div>
        <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${level.color} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Today's XP */}
      <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-gray-400">Today&apos;s XP</span>
        </div>
        <span className="text-xl font-bold text-neon-cyan">+{userXP.xpToday}</span>
      </div>
    </div>
  );
}

// XP gain notification
export function XPGainNotification({ amount, source, onClose }: { amount: number; source: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-slide-up">
      <div className="flex items-center gap-3 rounded-2xl border border-neon-cyan/30 bg-deep-space/95 backdrop-blur-md px-5 py-3 shadow-[0_0_20px_rgba(0,245,212,0.2)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-cyan/20 animate-pulse">
          <span className="text-xl">⚡</span>
        </div>
        <div>
          <p className="text-lg font-bold text-neon-cyan">+{amount} XP</p>
          <p className="text-xs text-gray-400">{source}</p>
        </div>
      </div>
    </div>
  );
}

// Level up celebration
export function LevelUpCelebration({ newLevel, onClose }: { newLevel: Level; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="text-center animate-scale-in">
        {/* Confetti effect placeholder */}
        <div className="relative">
          <div className={`mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${newLevel.color} shadow-[0_0_60px_rgba(0,245,212,0.4)] animate-bounce`}>
            <span className="text-6xl">{newLevel.icon}</span>
          </div>
          <div className="absolute -top-4 -left-4 text-4xl animate-spin">✨</div>
          <div className="absolute -top-4 -right-4 text-4xl animate-spin" style={{ animationDelay: '0.5s' }}>✨</div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-4xl animate-bounce">🎉</div>
        </div>
        
        <h2 className="mt-8 text-3xl font-bold text-white">Level Up!</h2>
        <p className={`mt-2 text-2xl font-bold bg-gradient-to-r ${newLevel.color} bg-clip-text text-transparent`}>
          {newLevel.title}
        </p>
        <p className="mt-4 text-gray-400">You&apos;ve reached Level {newLevel.level}</p>
        
        {/* New perks */}
        <div className="mt-6 rounded-xl bg-white/5 p-4 max-w-xs mx-auto">
          <p className="text-sm text-gray-400 mb-2">New Perk Unlocked:</p>
          <p className="text-neon-cyan font-medium">{newLevel.perks[0]}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-8 py-3 font-semibold text-white"
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
}

// XP breakdown/history
export function XPHistory({ history }: { history: UserXP['xpHistory'] }) {
  const grouped = history.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof history>);

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">XP History</h3>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {Object.entries(grouped).slice(0, 7).map(([date, items]) => (
          <div key={date}>
            <p className="text-xs text-gray-500 mb-2">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-sm text-gray-400">{item.source}</span>
                  <span className="text-sm font-semibold text-neon-cyan">+{item.amount} XP</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// XP actions reference
export const XP_ACTIONS = {
  WATCH_VIDEO: { amount: 10, source: 'Watched a video' },
  COMPLETE_VIDEO: { amount: 25, source: 'Completed a video' },
  COMPLETE_COURSE: { amount: 100, source: 'Completed a course' },
  PASS_QUIZ: { amount: 50, source: 'Passed a quiz' },
  DAILY_LOGIN: { amount: 5, source: 'Daily login' },
  STREAK_BONUS: { amount: 15, source: 'Streak bonus' },
  COMMENT: { amount: 3, source: 'Left a comment' },
  HELPFUL_COMMENT: { amount: 10, source: 'Helpful comment' },
  PHOTO_UPLOAD: { amount: 15, source: 'Uploaded a photo' },
  PHOTO_VOTED: { amount: 5, source: 'Photo received vote' },
  CHALLENGE_ENTRY: { amount: 25, source: 'Challenge entry' },
  CHALLENGE_WIN: { amount: 200, source: 'Challenge winner' },
  REFER_FRIEND: { amount: 100, source: 'Referred a friend' },
  PROFILE_COMPLETE: { amount: 50, source: 'Completed profile' },
  FIRST_NOTE: { amount: 10, source: 'First video note' },
  MISSION_COMPLETE: { amount: 30, source: 'Mission completed' },
};
