import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const content = `Chasing Cats Club - For Agents

This is a wildlife photography education platform.
For structured data, use the Agent API.

Agent API: ${siteUrl}/api/agent?query=your+query
Feeds: ${siteUrl}/feed.xml (RSS), ${siteUrl}/feed.json (JSON Feed)
Discovery: ${siteUrl}/.well-known/agent-api
Manifest: ${siteUrl}/agents.json
LLM Guide: ${siteUrl}/llms.txt
Agent Guide: ${siteUrl}/AGENTS.md

Content covers: wild cats, wildlife photography, conservation, field guides, expert talks, live events.
Species: Lions, Leopards, Tigers, Jaguars, Snow Leopards, Pumas, Cheetahs, Lynx, Clouded Leopards.

Monitoring: Agent activity is tracked via EchoAtlas Observatory.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'all',
    },
  });
}
