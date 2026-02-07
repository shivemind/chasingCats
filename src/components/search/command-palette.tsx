'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  type: 'content' | 'event' | 'page';
  url: string;
  description?: string;
  icon: string;
}

const QUICK_LINKS: SearchResult[] = [
  { id: 'home', title: 'Home', type: 'page', url: '/', icon: '🏠' },
  { id: 'content', title: 'All Content', type: 'page', url: '/content', icon: '📚' },
  { id: 'events', title: 'Events', type: 'page', url: '/events', icon: '📅' },
  { id: 'account', title: 'My Account', type: 'page', url: '/account', icon: '👤' },
  { id: 'pricing', title: 'Membership', type: 'page', url: '/pricing', icon: '💎' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open/close with keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults(QUICK_LINKS);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search API
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(QUICK_LINKS);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      const searchResults: SearchResult[] = [
        ...data.content?.map((c: { id: string; title: string; slug: string; excerpt?: string }) => ({
          id: c.id,
          title: c.title,
          type: 'content' as const,
          url: `/content/${c.slug}`,
          description: c.excerpt,
          icon: '🎬',
        })) || [],
        ...data.events?.map((e: { id: string; title: string; slug: string; host?: string }) => ({
          id: e.id,
          title: e.title,
          type: 'event' as const,
          url: `/events/${e.slug}`,
          description: e.host ? `Hosted by ${e.host}` : undefined,
          icon: '📅',
        })) || [],
      ];

      // Filter quick links that match
      const matchingQuickLinks = QUICK_LINKS.filter(link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults([...matchingQuickLinks, ...searchResults]);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].url);
    }
  };

  const navigate = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[20%] z-[101] mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-deep-space shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <svg className="h-5 w-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search content, events, pages..."
            className="flex-1 bg-transparent text-lg text-white placeholder-gray-400 outline-none"
          />
          <kbd className="hidden rounded bg-white/10 px-2 py-1 text-xs text-gray-400 sm:inline">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => navigate(result.url)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                    index === selectedIndex
                      ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-white'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.description && (
                      <div className="text-sm text-gray-400 truncate">{result.description}</div>
                    )}
                  </div>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    result.type === 'content' ? 'bg-neon-cyan/20 text-neon-cyan' :
                    result.type === 'event' ? 'bg-neon-purple/20 text-neon-purple' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-gray-400">
          <div className="flex gap-4">
            <span><kbd className="rounded bg-white/10 px-1.5 py-0.5">↑↓</kbd> navigate</span>
            <span><kbd className="rounded bg-white/10 px-1.5 py-0.5">↵</kbd> select</span>
          </div>
          <span>🐱 ChasingCats Search</span>
        </div>
      </div>
    </>
  );
}

// Button to trigger search
export function SearchButton() {
  const handleClick = () => {
    // Dispatch keyboard event to trigger command palette
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 text-xs sm:inline">⌘K</kbd>
    </button>
  );
}
