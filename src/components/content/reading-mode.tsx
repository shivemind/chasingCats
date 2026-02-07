'use client';

import { useState, useEffect } from 'react';

interface ReadingModeProps {
  title: string;
  content: string;
  author?: {
    name: string;
    avatarUrl?: string;
  };
  publishedAt?: string;
  estimatedReadTime?: number;
  onClose: () => void;
}

export function ReadingMode({ title, content, author, publishedAt, estimatedReadTime, onClose }: ReadingModeProps) {
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [maxWidth, setMaxWidth] = useState(680);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setFontSize(prev => Math.min(prev + 2, 28));
      } else if (e.key === '-' || e.key === '_') {
        setFontSize(prev => Math.max(prev - 2, 14));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a2e] overflow-y-auto">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-neon-cyan transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Toolbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-deep-space/90 backdrop-blur-md px-4 py-2 shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          title="Exit reading mode (Esc)"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Font size controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize(prev => Math.max(prev - 2, 14))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Decrease font size (-)"
          >
            <span className="text-sm font-bold">A-</span>
          </button>
          <span className="w-8 text-center text-xs text-gray-400">{fontSize}</span>
          <button
            onClick={() => setFontSize(prev => Math.min(prev + 2, 28))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Increase font size (+)"
          >
            <span className="text-lg font-bold">A+</span>
          </button>
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Line height */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLineHeight(prev => Math.max(prev - 0.2, 1.4))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Decrease line height"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setLineHeight(prev => Math.min(prev + 0.2, 2.4))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Increase line height"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Width control */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMaxWidth(prev => Math.max(prev - 60, 500))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Narrower"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => setMaxWidth(prev => Math.min(prev + 60, 900))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Wider"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l7-7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <article 
        className="mx-auto px-6 py-24"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        {/* Header */}
        <header className="mb-12">
          <h1 
            className="text-4xl font-bold text-white mb-6 leading-tight"
            style={{ fontSize: `${fontSize + 16}px` }}
          >
            {title}
          </h1>
          
          <div className="flex items-center gap-4 text-gray-400">
            {author && (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt={author.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span>{author.name[0]}</span>
                  )}
                </div>
                <span className="text-white">{author.name}</span>
              </div>
            )}
            {publishedAt && (
              <span>{new Date(publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            )}
            {estimatedReadTime && (
              <span>{estimatedReadTime} min read</span>
            )}
          </div>
        </header>

        {/* Article content */}
        <div 
          className="prose prose-invert prose-lg max-w-none"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* End marker */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-2xl">🐱</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      </article>
    </div>
  );
}

// Button to enter reading mode
export function ReadingModeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      Reading Mode
    </button>
  );
}
