'use client';

import { useState, useEffect, useCallback } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['g', 'h'], description: 'Go to Home', category: 'Navigation' },
  { keys: ['g', 'd'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['g', 'l'], description: 'Go to Library', category: 'Navigation' },
  { keys: ['g', 'e'], description: 'Go to Events', category: 'Navigation' },
  { keys: ['g', 'c'], description: 'Go to Community', category: 'Navigation' },
  
  // Search & Actions
  { keys: ['⌘', 'k'], description: 'Open search', category: 'Actions' },
  { keys: ['⌘', '/'], description: 'Focus search', category: 'Actions' },
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Actions' },
  { keys: ['Esc'], description: 'Close modal / Cancel', category: 'Actions' },
  
  // Video Player
  { keys: ['Space'], description: 'Play / Pause', category: 'Video' },
  { keys: ['f'], description: 'Toggle fullscreen', category: 'Video' },
  { keys: ['m'], description: 'Mute / Unmute', category: 'Video' },
  { keys: ['←'], description: 'Rewind 10 seconds', category: 'Video' },
  { keys: ['→'], description: 'Forward 10 seconds', category: 'Video' },
  { keys: ['j'], description: 'Rewind 10 seconds', category: 'Video' },
  { keys: ['l'], description: 'Forward 10 seconds', category: 'Video' },
  { keys: ['k'], description: 'Play / Pause', category: 'Video' },
  { keys: ['↑'], description: 'Volume up', category: 'Video' },
  { keys: ['↓'], description: 'Volume down', category: 'Video' },
  { keys: ['c'], description: 'Toggle captions', category: 'Video' },
  { keys: ['n'], description: 'Add note at current time', category: 'Video' },
  { keys: ['['], description: 'Previous chapter', category: 'Video' },
  { keys: [']'], description: 'Next chapter', category: 'Video' },
  { keys: ['0-9'], description: 'Skip to 0-90% of video', category: 'Video' },
  
  // Theme
  { keys: ['⌘', 'Shift', 'L'], description: 'Toggle light/dark mode', category: 'Theme' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const categories = [...new Set(shortcuts.map(s => s.category))];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/10 bg-deep-space overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-deep-space/95 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-cyan/20">
              <span className="text-lg">⌨️</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-400 mb-3">{category}</h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                    >
                      <span className="text-sm text-white">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center">
                            <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium text-white">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-gray-500">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-white/5 px-6 py-4">
          <p className="text-center text-sm text-gray-400">
            Press <kbd className="mx-1 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-xs">?</kbd> anytime to show this panel
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook to manage shortcuts modal
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable
    ) {
      return;
    }

    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

// Compact trigger button
export function KeyboardShortcutsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
    >
      <span>Shortcuts</span>
      <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-xs">?</kbd>
    </button>
  );
}
