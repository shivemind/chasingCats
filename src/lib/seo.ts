/**
 * SEO utilities for generating structured data
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chasing-cats.vercel.app';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${siteUrl}${item.href}`,
    })),
  };
}

export interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  publishedAt?: Date | null;
  updatedAt?: Date;
  authorName?: string;
  thumbnailUrl?: string | null;
}

export function generateArticleSchema({
  title,
  description,
  url,
  publishedAt,
  updatedAt,
  authorName = 'Chasing Cats Club',
  thumbnailUrl,
}: ArticleSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: url.startsWith('http') ? url : `${siteUrl}${url}`,
    datePublished: publishedAt?.toISOString(),
    dateModified: updatedAt?.toISOString() || publishedAt?.toISOString(),
    author: {
      '@type': 'Organization',
      name: authorName,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Chasing Cats Club',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.svg`,
      },
    },
    image: thumbnailUrl ? (thumbnailUrl.startsWith('http') ? thumbnailUrl : `${siteUrl}${thumbnailUrl}`) : `${siteUrl}/og-image.svg`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url.startsWith('http') ? url : `${siteUrl}${url}`,
    },
  };
}

export interface VideoSchemaProps {
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  duration?: number | null; // in minutes
  publishedAt?: Date | null;
}

export function generateVideoSchema({
  title,
  description,
  url,
  thumbnailUrl,
  videoUrl,
  duration,
  publishedAt,
}: VideoSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl: thumbnailUrl ? (thumbnailUrl.startsWith('http') ? thumbnailUrl : `${siteUrl}${thumbnailUrl}`) : `${siteUrl}/og-image.svg`,
    contentUrl: videoUrl,
    embedUrl: videoUrl,
    uploadDate: publishedAt?.toISOString(),
    duration: duration ? `PT${duration}M` : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Chasing Cats Club',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.svg`,
      },
    },
  };
}

export interface EventSchemaProps {
  title: string;
  description: string;
  url: string;
  startTime: Date;
  endTime?: Date | null;
  location?: string | null;
  host?: string | null;
  isOnline?: boolean;
}

export function generateEventSchema({
  title,
  description,
  url,
  startTime,
  endTime,
  location,
  host,
  isOnline = true,
}: EventSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    description,
    url: url.startsWith('http') ? url : `${siteUrl}${url}`,
    startDate: startTime.toISOString(),
    endDate: endTime?.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: isOnline
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: isOnline
      ? {
          '@type': 'VirtualLocation',
          url: url.startsWith('http') ? url : `${siteUrl}${url}`,
        }
      : location
        ? {
            '@type': 'Place',
            name: location,
          }
        : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Chasing Cats Club',
      url: siteUrl,
    },
    performer: host
      ? {
          '@type': 'Person',
          name: host,
        }
      : undefined,
    image: `${siteUrl}/og-image.svg`,
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
