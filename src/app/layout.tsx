import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandPalette } from '@/components/search/command-palette';
import { SkipToContent } from '@/components/layout/skip-to-content';
import { auth } from '@/auth';
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { generateOrganizationSchema, generateWebSiteSchema, SITE_URL } from '@/lib/seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

// Canonical production URL - always use this for canonicals even on Vercel preview URLs
const canonicalUrl = 'https://chasing-cats.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Chasing Cats Club | Wildlife Photography Education',
    template: '%s | Chasing Cats Club'
  },
  description: 'Join the premier membership community for wildlife photography enthusiasts. Learn from Rachel and Sebastian about finding, tracking, and photographing wild cats around the world.',
  keywords: [
    'wildlife photography',
    'wild cats',
    'cat photography',
    'wildlife education',
    'nature photography',
    'big cats',
    'wildlife tracking',
    'photography courses',
    'wildlife tours',
    'Sebastian Kennerknecht',
    'Rachel',
    'lynx photography',
    'leopard photography',
    'tiger photography',
    'puma photography'
  ],
  authors: [{ name: 'Rachel & Sebastian', url: canonicalUrl }],
  creator: 'Chasing Cats Club',
  publisher: 'Chasing Cats Club',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: canonicalUrl,
    siteName: 'Chasing Cats Club',
    title: 'Chasing Cats Club | Wildlife Photography Education',
    description: 'Join the premier membership community for wildlife photography enthusiasts. Learn to find and photograph wild cats from the experts.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Chasing Cats Club - Wildlife Photography Education'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chasing Cats Club | Wildlife Photography Education',
    description: 'Join the premier membership community for wildlife photography enthusiasts.',
    images: ['/og-image.svg'],
    creator: '@chasingcatsclub',
    site: '@chasingcatsclub'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: canonicalUrl,
    languages: {
      'en-US': canonicalUrl,
    },
    types: {
      'application/rss+xml': `${canonicalUrl}/feed.xml`,
      'application/feed+json': `${canonicalUrl}/feed.json`,
    },
  },
  category: 'education',
  other: {
    'msapplication-TileColor': '#0a0a1a',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F1E3' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a1a' }
  ]
};

// JSON-LD Structured Data - Organization and WebSite schemas for sitewide SEO
const organizationSchema = generateOrganizationSchema();
const webSiteSchema = generateWebSiteSchema();

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for analytics and other services */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Feeds for RSS readers and AI agents */}
        <link rel="alternate" type="application/rss+xml" title="Chasing Cats Club RSS Feed" href="/feed.xml" />
        <link rel="alternate" type="application/feed+json" title="Chasing Cats Club JSON Feed" href="/feed.json" />
        
        {/* Organization schema - sitewide */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* WebSite schema with SearchAction - sitewide */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body
      className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-[#F5F1E3] text-night antialiased`}>
        {/* Skip to content link for accessibility - keyboard users can skip navigation */}
        <SkipToContent />
        
        <AuthSessionProvider session={session}>
          <CommandPalette />
          <Navbar />
          <main id="main-content" className="flex-1 pb-24 isolate" tabIndex={-1}>{children}</main>
          <Footer />
          <MobileNav />
        </AuthSessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
