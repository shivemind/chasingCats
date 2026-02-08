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

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0 },
    { url: '/join', priority: 0.9 },
    { url: '/about', priority: 0.8 },
    { url: '/experts', priority: 0.8 },
    { url: '/field', priority: 0.8 },
    { url: '/ask', priority: 0.7 },
    { url: '/login', priority: 0.5 },
    { url: '/register', priority: 0.5 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
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
