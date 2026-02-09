'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SearchButton } from '@/components/search/command-palette';
import { NotificationBell } from '@/components/notifications/notification-bell';

const navigation = [
  { name: 'From the Experts', href: '/experts' },
  { name: 'Into the Field', href: '/field' },
  { name: 'Ask me Anything', href: '/ask' },
  { name: 'Shop', href: '/shop' }
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-midnight/90 backdrop-blur-xl isolate" role="banner">
      <div className="container-section flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-midnight rounded-lg" aria-label="Chasing Cats Club - Home">
          <span className="flex gap-1">
            <span className="h-2 w-4 animate-pulse rounded-full bg-cat-eye-green shadow-cat-eye" />
            <span className="h-2 w-4 animate-pulse rounded-full bg-cat-eye-green shadow-cat-eye" style={{ animationDelay: '0.3s' }} />
          </span>
          <span className="bg-gradient-to-r from-white via-neon-cyan to-white bg-clip-text text-transparent">
            Chasing Cats
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:gap-8 md:flex flex-1 justify-center" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium text-white/60 transition-colors hover:text-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-midnight rounded px-2 py-1 whitespace-nowrap',
                pathname.startsWith(item.href) && 'text-neon-cyan'
              )}
              aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:gap-3 md:flex flex-shrink-0">
          <SearchButton />
          {session?.user ? (
            <>
              <Link
                href="/feed"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-neon-cyan whitespace-nowrap',
                  pathname === '/feed' ? 'text-neon-cyan' : 'text-white/60'
                )}
              >
                🦁 Feed
              </Link>
              <NotificationBell />
              <Link
                href="/account"
                className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 lg:px-4 py-2 text-sm font-medium text-neon-cyan transition hover:bg-neon-cyan/20 whitespace-nowrap"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-medium text-white/60 hover:text-white whitespace-nowrap"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white">
                Sign in
              </Link>
              <Link
                href="/join"
                className="rounded-full bg-gradient-to-r from-neon-cyan to-brand px-5 py-2 text-sm font-semibold text-night shadow-glow transition hover:shadow-glow-accent"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md p-2 text-white md:hidden focus:outline-none focus:ring-2 focus:ring-neon-cyan"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <div id="mobile-navigation" className="border-t border-white/10 bg-midnight/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
            {/* Mobile search and notifications for logged-in users */}
            {session?.user && (
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <SearchButton />
                <NotificationBell />
              </div>
            )}
            
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-base font-medium text-white/70 hover:text-neon-cyan',
                  pathname.startsWith(item.href) && 'text-neon-cyan'
                )}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link 
                  href="/feed" 
                  className={cn(
                    'text-base font-medium hover:text-neon-cyan',
                    pathname === '/feed' ? 'text-neon-cyan' : 'text-white/70'
                  )}
                  onClick={() => setOpen(false)}
                >
                  🦁 Pride Feed
                </Link>
                <Link href="/account" className="text-base font-medium text-neon-cyan" onClick={() => setOpen(false)}>
                  Your Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="text-left text-base font-medium text-white/70"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-base font-medium text-white" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link
                  href="/join"
                  className="rounded-full bg-gradient-to-r from-neon-cyan to-brand px-5 py-2 text-center text-sm font-semibold text-night shadow-glow"
                  onClick={() => setOpen(false)}
                >
                  Join Now
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
