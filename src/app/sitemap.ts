import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chasing-cats.vercel.app';

  // Get all published content
  const content = await prisma.content.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true, updatedAt: true },
  });

  // Get all events
  const events = await prisma.event.findMany({
    select: { slug: true, updatedAt: true },
  });

  // Static pages with stable last modified dates
  // Update these dates when the actual page content changes
  const siteLastUpdated = new Date('2026-02-01'); // Update this when site structure changes
  
  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/join', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/events', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/experts', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/field', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/library', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/ask', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/shop', priority: 0.6, changeFrequency: 'weekly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/login', priority: 0.4, changeFrequency: 'monthly' as const },
    { url: '/register', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: siteLastUpdated,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Content routes
  const contentRoutes: MetadataRoute.Sitemap = content.map((item) => ({
    url: `${baseUrl}/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Event routes
  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...contentRoutes, ...eventRoutes];
}
