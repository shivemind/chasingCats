'use client';

import { useState } from 'react';

interface Kudo {
  type: string;
  emoji: string;
  label: string;
  color: string;
}

const KUDOS: Kudo[] = [
  { type: 'fire', emoji: '🔥', label: 'Fire Shot!', color: 'from-orange-500 to-red-500' },
  { type: 'helpful', emoji: '📚', label: 'Helpful!', color: 'from-green-500 to-emerald-500' },
  { type: 'pro_tip', emoji: '🎯', label: 'Pro Tip!', color: 'from-blue-500 to-cyan-500' },
  { type: 'inspiring', emoji: '✨', label: 'Inspiring!', color: 'from-purple-500 to-pink-500' },
  { type: 'creative', emoji: '🎨', label: 'Creative!', color: 'from-pink-500 to-rose-500' },
  { type: 'mind_blown', emoji: '🤯', label: 'Mind Blown!', color: 'from-yellow-500 to-amber-500' },
];

interface KudosData {
  [key: string]: {
    count: number;
    hasGiven: boolean;
  };
}

interface KudosButtonProps {
  kudos: KudosData;
  onGiveKudo: (type: string) => void;
  compact?: boolean;
}

export function KudosButton({ kudos, onGiveKudo, compact = false }: KudosButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [recentKudo, setRecentKudo] = useState<string | null>(null);

  const totalKudos = Object.values(kudos).reduce((sum, k) => sum + k.count, 0);
  const topKudos = Object.entries(kudos)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  const handleGiveKudo = (type: string) => {
    onGiveKudo(type);
    setRecentKudo(type);
    setShowPicker(false);
    setTimeout(() => setRecentKudo(null), 1000);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-sm text-gray-400 hover:bg-white/10 transition-colors"
        >
          {topKudos.length > 0 ? (
            <>
              <span className="flex -space-x-1">
                {topKudos.map(([type]) => {
                  const kudo = KUDOS.find(k => k.type === type);
                  return <span key={type}>{kudo?.emoji}</span>;
                })}
              </span>
              <span>{totalKudos}</span>
            </>
          ) : (
            <>
              <span>👏</span>
              <span>Give Kudos</span>
            </>
          )}
        </button>

        {/* Picker dropdown */}
        {showPicker && (
          <KudosPicker 
            onSelect={handleGiveKudo} 
            onClose={() => setShowPicker(false)}
            kudos={kudos}
          />
        )}

        {/* Recent kudo animation */}
        {recentKudo && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
            <span className="text-2xl">{KUDOS.find(k => k.type === recentKudo)?.emoji}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main kudos display */}
      <div className="flex items-center gap-2 flex-wrap">
        {topKudos.map(([type, data]) => {
          const kudo = KUDOS.find(k => k.type === type);
          if (!kudo) return null;
          
          return (
            <button
              key={type}
              onClick={() => handleGiveKudo(type)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-all ${
                data.hasGiven 
                  ? `bg-gradient-to-r ${kudo.color} text-white` 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span>{kudo.emoji}</span>
              <span>{data.count}</span>
            </button>
          );
        })}

        {/* Add kudo button */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
        >
          <span>+</span>
        </button>
      </div>

      {/* Picker dropdown */}
      {showPicker && (
        <KudosPicker 
          onSelect={handleGiveKudo} 
          onClose={() => setShowPicker(false)}
          kudos={kudos}
        />
      )}
    </div>
  );
}

// Kudos picker dropdown
function KudosPicker({ 
  onSelect, 
  onClose,
  kudos 
}: { 
  onSelect: (type: string) => void; 
  onClose: () => void;
  kudos: KudosData;
}) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Picker */}
      <div className="absolute bottom-full left-0 mb-2 z-50 rounded-2xl border border-white/10 bg-deep-space/95 backdrop-blur-md p-3 shadow-xl animate-scale-in">
        <div className="grid grid-cols-3 gap-2">
          {KUDOS.map((kudo) => {
            const hasGiven = kudos[kudo.type]?.hasGiven;
            return (
              <button
                key={kudo.type}
                onClick={() => onSelect(kudo.type)}
                disabled={hasGiven}
                className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                  hasGiven 
                    ? 'bg-white/5 opacity-50 cursor-default' 
                    : 'hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">{kudo.emoji}</span>
                <span className="text-xs text-gray-400">{kudo.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// Kudos summary for profile or content
export function KudosSummary({ kudos }: { kudos: KudosData }) {
  const totalKudos = Object.values(kudos).reduce((sum, k) => sum + k.count, 0);
  const sortedKudos = Object.entries(kudos)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  if (totalKudos === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white">Kudos Received</h4>
        <span className="text-lg font-bold text-neon-cyan">{totalKudos}</span>
      </div>
      <div className="space-y-2">
        {sortedKudos.map(([type, data]) => {
          const kudo = KUDOS.find(k => k.type === type);
          if (!kudo) return null;
          
          const percentage = (data.count / totalKudos) * 100;
          
          return (
            <div key={type} className="flex items-center gap-3">
              <span className="text-lg">{kudo.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">{kudo.label}</span>
                  <span className="text-white">{data.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${kudo.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Floating kudos animation
export function KudosFloating({ emoji }: { emoji: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(10)].map((_, i) => (
        <span
          key={i}
          className="absolute text-4xl animate-float-up"
          style={{
            left: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random() * 0.5}s`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// Add animation to globals.css:
// @keyframes float-up { 0% { transform: translateY(100vh) scale(1); opacity: 1; } 100% { transform: translateY(-100px) scale(0); opacity: 0; } }
