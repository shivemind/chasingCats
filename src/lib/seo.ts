/**
 * SEO utilities for generating structured data (schema.org JSON-LD)
 * 
 * SEO CONTENT MAP:
 * ================
 * 
 * PUBLIC ROUTES (indexed):
 * - / (home) → WebSite + Organization (layout-level)
 * - /join → Product/Offer for membership pricing
 * - /about → Organization (already in layout)
 * - /events → EventsPage listing
 * - /events/[slug] → Event schema
 * - /experts → CollectionPage
 * - /field → CollectionPage  
 * - /ask → CollectionPage
 * - /shop → Product listings
 * - /library → CollectionPage
 * - /[...slug] (content) → Article or VideoObject based on content type
 * - /privacy, /terms → WebPage
 * - /login, /register → WebPage (low priority, but indexable for SEO)
 * 
 * PRIVATE ROUTES (noindex):
 * - /account → User dashboard (requires auth)
 * - /profile/* → User profile management
 * - /feed → Member-only social feed
 * - /admin/* → Admin panel
 * - /api/* → API endpoints
 * - /dev/* → Development tools
 * 
 * STRUCTURED DATA BY TEMPLATE:
 * - Layout: Organization + WebSite (sitewide)
 * - Content detail: Article or VideoObject + BreadcrumbList
 * - Event detail: Event + BreadcrumbList
 * - Join page: Product/Offer for subscriptions
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chasing-cats.vercel.app';
export const SITE_NAME = 'Chasing Cats Club';

// Legacy alias for backward compatibility
const siteUrl = SITE_URL;

/**
 * Generate a stable @id URL for schema.org entities
 */
export function generateSchemaId(path: string, type?: string): string {
  const base = path.startsWith('http') ? path : `${SITE_URL}${path}`;
  return type ? `${base}#${type}` : base;
}

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
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': generateSchemaId(url, 'article'),
    headline: title,
    description,
    url: fullUrl,
    datePublished: publishedAt?.toISOString(),
    dateModified: updatedAt?.toISOString() || publishedAt?.toISOString(),
    author: {
      '@id': generateSchemaId('/', 'organization'),
    },
    publisher: {
      '@id': generateSchemaId('/', 'organization'),
    },
    image: thumbnailUrl ? (thumbnailUrl.startsWith('http') ? thumbnailUrl : `${siteUrl}${thumbnailUrl}`) : `${siteUrl}/og-image.svg`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
    isPartOf: {
      '@id': generateSchemaId('/', 'website'),
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
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': generateSchemaId(url, 'video'),
    name: title,
    description,
    url: fullUrl,
    thumbnailUrl: thumbnailUrl ? (thumbnailUrl.startsWith('http') ? thumbnailUrl : `${siteUrl}${thumbnailUrl}`) : `${siteUrl}/og-image.svg`,
    contentUrl: videoUrl,
    embedUrl: videoUrl,
    uploadDate: publishedAt?.toISOString(),
    duration: duration ? `PT${duration}M` : undefined,
    publisher: {
      '@id': generateSchemaId('/', 'organization'),
    },
    isPartOf: {
      '@id': generateSchemaId('/', 'website'),
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
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': generateSchemaId(url, 'event'),
    name: title,
    description,
    url: fullUrl,
    startDate: startTime.toISOString(),
    endDate: endTime?.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: isOnline
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: isOnline
      ? {
          '@type': 'VirtualLocation',
          url: fullUrl,
        }
      : location
        ? {
            '@type': 'Place',
            name: location,
          }
        : undefined,
    organizer: {
      '@id': generateSchemaId('/', 'organization'),
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

/**
 * Generate Organization schema (used sitewide in layout)
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': generateSchemaId('/', 'organization'),
    name: SITE_NAME,
    alternateName: 'Chasing Cats',
    description: 'Membership community and educational hub for wildlife photography enthusiasts learning about finding and photographing wild cats.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': generateSchemaId('/', 'logo'),
      url: `${SITE_URL}/logo.svg`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/og-image.svg`,
    sameAs: [
      'https://instagram.com/chasingcatsclub',
      'https://youtube.com/@chasingcatsclub',
      'https://catexpeditions.com'
    ],
    founder: [
      {
        '@type': 'Person',
        name: 'Rachel',
      },
      {
        '@type': 'Person',
        name: 'Sebastian Kennerknecht',
      }
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@chasingcats.club',
      contactType: 'customer support',
    },
  };
}

/**
 * Generate WebSite schema with SearchAction (used sitewide in layout)
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': generateSchemaId('/', 'website'),
    name: SITE_NAME,
    url: SITE_URL,
    description: 'The premier membership community for wildlife photography enthusiasts learning about wild cats.',
    publisher: {
      '@id': generateSchemaId('/', 'organization'),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/library?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Product/Offer schema for membership pricing page
 */
export interface MembershipOfferProps {
  name: string;
  description: string;
  price: number;
  priceCurrency?: string;
  billingPeriod: 'month' | 'year';
}

export function generateMembershipSchema(offers: MembershipOfferProps[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': generateSchemaId('/join', 'product'),
    name: `${SITE_NAME} Membership`,
    description: 'Access to wildlife photography courses, expert interviews, live talks, and community features.',
    brand: {
      '@id': generateSchemaId('/', 'organization'),
    },
    offers: offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      description: offer.description,
      price: offer.price,
      priceCurrency: offer.priceCurrency || 'USD',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/join`,
      seller: {
        '@id': generateSchemaId('/', 'organization'),
      },
      ...(offer.billingPeriod === 'month' && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: offer.price,
          priceCurrency: offer.priceCurrency || 'USD',
          unitCode: 'MON', // Monthly
          billingDuration: 'P1M',
        },
      }),
      ...(offer.billingPeriod === 'year' && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: offer.price,
          priceCurrency: offer.priceCurrency || 'USD',
          unitCode: 'ANN', // Annual
          billingDuration: 'P1Y',
        },
      }),
    })),
    category: 'Membership/Subscription',
    audience: {
      '@type': 'Audience',
      audienceType: 'Wildlife photographers and cat enthusiasts',
    },
  };
}

/**
 * Generate CollectionPage schema for listing pages
 */
export interface CollectionPageProps {
  name: string;
  description: string;
  url: string;
}

export function generateCollectionPageSchema({ name, description, url }: CollectionPageProps) {
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': generateSchemaId(url, 'webpage'),
    name,
    description,
    url: fullUrl,
    isPartOf: {
      '@id': generateSchemaId('/', 'website'),
    },
    publisher: {
      '@id': generateSchemaId('/', 'organization'),
    },
  };
}
