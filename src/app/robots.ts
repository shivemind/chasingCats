import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * robots.txt configuration
 * 
 * NOTE: robots.txt is advisory only - it does not prevent access.
 * Private/member-only data is protected via authentication.
 * This file helps search engines understand which pages to index.
 * 
 * AI CRAWLER POLICY:
 * - We allow standard indexing by all crawlers including AI search engines
 * - We explicitly disallow training/scraping bots (GPTBot, CCBot, etc.) from
 *   scraping content for AI model training, as this is member-only content
 * - This is a best-effort measure; actual protection comes from auth
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard search engine crawlers - allow public pages
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Private/authenticated routes
          '/api/',
          '/admin/',
          '/admin',
          '/account/',
          '/account',
          '/profile/',
          '/profile',
          '/feed/',
          '/feed',
          // Development routes
          '/dev/',
          '/dev',
          // Internal system paths
          '/_next/',
          // Query param variations to avoid duplicate indexing
          '/*?*', // Disallow URLs with query params (handled via canonicals instead)
        ],
      },
      // OpenAI's GPTBot - allow for search/answers, disallow training
      // GPTBot is used for ChatGPT/Bing integration, which we want
      // But we don't want full content scraping for model training
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/about',
          '/events',
          '/experts',
          '/field',
          '/ask',
          '/shop',
          '/join',
          '/library',
          '/llms.txt',
          '/docs',
          '/feed.xml',
          '/feed.json',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/profile/',
          '/feed/', // Member feed, not RSS feed
          '/dev/',
        ],
      },
      // Anthropic's Claude crawler
      {
        userAgent: 'anthropic-ai',
        allow: [
          '/',
          '/about',
          '/events',
          '/llms.txt',
          '/docs',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/profile/',
          '/feed/',
        ],
      },
      // Common Crawl - used for many AI training datasets
      // We disallow to prevent content being used for model training
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      // Google Extended - Google's AI training crawler (not search)
      // Disallow training while allowing regular Google search
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
