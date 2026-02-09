import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

interface EpisodeWithCategory {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  audioUrl: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  duration: number | null;
  category: { name: string } | null;
}

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  // Get podcast settings or use defaults
  const settings = await prisma.podcastSettings.findFirst().catch(() => null);
  
  const podcastTitle = settings?.title || 'Chasing Cats Podcast';
  const podcastDescription = settings?.description || 'Wildlife photography education from Rachel & Sebastian. Learn to find, track, and photograph wild cats around the world.';
  const podcastAuthor = settings?.author || 'Rachel & Sebastian';
  const podcastEmail = settings?.email || 'podcast@chasingcats.club';
  const podcastImage = settings?.imageUrl || `${SITE_URL}/podcast-cover.jpg`;
  const podcastLanguage = settings?.language || 'en';
  const podcastCategory = settings?.category || 'Education';
  const podcastExplicit = settings?.explicit ? 'yes' : 'no';

  // Get content with audio URLs
  const episodes = await prisma.content.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { audioUrl: { not: null } },
        { type: 'TALK' } // Include talks even without explicit audio
      ]
    },
    orderBy: { publishedAt: 'desc' },
    take: 100,
    include: { category: true }
  }) as unknown as EpisodeWithCategory[];

  const feedItems = episodes.map(episode => {
    // Use audio URL if available, otherwise construct from video
    const audioUrl = episode.audioUrl || episode.videoUrl;
    if (!audioUrl) return null;

    const pubDate = episode.publishedAt 
      ? new Date(episode.publishedAt).toUTCString() 
      : new Date(episode.createdAt).toUTCString();
    
    const duration = episode.duration 
      ? formatDuration(episode.duration) 
      : '00:30:00';

    return `
    <item>
      <title><![CDATA[${escapeXml(episode.title)}]]></title>
      <description><![CDATA[${escapeXml(episode.excerpt)}]]></description>
      <link>${SITE_URL}/content/${episode.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/content/${episode.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${escapeXml(audioUrl)}" type="audio/mpeg" length="0" />
      <itunes:title><![CDATA[${escapeXml(episode.title)}]]></itunes:title>
      <itunes:summary><![CDATA[${escapeXml(episode.excerpt)}]]></itunes:summary>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:explicit>no</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
      ${episode.thumbnailUrl ? `<itunes:image href="${escapeXml(episode.thumbnailUrl)}" />` : ''}
      ${episode.category ? `<itunes:keywords>${escapeXml(episode.category.name)}</itunes:keywords>` : ''}
    </item>`;
  }).filter(Boolean).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${escapeXml(podcastTitle)}]]></title>
    <description><![CDATA[${escapeXml(podcastDescription)}]]></description>
    <link>${SITE_URL}</link>
    <language>${podcastLanguage}</language>
    <copyright>© ${new Date().getFullYear()} Chasing Cats Club</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/podcast.xml" rel="self" type="application/rss+xml"/>
    
    <itunes:author>${escapeXml(podcastAuthor)}</itunes:author>
    <itunes:summary><![CDATA[${escapeXml(podcastDescription)}]]></itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:owner>
      <itunes:name>${escapeXml(podcastAuthor)}</itunes:name>
      <itunes:email>${escapeXml(podcastEmail)}</itunes:email>
    </itunes:owner>
    <itunes:explicit>${podcastExplicit}</itunes:explicit>
    <itunes:category text="${escapeXml(podcastCategory)}">
      <itunes:category text="How To"/>
    </itunes:category>
    <itunes:image href="${escapeXml(podcastImage)}"/>
    
    ${feedItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
}
