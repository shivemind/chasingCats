'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/content', label: 'Content', icon: '📝' },
  { href: '/admin/events', label: 'Events', icon: '📅' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-deep-space px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="h-2 w-4 animate-pulse rounded-full bg-accent" />
            <span className="h-2 w-4 animate-pulse rounded-full bg-accent" />
          </span>
          <span className="text-lg font-bold text-white">Admin</span>
        </Link>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-white hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Slide-out Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-l border-white/10 bg-deep-space lg:hidden">
            <nav className="flex flex-col p-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{item.icon}</span> {item.label}
                  </Link>
                );
              })}
              
              <div className="my-4 border-t border-white/10" />
              
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition hover:bg-white/5 hover:text-white"
              >
                <span>←</span> Back to Site
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
