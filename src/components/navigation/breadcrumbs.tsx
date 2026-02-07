'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

// Auto-generate breadcrumbs from pathname if items not provided
const pathLabels: Record<string, string> = {
  content: 'Library',
  events: 'Events',
  community: 'Community',
  account: 'Account',
  dashboard: 'Dashboard',
  admin: 'Admin',
  settings: 'Settings',
  gallery: 'Gallery',
  forums: 'Forums',
  learn: 'Learning Paths',
  certificates: 'Certificates',
};

export function Breadcrumbs({ items, showHome = true, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname if not provided
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];
    
    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = pathLabels[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      crumbs.push({ label, href });
    });
    
    return crumbs;
  })();

  if (breadcrumbs.length === 0 && !showHome) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center gap-2">
        {/* Home */}
        {showHome && (
          <li className="flex items-center">
            <Link 
              href="/"
              className="flex items-center gap-1 text-gray-400 hover:text-neon-cyan transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="sr-only md:not-sr-only">Home</span>
            </Link>
          </li>
        )}

        {/* Separator and items */}
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {/* Separator */}
              {(showHome || index > 0) && (
                <svg 
                  className="h-4 w-4 mx-1 text-gray-600 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              
              {/* Item */}
              {isLast ? (
                <span className="flex items-center gap-1 text-white font-medium truncate max-w-[200px]">
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="flex items-center gap-1 text-gray-400 hover:text-neon-cyan transition-colors truncate max-w-[150px]"
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Compact breadcrumbs for mobile
export function BreadcrumbsCompact({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];
    
    segments.forEach((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = pathLabels[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      crumbs.push({ label, href });
    });
    
    return crumbs;
  })();

  if (breadcrumbs.length <= 1) return null;

  const previousItem = breadcrumbs[breadcrumbs.length - 2];

  return (
    <Link 
      href={previousItem.href}
      className={`inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-neon-cyan transition-colors ${className}`}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back to {previousItem.label}</span>
    </Link>
  );
}
