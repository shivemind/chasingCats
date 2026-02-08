'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ReferralTier {
  id: string;
  name: string;
  icon: string;
  minReferrals: number;
  maxReferrals: number;
  color: string;
  rewards: string[];
  specialPerk?: string;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  earnedRewards: string[];
  currentTier: ReferralTier;
  nextTier?: ReferralTier;
  referralCode: string;
  referralLink: string;
  recentReferrals: {
    id: string;
    name: string;
    avatarUrl?: string;
    joinedAt: string;
    status: 'pending' | 'active' | 'subscribed';
  }[];
}

const REFERRAL_TIERS: ReferralTier[] = [
  { 
    id: 'starter', 
    name: 'Starter', 
    icon: '🌱', 
    minReferrals: 0, 
    maxReferrals: 2, 
    color: 'from-gray-400 to-gray-500',
    rewards: ['100 XP per referral']
  },
  { 
    id: 'advocate', 
    name: 'Advocate', 
    icon: '🌟', 
    minReferrals: 3, 
    maxReferrals: 9, 
    color: 'from-blue-400 to-cyan-500',
    rewards: ['200 XP per referral', 'Exclusive Badge', '1 Free Month']
  },
  { 
    id: 'ambassador', 
    name: 'Ambassador', 
    icon: '👑', 
    minReferrals: 10, 
    maxReferrals: 24, 
    color: 'from-purple-400 to-pink-500',
    rewards: ['300 XP per referral', 'Ambassador Badge', '3 Free Months', 'Custom Preset Pack'],
    specialPerk: 'Early access to new features'
  },
  { 
    id: 'legend', 
    name: 'Legend', 
    icon: '🏆', 
    minReferrals: 25, 
    maxReferrals: Infinity, 
    color: 'from-cat-eye to-orange-500',
    rewards: ['500 XP per referral', 'Legend Badge', 'Lifetime Pro', 'All Presets', 'Featured Profile'],
    specialPerk: '1-on-1 call with instructors'
  },
];

function getTierFromReferrals(count: number): ReferralTier {
  return REFERRAL_TIERS.find(t => count >= t.minReferrals && count < t.maxReferrals) || REFERRAL_TIERS[REFERRAL_TIERS.length - 1];
}

// Main referral dashboard
export function ReferralDashboard({ stats }: { stats: ReferralStats }) {
  const [copied, setCopied] = useState(false);
  const currentTier = getTierFromReferrals(stats.totalReferrals);
  const nextTier = REFERRAL_TIERS[REFERRAL_TIERS.indexOf(currentTier) + 1];
  const progressToNext = nextTier 
    ? ((stats.totalReferrals - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100
    : 100;

  const copyLink = () => {
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Invite Friends, Earn Rewards</h2>
            <p className="text-gray-400">Share the love and level up together</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-neon-cyan">{stats.totalReferrals}</p>
            <p className="text-sm text-gray-400">total referrals</p>
          </div>
        </div>

        {/* Share section */}
        <div className="mt-6 rounded-xl bg-white/5 p-4">
          <p className="text-sm text-gray-400 mb-2">Your referral link</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={stats.referralLink}
              readOnly
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white text-sm"
            />
            <button
              onClick={copyLink}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                copied ? 'bg-green-500 text-white' : 'bg-neon-cyan text-black'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 rounded-lg bg-[#1877F2] py-2 text-sm font-medium text-white">
              Facebook
            </button>
            <button className="flex-1 rounded-lg bg-[#1DA1F2] py-2 text-sm font-medium text-white">
              Twitter
            </button>
            <button className="flex-1 rounded-lg bg-[#25D366] py-2 text-sm font-medium text-white">
              WhatsApp
            </button>
            <button className="flex-1 rounded-lg bg-white/10 py-2 text-sm font-medium text-white">
              Email
            </button>
          </div>
        </div>
      </div>

      {/* Current tier & progress */}
      <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${currentTier.color} shadow-lg`}>
            <span className="text-3xl">{currentTier.icon}</span>
          </div>
          <div className="flex-1">
            <p className={`text-xl font-bold bg-gradient-to-r ${currentTier.color} bg-clip-text text-transparent`}>
              {currentTier.name}
            </p>
            <p className="text-sm text-gray-400">
              {stats.totalReferrals} referrals
            </p>
          </div>
          {currentTier.specialPerk && (
            <span className="rounded-full bg-cat-eye/20 px-3 py-1 text-xs text-cat-eye">
              ✨ {currentTier.specialPerk}
            </span>
          )}
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Progress to {nextTier.name}</span>
              <span className="text-white">
                {nextTier.minReferrals - stats.totalReferrals} more to go
              </span>
            </div>
            <div className="relative h-4 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${currentTier.color}`}
                style={{ width: `${progressToNext}%` }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <span className="text-sm">{nextTier.icon}</span>
              </div>
            </div>
          </div>
        )}

        {/* Current rewards */}
        <div className="mt-6">
          <p className="text-sm text-gray-400 mb-3">Your Current Rewards</p>
          <div className="flex flex-wrap gap-2">
            {currentTier.rewards.map((reward, i) => (
              <span key={i} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                {reward}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tier ladder */}
      <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Referral Tiers</h3>
        <div className="space-y-4">
          {REFERRAL_TIERS.map((tier) => {
            const isCurrentTier = tier.id === currentTier.id;
            const isUnlocked = stats.totalReferrals >= tier.minReferrals;

            return (
              <div 
                key={tier.id}
                className={`relative rounded-xl p-4 ${
                  isCurrentTier 
                    ? `bg-gradient-to-r ${tier.color} bg-opacity-20 border-2 border-white/30` 
                    : 'bg-white/5'
                } ${!isUnlocked ? 'opacity-50' : ''}`}
              >
                {isCurrentTier && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-neon-cyan px-2 py-0.5 text-[10px] font-bold text-black">
                    CURRENT
                  </span>
                )}
                
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{tier.name}</p>
                    <p className="text-xs text-gray-400">
                      {tier.minReferrals}+ referrals
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {tier.rewards.map((reward, i) => (
                    <span key={i} className="rounded px-2 py-0.5 text-[10px] bg-white/10 text-gray-300">
                      {reward}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent referrals */}
      {stats.recentReferrals.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Referrals</h3>
          <div className="space-y-3">
            {stats.recentReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10">
                  {referral.avatarUrl ? (
                    <Image src={referral.avatarUrl} alt={referral.name} width={40} height={40} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      {referral.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{referral.name}</p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(referral.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  referral.status === 'subscribed' ? 'bg-green-500/20 text-green-400' :
                  referral.status === 'active' ? 'bg-neon-cyan/20 text-neon-cyan' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {referral.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Invite prompt widget
export function InvitePrompt() {
  return (
    <div className="rounded-2xl border border-neon-purple/30 bg-gradient-to-br from-neon-purple/10 to-pink-500/10 p-6">
      <div className="flex items-center gap-4">
        <span className="text-4xl">🎁</span>
        <div className="flex-1">
          <h3 className="font-semibold text-white">Invite Friends, Get Rewards</h3>
          <p className="text-sm text-gray-400">Both you and your friend get free months!</p>
        </div>
        <button className="rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 text-sm font-semibold text-white">
          Invite Now
        </button>
      </div>
    </div>
  );
}
