import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const linkset = {
    linkset: [
      {
        anchor: `${siteUrl}/.well-known/api-catalog`,
        profile: 'https://www.rfc-editor.org/info/rfc9727',
        item: [
          { href: `${siteUrl}/api/agent` },
          { href: `${siteUrl}/api/search` },
          { href: `${siteUrl}/.well-known/agent-api` },
          { href: `${siteUrl}/agents.json` },
          { href: `${siteUrl}/llms.txt` },
          { href: `${siteUrl}/AGENTS.md` },
          { href: `${siteUrl}/for-agents.txt` },
          { href: `${siteUrl}/feed.xml` },
          { href: `${siteUrl}/feed.json` },
          { href: `${siteUrl}/podcast.xml` },
        ],
        'service-doc': [
          { href: `${siteUrl}/AGENTS.md`, type: 'text/plain' },
          { href: `${siteUrl}/llms.txt`, type: 'text/plain' },
        ],
      },
    ],
  };

  return NextResponse.json(linkset, {
    headers: {
      'Content-Type': 'application/linkset+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'all',
      'Content-Language': 'en',
    },
  });
}
