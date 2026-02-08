'use client';

import { useState } from 'react';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  category: 'watch' | 'engage' | 'learn' | 'social' | 'challenge';
  target: number;
  current: number;
  xpReward: number;
  bonusReward?: string;
  expiresAt: string;
  isCompleted: boolean;
  isClaimed: boolean;
}

const categoryIcons: Record<Mission['category'], string> = {
  watch: '🎬',
  engage: '💬',
  learn: '📚',
  social: '🤝',
  challenge: '🏆',
};

const categoryColors: Record<Mission['category'], string> = {
  watch: 'from-blue-500 to-cyan-500',
  engage: 'from-purple-500 to-pink-500',
  learn: 'from-green-500 to-emerald-500',
  social: 'from-orange-500 to-amber-500',
  challenge: 'from-red-500 to-rose-500',
};

export function MissionCard({ mission, onClaim }: { mission: Mission; onClaim: () => void }) {
  const progress = (mission.current / mission.target) * 100;
  const isComplete = mission.current >= mission.target;

  return (
    <div className={`relative rounded-xl border p-4 transition-all ${
      mission.isClaimed 
        ? 'border-white/5 bg-white/5 opacity-60' 
        : isComplete 
        ? 'border-neon-cyan/50 bg-neon-cyan/10' 
        : 'border-white/10 bg-white/5'
    }`}>
      {/* Type badge */}
      <div className={`absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
        mission.type === 'daily' ? 'bg-blue-500 text-white' :
        mission.type === 'weekly' ? 'bg-purple-500 text-white' :
        'bg-cat-eye text-black'
      }`}>
        {mission.type}
      </div>

      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${categoryColors[mission.category]} flex-shrink-0`}>
          <span className="text-xl">{categoryIcons[mission.category]}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white">{mission.title}</h4>
          <p className="text-xs text-gray-400 mt-0.5">{mission.description}</p>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">{mission.current}/{mission.target}</span>
              <span className="text-neon-cyan font-medium">+{mission.xpReward} XP</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full transition-all ${isComplete ? 'bg-neon-cyan' : `bg-gradient-to-r ${categoryColors[mission.category]}`}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Bonus reward */}
          {mission.bonusReward && (
            <div className="mt-2 flex items-center gap-1 text-xs text-cat-eye">
              <span>🎁</span>
              <span>{mission.bonusReward}</span>
            </div>
          )}
        </div>

        {/* Claim button */}
        {isComplete && !mission.isClaimed && (
          <button
            onClick={onClaim}
            className="rounded-full bg-neon-cyan px-4 py-2 text-xs font-bold text-black animate-pulse"
          >
            Claim!
          </button>
        )}
        {mission.isClaimed && (
          <span className="text-green-400 text-sm">✓</span>
        )}
      </div>
    </div>
  );
}

export function MissionsPanel({ missions, onClaim }: { missions: Mission[]; onClaim: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');
  
  const filteredMissions = missions.filter(m => m.type === activeTab);
  const completedCount = filteredMissions.filter(m => m.isClaimed).length;
  const totalXP = filteredMissions.reduce((acc, m) => acc + (m.isClaimed ? m.xpReward : 0), 0);

  // Calculate time until reset
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const hoursLeft = Math.floor((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h3 className="text-lg font-semibold text-white">Missions</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">{completedCount}/{filteredMissions.length} completed</p>
            <p className="text-xs text-neon-cyan">+{totalXP} XP earned</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {(['daily', 'weekly', 'special'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-neon-cyan text-black'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reset timer */}
      <div className="px-6 py-2 bg-white/5 border-b border-white/10 flex items-center justify-center gap-2 text-xs text-gray-400">
        <span>⏰</span>
        <span>
          {activeTab === 'daily' ? `Resets in ${hoursLeft}h` : 
           activeTab === 'weekly' ? 'Resets Sunday' : 
           'Limited time only!'}
        </span>
      </div>

      {/* Missions list */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredMissions.length > 0 ? (
          filteredMissions.map((mission) => (
            <MissionCard 
              key={mission.id} 
              mission={mission} 
              onClaim={() => onClaim(mission.id)} 
            />
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">No {activeTab} missions available</p>
        )}
      </div>

      {/* All complete bonus */}
      {completedCount === filteredMissions.length && filteredMissions.length > 0 && (
        <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌟</span>
              <span className="font-semibold text-white">All {activeTab} missions complete!</span>
            </div>
            <span className="text-neon-cyan font-bold">+50 Bonus XP</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Mission completion notification
export function MissionCompleteNotification({ mission, onClose }: { mission: Mission; onClose: () => void }) {
  return (
    <div className="fixed bottom-24 left-6 z-50 animate-slide-up">
      <div className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-deep-space/95 backdrop-blur-md px-5 py-3 shadow-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
          <span className="text-xl">✓</span>
        </div>
        <div>
          <p className="font-semibold text-white">Mission Complete!</p>
          <p className="text-xs text-gray-400">{mission.title}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 rounded-full bg-neon-cyan px-4 py-1.5 text-xs font-bold text-black"
        >
          Claim +{mission.xpReward} XP
        </button>
      </div>
    </div>
  );
}

// Sample missions generator
export function generateDailyMissions(): Mission[] {
  return [
    {
      id: 'd1',
      title: 'Watch & Learn',
      description: 'Watch 2 videos today',
      type: 'daily',
      category: 'watch',
      target: 2,
      current: 0,
      xpReward: 20,
      expiresAt: new Date().toISOString(),
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: 'd2',
      title: 'Join the Conversation',
      description: 'Leave 3 comments',
      type: 'daily',
      category: 'engage',
      target: 3,
      current: 0,
      xpReward: 15,
      expiresAt: new Date().toISOString(),
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: 'd3',
      title: 'Quiz Master',
      description: 'Pass a quiz',
      type: 'daily',
      category: 'learn',
      target: 1,
      current: 0,
      xpReward: 30,
      bonusReward: 'Random Loot Box',
      expiresAt: new Date().toISOString(),
      isCompleted: false,
      isClaimed: false,
    },
  ];
}
