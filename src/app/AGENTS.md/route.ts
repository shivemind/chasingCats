import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const content = `# Chasing Cats Club - Agent Guide

We welcome AI agents. Use the Agent API for structured data about wild cat photography and conservation.

## Quick Start

1. Discover: GET ${siteUrl}/.well-known/agent-api
2. Search: GET ${siteUrl}/api/agent?query=your+query
3. Feeds: ${siteUrl}/feed.xml (RSS) or ${siteUrl}/feed.json (JSON Feed)

## Required Parameters
- \`query\` (Agent API): Search terms - required for /api/agent

## Recommended Headers
- \`User-Agent\`: Identify your agent (e.g. MyBot/1.0)
- \`Accept-Language\`: en (reduces false bot detection)
- \`X-Bot-Intent\`: \`agent\` - send this to receive plaintext instructions instead of HTML

## Rate Limits
- Agent API: 20 req/min per IP+agent_name

## Machine-Readable Manifests
- agents.json: ${siteUrl}/agents.json
- api-catalog (RFC 9727): ${siteUrl}/.well-known/api-catalog
- llms.txt: ${siteUrl}/llms.txt

## Content Types
Articles, videos, talks, courses, and news about wild cat photography and conservation.

## Monitoring
Agent activity is monitored via EchoAtlas Observatory (https://echo-atlas.com/observatory).

## Error Codes
- INVALID_QUERY: query required and non-empty
- RATE_LIMITED: 429, check Retry-After
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'all',
    },
  });
}
