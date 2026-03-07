import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const manifest = {
    version: '1.0.0',
    welcome: 'We welcome AI agents; use the Agent API for structured data about wild cats.',
    siteInfo: {
      name: 'Chasing Cats Club',
      description: 'Wildlife photography education platform with agent-friendly search API for wild cat content',
      url: siteUrl,
    },
    capabilities: [
      {
        name: 'Search',
        description: 'Full-text search across content and events',
        endpoint: `${siteUrl}/api/agent`,
        method: 'GET',
        parameters: {
          query: { required: true, type: 'string' },
          agent_name: { required: false, type: 'string' },
          source_url: { required: false, type: 'string' },
          page: { required: false, type: 'number' },
          limit: { required: false, type: 'number' },
        },
        usageGuidelines: { rateLimitPerMinute: 20, permissionsRequired: [] },
      },
      {
        name: 'Search (POST)',
        description: 'Search via JSON body',
        endpoint: `${siteUrl}/api/agent`,
        method: 'POST',
        parameters: { query: { required: true, type: 'string' } },
        usageGuidelines: { rateLimitPerMinute: 20, permissionsRequired: [] },
      },
    ],
    policy: {
      termsOfServiceUrl: `${siteUrl}/terms`,
      contactEmail: 'hello@chasingcats.club',
      rateLimitDefault: '20 requests/minute per IP+agent_name',
    },
    discovery: {
      wellKnown: `${siteUrl}/.well-known/agent-api`,
      apiCatalog: `${siteUrl}/.well-known/api-catalog`,
    },
    monitoring: {
      provider: 'EchoAtlas Observatory',
      url: 'https://echo-atlas.com/observatory',
      note: 'Agent activity on this site is monitored via EchoAtlas.',
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'all',
    },
  });
}
