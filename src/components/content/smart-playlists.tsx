'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PlaylistContent {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration: number;
  slug: string;
  type: 'video' | 'article';
}

interface SmartPlaylist {
  id: string;
  name: string;
  description: string;
  icon: string;
  mood: string;
  estimatedTime: number;
  contents: PlaylistContent[];
  color: string;
  isPersonalized: boolean;
}

// Predefined smart playlists (exported for use in playlist generation)
export const SMART_PLAYLIST_TEMPLATES: Partial<SmartPlaylist>[] = [
  {
    id: 'quick-learn',
    name: '5-Minute Lessons',
    description: 'Quick tips for busy schedules',
    icon: '⚡',
    mood: 'quick',
    color: 'from-yellow-500 to-orange-500',
    isPersonalized: false,
  },
  {
    id: 'morning-safari',
    name: 'Morning Safari',
    description: 'Start your day with wildlife inspiration',
    icon: '🌅',
    mood: 'morning',
    color: 'from-orange-400 to-pink-500',
    isPersonalized: false,
  },
  {
    id: 'deep-dive',
    name: 'Weekend Deep Dive',
    description: '2+ hours of comprehensive learning',
    icon: '📚',
    mood: 'focused',
    color: 'from-blue-500 to-indigo-500',
    isPersonalized: false,
  },
  {
    id: 'wind-down',
    name: 'Evening Wind Down',
    description: 'Relaxing nature content before bed',
    icon: '🌙',
    mood: 'relaxed',
    color: 'from-purple-500 to-indigo-600',
    isPersonalized: false,
  },
  {
    id: 'skill-boost',
    name: 'Skill Boost',
    description: 'Based on your learning gaps',
    icon: '🎯',
    mood: 'improvement',
    color: 'from-green-500 to-emerald-500',
    isPersonalized: true,
  },
  {
    id: 'continue',
    name: 'Continue Your Journey',
    description: 'Pick up where you left off',
    icon: '▶️',
    mood: 'continue',
    color: 'from-neon-cyan to-blue-500',
    isPersonalized: true,
  },
];

// Playlist card
export function PlaylistCard({ playlist, onPlay }: { playlist: SmartPlaylist; onPlay: () => void }) {
  const totalDuration = playlist.contents.reduce((sum, c) => sum + c.duration, 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  return (
    <button
      onClick={onPlay}
      className="group relative w-full rounded-2xl border border-white/10 bg-deep-space/50 overflow-hidden text-left transition-all hover:border-white/20"
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
      
      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${playlist.color} shadow-lg`}>
            <span className="text-2xl">{playlist.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white group-hover:text-neon-cyan transition-colors">
                {playlist.name}
              </h3>
              {playlist.isPersonalized && (
                <span className="rounded-full bg-neon-purple/20 px-2 py-0.5 text-[10px] font-medium text-neon-purple">
                  For You
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">{playlist.description}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span>{playlist.contents.length} videos</span>
              <span>•</span>
              <span>{hours > 0 ? `${hours}h ` : ''}{minutes}m</span>
            </div>
          </div>
        </div>

        {/* Preview thumbnails */}
        <div className="flex gap-2 mt-4">
          {playlist.contents.slice(0, 4).map((content, i) => (
            <div 
              key={content.id}
              className="relative h-12 w-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0"
              style={{ opacity: 1 - (i * 0.15) }}
            >
              {content.thumbnailUrl ? (
                <Image src={content.thumbnailUrl} alt="" fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm">🎬</div>
              )}
            </div>
          ))}
          {playlist.contents.length > 4 && (
            <div className="h-12 w-20 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-400">
              +{playlist.contents.length - 4}
            </div>
          )}
        </div>

        {/* Play button */}
        <div className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// Playlist player view
export function PlaylistPlayer({ playlist, onClose }: { playlist: SmartPlaylist; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentContent = playlist.contents[currentIndex];

  const handleNext = () => {
    if (currentIndex < playlist.contents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-deep-space">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{playlist.icon}</span>
          <div>
            <h2 className="font-semibold text-white">{playlist.name}</h2>
            <p className="text-xs text-gray-400">
              {currentIndex + 1} of {playlist.contents.length}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          ✕
        </button>
      </div>

      {/* Video area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
            {currentContent.thumbnailUrl && (
              <Image src={currentContent.thumbnailUrl} alt={currentContent.title} fill className="object-cover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <Link
                href={`/content/${currentContent.slug}`}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-neon-cyan text-black"
              >
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </Link>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mt-4">{currentContent.title}</h3>
        </div>
      </div>

      {/* Playlist sidebar */}
      <div className="absolute right-0 top-16 bottom-0 w-80 border-l border-white/10 bg-deep-space/50 overflow-y-auto">
        <div className="p-4 space-y-2">
          {playlist.contents.map((content, index) => (
            <button
              key={content.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                index === currentIndex 
                  ? 'bg-neon-cyan/20 border border-neon-cyan/30' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="relative h-12 w-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                {content.thumbnailUrl ? (
                  <Image src={content.thumbnailUrl} alt="" fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">🎬</div>
                )}
                {index < currentIndex && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-green-400">✓</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  index === currentIndex ? 'text-neon-cyan' : 'text-white'
                }`}>
                  {content.title}
                </p>
                <p className="text-xs text-gray-500">{content.duration} min</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-6 left-6 right-86 flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30"
        >
          ←
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === playlist.contents.length - 1}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-neon-cyan text-black disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  );
}

// Playlist selector based on time/mood
export function PlaylistSelector({ playlists }: { playlists: SmartPlaylist[] }) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<SmartPlaylist | null>(null);

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  // Suggest based on time
  const suggested = playlists.find(p => 
    (timeOfDay === 'morning' && p.mood === 'morning') ||
    (timeOfDay === 'evening' && p.mood === 'relaxed') ||
    p.mood === 'continue'
  );

  return (
    <div className="space-y-6">
      {/* Suggested */}
      {suggested && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Perfect for this {timeOfDay}
          </h3>
          <PlaylistCard 
            playlist={suggested} 
            onPlay={() => setSelectedPlaylist(suggested)} 
          />
        </div>
      )}

      {/* All playlists */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Smart Playlists</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {playlists.filter(p => p.id !== suggested?.id).map((playlist) => (
            <PlaylistCard 
              key={playlist.id}
              playlist={playlist} 
              onPlay={() => setSelectedPlaylist(playlist)} 
            />
          ))}
        </div>
      </div>

      {/* Player */}
      {selectedPlaylist && (
        <PlaylistPlayer 
          playlist={selectedPlaylist} 
          onClose={() => setSelectedPlaylist(null)} 
        />
      )}
    </div>
  );
}
