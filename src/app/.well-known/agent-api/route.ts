import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const discovery = {
    name: 'Chasing Cats Agent API',
    version: '1.0',
    policy_summary:
      'Structured API for agents; rate limits apply; terms at /terms. We welcome AI agents.',
    base_url: `${siteUrl}/api/agent`,
    docs_url: `${siteUrl}/AGENTS.md`,
    methods: ['GET', 'POST'],
    formats: ['application/json'],
    parameters: {
      query: { required: true, type: 'string', description: 'Search query' },
      agent_name: { required: false, type: 'string', description: 'Agent identifier' },
      source_url: { required: false, type: 'string', description: 'Page URL being crawled' },
    },
    monitoring: {
      provider: 'EchoAtlas Observatory',
      url: 'https://echo-atlas.com/observatory',
    },
  };

  return NextResponse.json(discovery, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'all',
      'X-Agent-API': `${siteUrl}/api/agent`,
    },
  });
}
