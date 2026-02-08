'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CollectibleCard {
  id: string;
  name: string;
  species: string;
  imageUrl?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  obtainedAt?: string;
  obtainMethod: string;
  isOwned: boolean;
  progress?: number; // 0-100 for partial unlock
}

interface Collection {
  id: string;
  name: string;
  description: string;
  cards: CollectibleCard[];
  reward: string;
  isComplete: boolean;
}

const rarityConfig = {
  common: { color: 'from-gray-400 to-gray-500', glow: '', stars: 1 },
  uncommon: { color: 'from-green-400 to-emerald-500', glow: '', stars: 2 },
  rare: { color: 'from-blue-400 to-cyan-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]', stars: 3 },
  epic: { color: 'from-purple-400 to-violet-500', glow: 'shadow-[0_0_20px_rgba(147,51,234,0.4)]', stars: 4 },
  legendary: { color: 'from-cat-eye to-amber-400', glow: 'shadow-[0_0_30px_rgba(255,215,0,0.5)]', stars: 5 },
};

// Individual card component
export function CollectibleCardDisplay({ 
  card, 
  size = 'normal',
  onClick 
}: { 
  card: CollectibleCard; 
  size?: 'small' | 'normal' | 'large';
  onClick?: () => void;
}) {
  const config = rarityConfig[card.rarity];
  const sizeClasses = {
    small: 'w-24',
    normal: 'w-36',
    large: 'w-48',
  };

  return (
    <button
      onClick={onClick}
      className={`group relative ${sizeClasses[size]} transition-transform hover:scale-105`}
    >
      <div className={`relative overflow-hidden rounded-xl border-2 ${
        card.isOwned 
          ? `border-transparent bg-gradient-to-br ${config.color} p-0.5 ${config.glow}` 
          : 'border-white/10 bg-white/5'
      }`}>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-deep-space">
          {card.isOwned ? (
            <>
              {card.imageUrl ? (
                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  🐱
                </div>
              )}
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl opacity-30">❓</span>
              {card.progress !== undefined && card.progress > 0 && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="h-1 w-full rounded-full bg-white/20">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">{card.progress}%</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card info */}
      <div className="mt-2 text-center">
        <p className={`text-xs font-semibold truncate ${card.isOwned ? 'text-white' : 'text-gray-500'}`}>
          {card.isOwned ? card.name : '???'}
        </p>
        {/* Rarity stars */}
        <div className="flex justify-center gap-0.5 mt-1">
          {[...Array(config.stars)].map((_, i) => (
            <span key={i} className={`text-xs ${card.isOwned ? 'text-cat-eye' : 'text-gray-600'}`}>★</span>
          ))}
        </div>
      </div>
    </button>
  );
}

// Card detail modal
export function CardDetailModal({ 
  card, 
  isOpen, 
  onClose 
}: { 
  card: CollectibleCard; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const config = rarityConfig[card.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-sm w-full mx-4 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          ✕
        </button>

        {/* Card */}
        <div className={`relative overflow-hidden rounded-3xl border-4 ${
          card.isOwned 
            ? `border-transparent bg-gradient-to-br ${config.color} p-1 ${config.glow}` 
            : 'border-white/20'
        }`}>
          <div className="rounded-2xl bg-deep-space overflow-hidden">
            {/* Image */}
            <div className="relative aspect-square">
              {card.isOwned && card.imageUrl ? (
                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                  <span className="text-8xl opacity-30">❓</span>
                </div>
              )}
              
              {/* Rarity badge */}
              <div className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold uppercase bg-gradient-to-r ${config.color} text-white`}>
                {card.rarity}
              </div>
            </div>

            {/* Info */}
            <div className="p-6">
              <h2 className={`text-2xl font-bold ${card.isOwned ? 'text-white' : 'text-gray-500'}`}>
                {card.isOwned ? card.name : '???'}
              </h2>
              <p className={`text-sm ${card.isOwned ? `bg-gradient-to-r ${config.color} bg-clip-text text-transparent` : 'text-gray-600'}`}>
                {card.species}
              </p>

              {card.isOwned ? (
                <>
                  <p className="mt-4 text-sm text-gray-400">{card.description}</p>
                  <div className="mt-4 rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-gray-500">Obtained</p>
                    <p className="text-sm text-white">{card.obtainMethod}</p>
                    {card.obtainedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(card.obtainedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">How to unlock:</p>
                  <p className="text-sm text-gray-400 mt-1">{card.obtainMethod}</p>
                  {card.progress !== undefined && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-white">{card.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stars */}
              <div className="flex justify-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-2xl ${i < config.stars ? 'text-cat-eye' : 'text-gray-700'}`}>★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Collection set display
export function CollectionSet({ collection, onCardClick }: { collection: Collection; onCardClick: (card: CollectibleCard) => void }) {
  const ownedCount = collection.cards.filter(c => c.isOwned).length;
  const progress = (ownedCount / collection.cards.length) * 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-deep-space/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{collection.name}</h3>
          <p className="text-sm text-gray-400">{collection.description}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-neon-cyan">{ownedCount}/{collection.cards.length}</p>
          <p className="text-xs text-gray-500">collected</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {collection.cards.map((card) => (
          <CollectibleCardDisplay 
            key={card.id} 
            card={card} 
            size="small"
            onClick={() => onCardClick(card)}
          />
        ))}
      </div>

      {/* Collection reward */}
      <div className={`mt-6 rounded-xl p-4 ${collection.isComplete ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20' : 'bg-white/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{collection.isComplete ? '🏆' : '🔒'}</span>
            <span className={`font-medium ${collection.isComplete ? 'text-neon-cyan' : 'text-gray-400'}`}>
              Collection Reward: {collection.reward}
            </span>
          </div>
          {collection.isComplete && (
            <span className="text-green-400 text-sm">✓ Claimed</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Full collection gallery
export function CollectionGallery({ collections }: { collections: Collection[] }) {
  const [selectedCard, setSelectedCard] = useState<CollectibleCard | null>(null);
  const [activeSet, setActiveSet] = useState(collections[0]?.id);

  const totalCards = collections.reduce((sum, c) => sum + c.cards.length, 0);
  const ownedCards = collections.reduce((sum, c) => sum + c.cards.filter(card => card.isOwned).length, 0);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Collection</h2>
            <p className="text-gray-400">Collect cards by completing content</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-neon-cyan">{ownedCards}</p>
            <p className="text-sm text-gray-400">of {totalCards} cards</p>
          </div>
        </div>
      </div>

      {/* Set tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {collections.map((collection) => {
          const owned = collection.cards.filter(c => c.isOwned).length;
          return (
            <button
              key={collection.id}
              onClick={() => setActiveSet(collection.id)}
              className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeSet === collection.id
                  ? 'bg-neon-cyan text-black'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {collection.name}
              <span className="ml-2 opacity-70">({owned}/{collection.cards.length})</span>
            </button>
          );
        })}
      </div>

      {/* Active collection */}
      {collections.filter(c => c.id === activeSet).map((collection) => (
        <CollectionSet 
          key={collection.id} 
          collection={collection} 
          onCardClick={setSelectedCard}
        />
      ))}

      {/* Card detail modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
