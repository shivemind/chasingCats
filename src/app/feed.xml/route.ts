import { prisma } from '@/lib/prisma';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import type { Content, Category } from '@prisma/client';

/**
 * RSS Feed (feed.xml)
 * 
 * Provides an RSS 2.0 feed of the latest published content.
 * Used by RSS readers and AI agents for content syndication.
 * 
 * Revalidates every hour to pick up new content.
 */

export const revalidate = 3600; // Revalidate every hour

type ContentWithCategory = Content & { category: Pick<Category, 'name'> | null };

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

  // Get latest events
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
    },
  });

  const lastBuildDate = new Date().toUTCString();
  
  // Find the most recent update
  const latestContentDate = content[0]?.publishedAt ?? new Date();
  const latestEventDate = events[0]?.updatedAt ?? new Date();
  const pubDate = new Date(Math.max(latestContentDate.getTime(), latestEventDate.getTime())).toUTCString();

  const rssItems = [
    // Content items
    ...content.map((item) => {
      const url = `${SITE_URL}/${item.slug}`;
      const pubDateStr = item.publishedAt ? new Date(item.publishedAt).toUTCString() : '';
      const category = item.category?.name || item.type;
      
      return `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${item.excerpt}]]></description>
      <pubDate>${pubDateStr}</pubDate>
      <category><![CDATA[${category}]]></category>
      ${item.thumbnailUrl ? `<enclosure url="${item.thumbnailUrl.startsWith('http') ? item.thumbnailUrl : SITE_URL + item.thumbnailUrl}" type="image/jpeg" />` : ''}
    </item>`;
    }),
    // Event items
    ...events.map((event) => {
      const url = `${SITE_URL}/events/${event.slug}`;
      const pubDateStr = new Date(event.updatedAt).toUTCString();
      
      return `
    <item>
      <title><![CDATA[Event: ${event.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${event.description}]]></description>
      <pubDate>${pubDateStr}</pubDate>
      <category><![CDATA[Events]]></category>
    </item>`;
    }),
  ].join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>Wildlife photography education, expert talks, and conservation insights about wild cats from Rachel and Sebastian.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${pubDate}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/logo.svg</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
    <managingEditor>hello@chasingcats.club (Chasing Cats Club)</managingEditor>
    <webMaster>hello@chasingcats.club (Chasing Cats Club)</webMaster>
    <category>Education</category>
    <category>Wildlife Photography</category>
    <category>Conservation</category>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
