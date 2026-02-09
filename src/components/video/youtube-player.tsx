'use client';

import { useState } from 'react';

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
}

// Extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function YouTubePlayer({ videoUrl, title }: YouTubePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-night/80 text-white/70">
        <p>Invalid video URL</p>
      </div>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  // Lazy load: show thumbnail first, load iframe on click
  if (!isLoaded) {
    return (
      <button
        onClick={() => setIsLoaded(true)}
        className="relative flex h-full w-full items-center justify-center bg-black group cursor-pointer"
        aria-label={`Play ${title || 'video'}`}
      >
        {/* YouTube thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={title || 'Video thumbnail'}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            // Fallback to hqdefault if maxresdefault doesn't exist
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
        
        {/* Play button */}
        <div className="relative z-10 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-red-600 shadow-2xl transition-transform group-hover:scale-110">
          <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        
        {/* YouTube branding */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          YouTube
        </div>
      </button>
    );
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
      title={title || 'YouTube video'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="h-full w-full"
    />
  );
}
