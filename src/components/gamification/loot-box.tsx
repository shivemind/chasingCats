'use client';

import { useState, useEffect } from 'react';

interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'xp' | 'badge' | 'preset' | 'wallpaper' | 'discount' | 'exclusive';
  value?: string;
  imageUrl?: string;
}

interface LootBox {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  source: string;
  unlockedAt?: string;
  isOpened: boolean;
  reward?: LootItem;
}

const tierStyles = {
  bronze: { 
    gradient: 'from-amber-700 to-orange-800', 
    glow: 'shadow-[0_0_30px_rgba(180,83,9,0.5)]',
    icon: '📦'
  },
  silver: { 
    gradient: 'from-gray-300 to-gray-500', 
    glow: 'shadow-[0_0_30px_rgba(156,163,175,0.5)]',
    icon: '🎁'
  },
  gold: { 
    gradient: 'from-yellow-400 to-amber-500', 
    glow: 'shadow-[0_0_30px_rgba(250,204,21,0.5)]',
    icon: '✨'
  },
  platinum: { 
    gradient: 'from-cyan-300 to-blue-500', 
    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.5)]',
    icon: '💎'
  },
};

const rarityStyles = {
  common: { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/50' },
  rare: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' },
  epic: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50' },
  legendary: { color: 'text-cat-eye', bg: 'bg-cat-eye/20', border: 'border-cat-eye/50' },
};

// Loot box card (unopened)
export function LootBoxCard({ lootBox, onOpen }: { lootBox: LootBox; onOpen: () => void }) {
  const tier = tierStyles[lootBox.tier];

  return (
    <button
      onClick={onOpen}
      disabled={lootBox.isOpened}
      className={`group relative w-full rounded-2xl border border-white/10 bg-deep-space/50 p-6 text-left transition-all hover:scale-105 ${
        lootBox.isOpened ? 'opacity-50 cursor-default' : 'cursor-pointer'
      }`}
    >
      {/* Box icon */}
      <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${tier.gradient} ${tier.glow} transition-transform group-hover:rotate-6`}>
        <span className="text-4xl animate-bounce">{tier.icon}</span>
      </div>

      {/* Info */}
      <div className="mt-4 text-center">
        <h4 className="font-bold text-white">{lootBox.name}</h4>
        <p className="text-xs text-gray-400 mt-1">{lootBox.description}</p>
        <p className={`mt-3 text-xs font-semibold uppercase tracking-wider bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
          {lootBox.tier} tier
        </p>
      </div>

      {/* Source */}
      <p className="mt-4 text-center text-xs text-gray-500">{lootBox.source}</p>

      {/* Open prompt */}
      {!lootBox.isOpened && (
        <div className="mt-4 text-center">
          <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white group-hover:bg-neon-cyan group-hover:text-black transition-colors">
            Tap to Open
          </span>
        </div>
      )}
    </button>
  );
}

// Loot box opening animation
export function LootBoxOpening({ 
  lootBox, 
  onComplete 
}: { 
  lootBox: LootBox; 
  onComplete: (reward: LootItem) => void;
}) {
  const [phase, setPhase] = useState<'shaking' | 'opening' | 'reveal'>('shaking');
  const [reward, setReward] = useState<LootItem | null>(null);

  useEffect(() => {
    // Shaking phase
    const shakeTimer = setTimeout(() => setPhase('opening'), 1500);
    
    // Opening phase - generate reward
    const openTimer = setTimeout(() => {
      const generatedReward = generateRandomReward(lootBox.tier);
      setReward(generatedReward);
      setPhase('reveal');
    }, 2500);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(openTimer);
    };
  }, [lootBox.tier]);

  const tier = tierStyles[lootBox.tier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {phase === 'shaking' && (
        <div className={`flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br ${tier.gradient} ${tier.glow} animate-[shake_0.3s_infinite]`}>
          <span className="text-6xl">{tier.icon}</span>
        </div>
      )}

      {phase === 'opening' && (
        <div className="relative">
          <div className={`flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br ${tier.gradient} animate-pulse`}>
            <span className="text-7xl animate-spin">✨</span>
          </div>
          <div className="absolute inset-0 bg-white animate-ping rounded-3xl opacity-50" />
        </div>
      )}

      {phase === 'reveal' && reward && (
        <div className="text-center animate-scale-in">
          {/* Rarity burst */}
          <div className={`relative mx-auto h-40 w-40 rounded-3xl ${rarityStyles[reward.rarity].bg} ${rarityStyles[reward.rarity].border} border-2 flex items-center justify-center`}>
            {reward.imageUrl ? (
              <img src={reward.imageUrl} alt={reward.name} className="h-24 w-24 object-contain" />
            ) : (
              <span className="text-6xl">
                {reward.type === 'xp' ? '⚡' : 
                 reward.type === 'badge' ? '🏅' : 
                 reward.type === 'preset' ? '🎨' : 
                 reward.type === 'wallpaper' ? '🖼️' : 
                 reward.type === 'discount' ? '🎟️' : '🌟'}
              </span>
            )}
          </div>

          {/* Rarity */}
          <p className={`mt-4 text-sm font-bold uppercase tracking-wider ${rarityStyles[reward.rarity].color}`}>
            {reward.rarity}
          </p>

          {/* Reward info */}
          <h2 className="mt-2 text-2xl font-bold text-white">{reward.name}</h2>
          <p className="mt-1 text-gray-400">{reward.description}</p>
          {reward.value && (
            <p className="mt-2 text-lg font-semibold text-neon-cyan">{reward.value}</p>
          )}

          {/* Claim button */}
          <button
            onClick={() => onComplete(reward)}
            className="mt-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-8 py-3 font-semibold text-white"
          >
            Claim Reward 🎉
          </button>
        </div>
      )}
    </div>
  );
}

