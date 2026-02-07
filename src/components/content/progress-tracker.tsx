'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ContentProgress {
  contentId: string;
  progress: number; // 0-100
  lastPosition: number; // seconds
  completedAt?: string;
  updatedAt: string;
}

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
}

// Hook to track and save video progress
export function useVideoProgress(contentId: string) {
  const [progress, setProgress] = useState<ContentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Try localStorage first for immediate response
        const cached = localStorage.getItem(`progress_${contentId}`);
        if (cached) {
          setProgress(JSON.parse(cached));
        }

        // Then fetch from API
        const res = await fetch(`/api/progress/${contentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.progress) {
            setProgress(data.progress);
            localStorage.setItem(`progress_${contentId}`, JSON.stringify(data.progress));
          }
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [contentId]);

  // Save progress
  const saveProgress = useCallback(async (currentTime: number, duration: number) => {
    const progressPercent = Math.min(Math.round((currentTime / duration) * 100), 100);
    const isCompleted = progressPercent >= 95; // Consider complete at 95%

    const newProgress: ContentProgress = {
      contentId,
      progress: progressPercent,
      lastPosition: currentTime,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    setProgress(newProgress);
    localStorage.setItem(`progress_${contentId}`, JSON.stringify(newProgress));

    // Debounced save to API (save every 10 seconds or on completion)
    try {
      await fetch(`/api/progress/${contentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProgress),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [contentId]);

  return { progress, isLoading, saveProgress };
}

// Progress Bar Component
export function ProgressBar({ 
  progress, 
  showLabel = false,
  size = 'md' 
}: { 
  progress: number; 
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
  
  return (
    <div className="w-full">
      <div className={`${heights[size]} w-full rounded-full bg-white/10 overflow-hidden`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>{progress}% complete</span>
          {progress >= 95 && <span className="text-green-400">✓ Completed</span>}
        </div>
      )}
    </div>
  );
}

// Continue Watching Section
export function ContinueWatching({ 
  items 
}: { 
  items: (ContentItem & { progress: ContentProgress })[];
}) {
  if (items.length === 0) return null;

  // Filter to only show in-progress items (not completed)
  const inProgress = items.filter(item => item.progress.progress < 95);
  
  if (inProgress.length === 0) return null;

  const formatRemainingTime = (lastPosition: number, duration: number) => {
    const remaining = Math.max(0, duration - lastPosition);
    const mins = Math.floor(remaining / 60);
    if (mins < 60) return `${mins} min left`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m left`;
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-neon-cyan">▶</span> Continue Watching
        </h2>
        <Link href="/account/history" className="text-sm text-neon-cyan hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inProgress.slice(0, 4).map((item) => (
          <Link
            key={item.id}
            href={`/content/${item.slug}?t=${Math.floor(item.progress.lastPosition)}`}
            className="group relative block overflow-hidden rounded-xl border border-white/10 bg-deep-space/50 transition-all hover:border-neon-cyan/30 hover:shadow-[0_0_20px_rgba(0,245,212,0.1)]"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video">
              {item.thumbnailUrl ? (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
                  <span className="text-3xl">🎬</span>
                </div>
              )}
              
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Time badge */}
              {item.duration && (
                <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  {formatRemainingTime(item.progress.lastPosition, item.duration)}
                </div>
              )}

              {/* Progress bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                  className="h-full bg-neon-cyan transition-all"
                  style={{ width: `${item.progress.progress}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-neon-cyan transition-colors">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Recently Completed Section
export function RecentlyCompleted({ 
  items 
}: { 
  items: (ContentItem & { progress: ContentProgress })[];
}) {
  const completed = items.filter(item => item.progress.progress >= 95);
  
  if (completed.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-green-400">✓</span> Recently Completed
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {completed.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            href={`/content/${item.slug}`}
            className="flex-shrink-0 w-40 group"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden border border-green-500/30">
              {item.thumbnailUrl ? (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-500/20 to-neon-cyan/20">
                  <span className="text-2xl">✓</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs">
                ✓
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400 line-clamp-2 group-hover:text-white transition-colors">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Video Player with Progress Tracking
export function VideoPlayerWithProgress({ 
  contentId,
  videoUrl,
  onProgress 
}: { 
  contentId: string;
  videoUrl: string;
  onProgress?: (progress: number) => void;
}) {
  const { progress, saveProgress } = useVideoProgress(contentId);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState(0);

  // Set initial position when video loads
  useEffect(() => {
    if (videoRef && progress?.lastPosition) {
      // Only restore if we're more than 5 seconds in and not at the end
      if (progress.lastPosition > 5 && progress.progress < 95) {
        videoRef.currentTime = progress.lastPosition;
      }
    }
  }, [videoRef, progress]);

  // Save progress periodically
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef) return;
    
    const currentTime = videoRef.currentTime;
    const duration = videoRef.duration;
    
    if (!duration || isNaN(duration)) return;

    // Save every 10 seconds or at completion
    const progressPercent = (currentTime / duration) * 100;
    if (currentTime - lastSaveTime >= 10 || progressPercent >= 95) {
      saveProgress(currentTime, duration);
      setLastSaveTime(currentTime);
      onProgress?.(progressPercent);
    }
  }, [videoRef, lastSaveTime, saveProgress, onProgress]);

  return (
    <div className="relative">
      <video
        ref={setVideoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (videoRef) {
            saveProgress(videoRef.duration, videoRef.duration);
          }
        }}
        controls
        className="w-full rounded-xl"
      />
      
      {/* Progress indicator */}
      {progress && progress.progress > 0 && progress.progress < 100 && (
        <div className="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {progress.progress}% watched
        </div>
      )}
    </div>
  );
}
