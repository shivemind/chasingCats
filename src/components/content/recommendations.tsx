'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecommendedContent {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  excerpt?: string;
  duration?: number | null;
  matchReason: string;
  matchScore: number;
}

interface RecommendationsProps {
  currentContentId?: string;
  limit?: number;
}

export function ContentRecommendations({ currentContentId, limit = 4 }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const url = currentContentId 
          ? `/api/recommendations?contentId=${currentContentId}&limit=${limit}`
          : `/api/recommendations?limit=${limit}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations || []);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentContentId, limit]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-deep-space/50 overflow-hidden">
              <div className="aspect-video bg-white/5 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan">
          <span className="text-lg">✨</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Recommended for You</h2>
          <p className="text-sm text-gray-400">Based on your viewing history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((item) => (
          <Link
            key={item.id}
            href={`/content/${item.slug}`}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-deep-space/50 transition-all hover:border-neon-cyan/30 hover:shadow-[0_0_20px_rgba(0,245,212,0.1)]"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              {item.thumbnailUrl ? (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
                  <span className="text-3xl">🎬</span>
                </div>
              )}
              
              {/* Match badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-neon-purple/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <span>✨</span>
                <span>{item.matchScore}% match</span>
              </div>

              {/* Duration */}
              {item.duration && (
                <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                  {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-medium text-white line-clamp-2 group-hover:text-neon-cyan transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-neon-cyan/80">{item.matchReason}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// "Because you watched" horizontal scroll
export function BecauseYouWatched({ 
  basedOn, 
  recommendations 
}: { 
  basedOn: { title: string; slug: string };
  recommendations: RecommendedContent[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <section className="py-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Because you watched{' '}
        <Link href={`/content/${basedOn.slug}`} className="text-neon-cyan hover:underline">
          {basedOn.title}
        </Link>
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
        {recommendations.map((item) => (
          <Link
            key={item.id}
            href={`/content/${item.slug}`}
            className="group flex-shrink-0 w-48"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden">
              {item.thumbnailUrl ? (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
                  <span className="text-2xl">🎬</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-white line-clamp-2 group-hover:text-neon-cyan transition-colors">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
