'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
    <header className="sticky top-0 z-50 bg-sand/90 backdrop-blur">
      <div className="container-section flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-night">
          Chasing Cats Club
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium text-night/70 transition-colors hover:text-night',
                pathname.startsWith(item.href) && 'text-night'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {session?.user ? (
            <>
              <Link
                href="/account"
                className="rounded-full border border-night/10 px-4 py-2 text-sm font-medium text-night hover:bg-night/5"
              >
                Your Profile
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-medium text-night/70 hover:text-night"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-night/70 hover:text-night">
                Sign in
              </Link>
              <Link
                href="/join"
                className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-dark"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md p-2 text-night md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-night/10 bg-sand/95 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-base font-medium text-night/70 hover:text-night',
                  pathname.startsWith(item.href) && 'text-night'
                )}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link href="/account" className="text-base font-medium text-night" onClick={() => setOpen(false)}>
                  Your Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="text-left text-base font-medium text-night/70"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-base font-medium text-night" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link
                  href="/join"
                  className="rounded-full bg-brand px-5 py-2 text-center text-sm font-semibold text-white"
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
