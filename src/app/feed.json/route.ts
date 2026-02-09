import { prisma } from '@/lib/prisma';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import type { Content, Category } from '@prisma/client';

/**
 * JSON Feed (feed.json)
 * 
 * Provides a JSON Feed 1.1 compliant feed of the latest published content.
 * JSON Feed is easier to parse than RSS and is preferred by many modern apps.
 * 
 * Spec: https://jsonfeed.org/version/1.1
 * 
 * Revalidates every hour to pick up new content.
 */

export const revalidate = 3600; // Revalidate every hour

type ContentWithCategory = Content & { category: Pick<Category, 'name'> | null };

interface JSONFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published?: string;
  date_modified?: string;
  image?: string;
  tags?: string[];
  authors?: Array<{ name: string; url?: string }>;
}

interface JSONFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  icon: string;
  favicon: string;
  authors: Array<{ name: string; url?: string }>;
  language: string;
  items: JSONFeedItem[];
}

export async function GET() {
  // Get latest 50 published content items
  const content = await prisma.content.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    include: {
      category: {
        select: { name: true },
      },
    },
  }) as ContentWithCategory[];

  // Get upcoming events
  const events = await prisma.event.findMany({
    where: { startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      startTime: true,
      updatedAt: true,
      host: true,
    },
  });

  const items: JSONFeedItem[] = [
    // Content items
    ...content.map((item) => {
      const feedItem: JSONFeedItem = {
        id: `${SITE_URL}/${item.slug}`,
        url: `${SITE_URL}/${item.slug}`,
        title: item.title,
        content_text: item.excerpt,
        tags: [item.category?.name || item.type].filter(Boolean) as string[],
        authors: [{ name: 'Chasing Cats Club', url: SITE_URL }],
      };

      if (item.publishedAt) {
        feedItem.date_published = item.publishedAt.toISOString();
      }
      if (item.updatedAt) {
        feedItem.date_modified = item.updatedAt.toISOString();
      }
      if (item.thumbnailUrl) {
        feedItem.image = item.thumbnailUrl.startsWith('http') 
          ? item.thumbnailUrl 
          : `${SITE_URL}${item.thumbnailUrl}`;
      }

      return feedItem;
    }),
    // Event items
    ...events.map((event) => {
      const feedItem: JSONFeedItem = {
        id: `${SITE_URL}/events/${event.slug}`,
        url: `${SITE_URL}/events/${event.slug}`,
        title: `Event: ${event.title}`,
        content_text: event.description,
        date_published: event.startTime.toISOString(),
        date_modified: event.updatedAt.toISOString(),
        tags: ['Events'],
        authors: event.host 
          ? [{ name: event.host }]
          : [{ name: 'Chasing Cats Club', url: SITE_URL }],
      };

      return feedItem;
    }),
  ];

  const feed: JSONFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_NAME,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: 'Wildlife photography education, expert talks, and conservation insights about wild cats from Rachel and Sebastian.',
    icon: `${SITE_URL}/icon-512.svg`,
    favicon: `${SITE_URL}/favicon.ico`,
    authors: [
      { name: 'Rachel & Sebastian', url: SITE_URL },
    ],
    language: 'en-US',
    items,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