// Generate random reward based on tier
function generateRandomReward(tier: LootBox['tier']): LootItem {
  const rewards: Record<LootBox['tier'], LootItem[]> = {
    bronze: [
      { id: 'r1', name: 'XP Boost', description: 'Bonus experience points', rarity: 'common', type: 'xp', value: '+25 XP' },
      { id: 'r2', name: 'Kitten Badge', description: 'A cute badge for your profile', rarity: 'common', type: 'badge' },
    ],
    silver: [
      { id: 'r3', name: 'XP Boost', description: 'Bonus experience points', rarity: 'common', type: 'xp', value: '+50 XP' },
      { id: 'r4', name: 'Safari Preset', description: 'Photo editing preset', rarity: 'rare', type: 'preset' },
      { id: 'r5', name: 'Leopard Wallpaper', description: 'Exclusive desktop wallpaper', rarity: 'rare', type: 'wallpaper' },
    ],
    gold: [
      { id: 'r6', name: 'XP Boost', description: 'Bonus experience points', rarity: 'rare', type: 'xp', value: '+100 XP' },
      { id: 'r7', name: 'Pro Badge', description: 'Show off your skills', rarity: 'epic', type: 'badge' },
      { id: 'r8', name: '10% Discount', description: 'Off your next purchase', rarity: 'epic', type: 'discount', value: '10% OFF' },
    ],
    platinum: [
      { id: 'r9', name: 'Mega XP Boost', description: 'Massive experience points', rarity: 'epic', type: 'xp', value: '+250 XP' },
      { id: 'r10', name: 'Legendary Badge', description: 'Ultra rare profile badge', rarity: 'legendary', type: 'badge' },
      { id: 'r11', name: 'Exclusive Preset Pack', description: '5 professional presets', rarity: 'legendary', type: 'preset' },
      { id: 'r12', name: '25% Discount', description: 'Off your next purchase', rarity: 'legendary', type: 'discount', value: '25% OFF' },
    ],
  };

  const pool = rewards[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Inventory of rewards
export function RewardInventory({ rewards }: { rewards: LootItem[] }) {
  const grouped = rewards.reduce((acc, reward) => {
    if (!acc[reward.type]) acc[reward.type] = [];
    acc[reward.type].push(reward);
    return acc;
  }, {} as Record<string, LootItem[]>);

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        🎒 Your Rewards
      </h3>
      
      <div className="space-y-4">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <h4 className="text-sm font-medium text-gray-400 mb-2 capitalize">{type}s</h4>
            <div className="grid grid-cols-4 gap-2">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className={`aspect-square rounded-xl ${rarityStyles[item.rarity].bg} ${rarityStyles[item.rarity].border} border flex items-center justify-center`}
                  title={item.name}
                >
                  <span className="text-2xl">
                    {item.type === 'xp' ? '⚡' : 
                     item.type === 'badge' ? '🏅' : 
                     item.type === 'preset' ? '🎨' : 
                     item.type === 'wallpaper' ? '🖼️' : 
                     item.type === 'discount' ? '🎟️' : '🌟'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add shake animation to globals.css
// @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px) rotate(-5deg); } 75% { transform: translateX(5px) rotate(5deg); } }
