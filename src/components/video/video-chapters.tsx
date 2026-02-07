'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export interface Chapter {
  id: string;
  title: string;
  startTime: number; // seconds
  endTime?: number;
  thumbnailUrl?: string;
}

interface VideoChaptersProps {
  chapters: Chapter[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function VideoChapters({ chapters, currentTime, duration, onSeek }: VideoChaptersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeChapterRef = useRef<HTMLButtonElement>(null);

  const currentChapter = chapters.find((ch, index) => {
    const nextChapter = chapters[index + 1];
    const endTime = ch.endTime || nextChapter?.startTime || duration;
    return currentTime >= ch.startTime && currentTime < endTime;
  });

  // Scroll to active chapter
  useEffect(() => {
    if (isExpanded && activeChapterRef.current) {
      activeChapterRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentChapter, isExpanded]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (chapter: Chapter, index: number) => {
    const nextChapter = chapters[index + 1];
    const endTime = chapter.endTime || nextChapter?.startTime || duration;
    
    if (currentTime < chapter.startTime) return 0;
    if (currentTime >= endTime) return 100;
    
    return ((currentTime - chapter.startTime) / (endTime - chapter.startTime)) * 100;
  };

  return (
    <div className="relative">
      {/* Chapter Progress Bar */}
      <div className="flex h-1 w-full gap-0.5 rounded-full overflow-hidden bg-white/10">
        {chapters.map((chapter, index) => {
          const nextChapter = chapters[index + 1];
          const endTime = chapter.endTime || nextChapter?.startTime || duration;
          const width = ((endTime - chapter.startTime) / duration) * 100;
          const progress = getProgress(chapter, index);
          
          return (
            <button
              key={chapter.id}
              onClick={() => onSeek(chapter.startTime)}
              className="relative h-full group"
              style={{ width: `${width}%` }}
              title={chapter.title}
            >
              <div className="absolute inset-0 bg-white/20" />
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-cyan to-neon-purple transition-all"
                style={{ width: `${progress}%` }}
              />
              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-deep-space border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {chapter.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Chapter Badge */}
      {currentChapter && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-neon-cyan">▶</span>
          <span className="font-medium text-white">{currentChapter.title}</span>
          <svg 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Expanded Chapter List */}
      {isExpanded && (
        <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-deep-space/50 backdrop-blur-sm">
          {chapters.map((chapter, index) => {
            const isActive = currentChapter?.id === chapter.id;
            const progress = getProgress(chapter, index);
            
            return (
              <button
                key={chapter.id}
                ref={isActive ? activeChapterRef : null}
                onClick={() => {
                  onSeek(chapter.startTime);
                  setIsExpanded(false);
                }}
                className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white/5 ${
                  isActive ? 'bg-neon-cyan/10' : ''
                }`}
              >
                {/* Thumbnail */}
                <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {chapter.thumbnailUrl ? (
                    <Image
                      src={chapter.thumbnailUrl}
                      alt={chapter.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg">
                      📹
                    </div>
                  )}
                  {/* Mini progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                    <div 
                      className="h-full bg-neon-cyan"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Chapter info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-neon-cyan' : 'text-white'}`}>
                    {chapter.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTime(chapter.startTime)}
                  </p>
                </div>

                {/* Playing indicator */}
                {isActive && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-neon-cyan rounded-full animate-pulse"
                        style={{ 
                          height: `${8 + i * 4}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Chapter markers overlay for video player
export function ChapterMarkers({ 
  chapters, 
  duration, 
  onSeek 
}: { 
  chapters: Chapter[]; 
  duration: number;
  onSeek: (time: number) => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none">
      {chapters.map((chapter) => {
        const position = (chapter.startTime / duration) * 100;
        
        return (
          <button
            key={chapter.id}
            onClick={() => onSeek(chapter.startTime)}
            className="absolute top-0 h-full w-1 -translate-x-1/2 pointer-events-auto group"
            style={{ left: `${position}%` }}
          >
            <div className="h-full w-full bg-white/40 group-hover:bg-neon-cyan transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-deep-space border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {chapter.title}
            </div>
          </button>
        );
      })}
    </div>
  );
}
