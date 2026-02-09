/**
 * Skip to Content Link - Accessibility Component
 * 
 * Provides keyboard users with a way to skip past navigation
 * and go directly to the main content area.
 * 
 * This link is visually hidden until focused, then becomes visible.
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-night focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-neon-cyan"
    >
      Skip to main content
    </a>
  );
}
