'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? 'text-neon-cyan' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/content',
    label: 'Content',
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? 'text-neon-cyan' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/events',
    label: 'Events',
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? 'text-neon-cyan' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/feed',
    label: 'Feed',
    icon: (active: boolean) => (
      <span className={`text-2xl ${active ? 'grayscale-0' : 'grayscale opacity-60'}`}>🦁</span>
    ),
    authRequired: true,
  },
  {
    href: '/account',
    label: 'Account',
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? 'text-neon-cyan' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    authRequired: true,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { status } = useSession();

  // Filter items based on auth status
  const visibleItems = NAV_ITEMS.filter(item => 
    !item.authRequired || status === 'authenticated'
  );

  // Add login if not authenticated
  if (status !== 'authenticated') {
    visibleItems.push({
      href: '/auth/login',
      label: 'Login',
      icon: (active: boolean) => (
        <svg className={`h-6 w-6 ${active ? 'text-neon-cyan' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-deep-space/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-3 transition-all ${
                isActive 
                  ? 'text-neon-cyan' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.icon(isActive)}
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-deep-space" />
    </nav>
  );
}
