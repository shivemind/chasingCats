import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

/**
 * Sitemap Configuration
 * 
 * This sitemap includes all public, indexable pages:
 * - Static pages (home, about, join, etc.)
 * - Dynamic content pages (articles, videos, talks)
 * - Event pages
 * - Agent-friendly pages (docs, feeds)
 * 
 * EXCLUDED (private/auth-required):
 * - /account, /profile, /feed (member dashboard)
 * - /admin (admin panel)
 * - /api (API routes)
 * - /dev (development tools)
 * 
 * Revalidation: This sitemap revalidates every hour to pick up new content.
 */

// Revalidate sitemap every hour (3600 seconds)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all published content with caching via Prisma Accelerate
  const content = await prisma.content.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true, updatedAt: true, type: true },
    orderBy: { publishedAt: 'desc' },
  });

  // Get all events
  const events = await prisma.event.findMany({
    select: { slug: true, updatedAt: true, startTime: true },
    orderBy: { startTime: 'desc' },
  });

  // Static pages with stable last modified dates
  // Update these dates when the actual page content changes
  const siteLastUpdated = new Date('2026-02-01'); // Update this when site structure changes
  
  const staticPages = [
    // High priority - main entry points
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/join', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/events', priority: 0.9, changeFrequency: 'daily' as const },
    
    // Content hubs
    { url: '/experts', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/field', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/library', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/ask', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/shop', priority: 0.6, changeFrequency: 'weekly' as const },
    
    // Agent/LLM-friendly pages
    { url: '/docs', priority: 0.6, changeFrequency: 'monthly' as const },
    
    // Auth pages (lower priority but still indexable for SEO)
    { url: '/login', priority: 0.4, changeFrequency: 'monthly' as const },
    { url: '/register', priority: 0.5, changeFrequency: 'monthly' as const },
    
    // Legal pages (lowest priority)
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: siteLastUpdated,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Content routes - prioritize videos and courses higher
  const contentRoutes: MetadataRoute.Sitemap = content.map((item) => {
    const isVideo = item.type === 'VIDEO' || item.type === 'TALK' || item.type === 'COURSE';
    return {
      url: `${SITE_URL}/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: isVideo ? 0.75 : 0.7,
    };
  });

  // Event routes - upcoming events get higher priority
  const now = new Date();
  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => {
    const isUpcoming = new Date(event.startTime) > now;
    return {
      url: `${SITE_URL}/events/${event.slug}`,
      lastModified: event.updatedAt,
      changeFrequency: isUpcoming ? 'daily' as const : 'monthly' as const,
      priority: isUpcoming ? 0.85 : 0.6,
    };
  });

  return [...staticRoutes, ...contentRoutes, ...eventRoutes];
}
