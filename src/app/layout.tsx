import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandPalette } from '@/components/search/command-palette';
import { auth } from '@/auth';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chasing-cats.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  authors: [{ name: 'Rachel & Sebastian', url: siteUrl }],
  creator: 'Chasing Cats Club',
  publisher: 'Chasing Cats Club',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Chasing Cats Club',
    title: 'Chasing Cats Club | Wildlife Photography Education',
    description: 'Join the premier membership community for wildlife photography enthusiasts. Learn to find and photograph wild cats from the experts.',
    images: [
      {
        url: '/og-image.jpg',
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
    images: ['/og-image.jpg'],
    creator: '@chasingcatsclub'
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
    canonical: siteUrl
  },
  category: 'education'
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

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Chasing Cats Club',
  description: 'Membership community and educational hub for wildlife photography enthusiasts learning about finding and photographing wild cats.',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [
    'https://instagram.com/chasingcatsclub',
    'https://youtube.com/@chasingcatsclub',
    'https://catexpeditions.com'
  ],
  offers: {
    '@type': 'Offer',
    category: 'Membership',
    description: 'Access to wildlife photography courses, expert interviews, and community'
  }
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
      className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-[#F5F1E3] text-night antialiased`}>

        <AuthSessionProvider session={session}>
          <CommandPalette />
          <Navbar />
          <main className="flex-1 pb-24">{children}</main>
          <Footer />
          <MobileNav />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
