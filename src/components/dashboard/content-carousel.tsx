'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string | null;
  description?: string | null;
  author?: string;
  duration?: string;
}

interface ContentCarouselProps {
  title: string;
  description?: string;
  icon: string;
  items: ContentItem[];
  viewAllHref: string;
  eyebrow?: string;
  accentColor?: 'cyan' | 'purple' | 'yellow';
}

export function ContentCarousel({
  title,
  description,
  icon,
  items,
  viewAllHref,
  eyebrow,
  accentColor = 'cyan'
}: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const accentClasses = {
    cyan: 'text-neon-cyan border-neon-cyan/30 hover:border-neon-cyan/60',
    purple: 'text-neon-purple border-neon-purple/30 hover:border-neon-purple/60',
    yellow: 'text-cat-eye border-cat-eye/30 hover:border-cat-eye/60',
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-xs sm:text-sm text-gray-400">{description}</p>
            )}
          </div>
        </div>
        <Link 
          href={viewAllHref} 
          className={`text-sm font-semibold ${accentClasses[accentColor].split(' ')[0]} hover:underline self-start sm:self-auto`}
        >
          See All →
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-deep-space/90 border border-white/20 flex items-center justify-center text-white hover:bg-deep-space transition-colors shadow-lg"
            aria-label="Scroll left"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {canScrollRight && items.length > 2 && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-deep-space/90 border border-white/20 flex items-center justify-center text-white hover:bg-deep-space transition-colors shadow-lg"
            aria-label="Scroll right"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${item.slug}`}
              className={`group flex-shrink-0 w-[260px] sm:w-[280px] rounded-xl border bg-white/5 overflow-hidden transition-all hover:bg-white/10 snap-start ${accentClasses[accentColor]}`}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-white/10 to-white/5 relative overflow-hidden">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="h-12 w-12 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v12h16V6H4zm6.5 3L16 12l-5.5 3V9z" />
                    </svg>
                  </div>
                )}
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                    <svg className="h-6 w-6 text-deep-space ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Duration badge */}
                {item.duration && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                    {item.duration}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="font-medium text-white line-clamp-2 group-hover:text-neon-cyan transition-colors">
                  {item.title}
                </p>
                {item.author && (
                  <p className="mt-1 text-xs text-gray-500">with {item.author}</p>
                )}
                {eyebrow && (
                  <span className={`mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider ${accentClasses[accentColor].split(' ')[0]}`}>
                    {eyebrow}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
