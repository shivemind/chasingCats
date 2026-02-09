'use client';

import { useState } from 'react';

interface ContentImageProps {
  src: string | null | undefined;
  alt: string;
  type?: string;
  className?: string;
}

// Generate a deterministic gradient based on title/type
function generatePlaceholder(type?: string) {
  const gradients = [
    'from-emerald-600 to-teal-700',
    'from-amber-600 to-orange-700',
    'from-violet-600 to-purple-700',
    'from-rose-600 to-pink-700',
    'from-cyan-600 to-blue-700',
  ];
  
  const icons: Record<string, string> = {
    VIDEO: '🎬',
    ARTICLE: '📄',
    PODCAST: '🎙️',
    GUIDE: '📚',
    MASTERCLASS: '🎓',
    default: '🐆',
  };

  const gradientIndex = type ? type.length % gradients.length : 0;
  const icon = icons[type?.toUpperCase() || ''] || icons.default;

  return { gradient: gradients[gradientIndex], icon };
}

export function ContentImage({ src, alt, type, className = '' }: ContentImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { gradient, icon } = generatePlaceholder(type);

  if (!src || hasError) {
    return (
      <div 
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-white/90">
          <span className="text-4xl">{icon}</span>
          {type && (
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {type}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient} animate-pulse`}>
          <span className="text-3xl">{icon}</span>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}
