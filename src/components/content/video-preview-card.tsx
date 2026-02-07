'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface VideoPreviewCardProps {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  duration?: number | null;
  category?: string | null;
  isPremium?: boolean;
  progress?: number; // 0-100
}

export function VideoPreviewCard({
  title,
  slug,
  description,
  thumbnailUrl,
  videoUrl,
  duration,
  category,
  isPremium = false,
  progress = 0,
}: VideoPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Delay video play to prevent flickering on quick hovers
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      if (videoRef.current && videoUrl) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {}); // Ignore autoplay errors
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link
      href={`/content/${slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-deep-space/50 transition-all duration-300 hover:scale-[1.02] hover:border-neon-cyan/30 hover:shadow-[0_0_30px_rgba(0,245,212,0.1)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail / Video container */}
      <div className="relative aspect-video overflow-hidden bg-midnight">
        {/* Thumbnail */}
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isHovered && isVideoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
            <span className="text-4xl">🦁</span>
          </div>
        )}

        {/* Video preview */}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isHovered && isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-60'
        }`} />

        {/* Premium badge */}
        {isPremium && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-1 text-xs font-bold text-white">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            PREMIUM
          </div>
        )}

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {formatDuration(duration)}
          </div>
        )}

        {/* Progress bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Play button on hover */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
            <svg className="h-8 w-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 font-semibold text-white line-clamp-2 group-hover:text-neon-cyan transition-colors">
          {title}
        </h3>
        {description && (
          <p className="mb-3 text-sm text-gray-400 line-clamp-2">{description}</p>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {category && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
              {category}
            </span>
          )}
          {progress > 0 && progress < 100 && (
            <span className="rounded-full bg-neon-cyan/20 px-3 py-1 text-xs text-neon-cyan">
              {progress}% complete
            </span>
          )}
          {progress === 100 && (
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
              ✓ Completed
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
