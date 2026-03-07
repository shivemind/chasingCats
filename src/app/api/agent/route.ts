import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { reportAgentVisit, reportTrapHit } from '@/lib/echoatlas/telemetry';
import { hashIp } from '@/lib/echoatlas/ip-hash';
import { matchesTrapPhrase } from '@/lib/echoatlas/trap-phrases';
import { autoPostEvent } from '@/lib/echoatlas/social';

function problemJson(status: number, type: string, title: string, detail: string) {
  return NextResponse.json(
    { type, title, detail, status },
    {
      status,
      headers: { 'Content-Type': 'application/problem+json' },
    },
  );
}

async function handleSearch(request: Request) {
  const ip = getClientIp(request);
  const ua = request.headers.get('user-agent') ?? '';

  let query = '';
  let agentName = '';
  let sourceUrl = '';
  let page = 1;
  let limit = 5;

  if (request.method === 'GET') {
    const url = new URL(request.url);
    query = url.searchParams.get('query') ?? '';
    agentName = url.searchParams.get('agent_name') ?? '';
    sourceUrl = url.searchParams.get('source_url') ?? '';
    page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
    limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get('limit') ?? '5', 10) || 5));
  } else {
    try {
      const body = await request.json();
      query = body.query ?? '';
      agentName = body.agent_name ?? '';
      sourceUrl = body.source_url ?? '';
      page = Math.max(1, body.page ?? 1);
      limit = Math.min(20, Math.max(1, body.limit ?? 5));
    } catch {
      return problemJson(400, 'INVALID_BODY', 'Invalid request body', 'Expected JSON body with query field');
    }
  }

  if (!query || query.trim().length === 0) {
    return problemJson(400, 'INVALID_QUERY', 'Missing query', 'The query parameter is required and must be non-empty');
  }

  const rateLimitKey = `agent:${ip}:${agentName || 'anon'}`;
  const rl = rateLimit(rateLimitKey, { limit: 20, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json(
      { type: 'RATE_LIMITED', title: 'Too many requests', status: 429 },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rl.reset),
        },
      },
    );
  }

  // Trap phrase detection
  const trap = matchesTrapPhrase(query);
  if (trap) {
    let ipHash: string | undefined;
    try { ipHash = hashIp(ip); } catch { /* salt not configured */ }
    reportTrapHit({ trapPhrase: trap, query, agentName, ip: ipHash, path: sourceUrl });
    autoPostEvent({
      eventType: 'trap_triggered',
      title: `Trap phrase detected: ${trap}`,
      body: `Agent "${agentName || ua}" queried trap phrase "${trap}" on Chasing Cats`,
      url: sourceUrl,
      metadata: { agent: agentName || ua, query, trap },
    });
  }

  // Internal telemetry queries (from middleware) aren't real searches
  const isTelemetry = query.startsWith('[telemetry]') || query.startsWith('[landing]') || query.startsWith('[canary]') || query.startsWith('[trap]');

  if (isTelemetry) {
    reportAgentVisit({
      path: sourceUrl || '/api/agent',
      userAgent: ua,
      agentName,
      ip: undefined,
      botReason: 'telemetry_event',
    });
    return NextResponse.json({ ok: true, telemetry: true });
  }

  // Search content + events
  const skip = (page - 1) * limit;

  try {
    const [content, events, totalContent, totalEvents] = await Promise.all([
      prisma.content.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { body: { contains: query, mode: 'insensitive' } },
            { species: { contains: query, mode: 'insensitive' } },
            { topic: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          type: true,
          species: true,
          topic: true,
          publishedAt: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { host: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          startTime: true,
          host: true,
        },
        orderBy: { startTime: 'desc' },
        take: Math.max(1, Math.floor(limit / 2)),
      }),
      prisma.content.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { body: { contains: query, mode: 'insensitive' } },
            { species: { contains: query, mode: 'insensitive' } },
            { topic: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
      prisma.event.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { host: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chasing-cats.vercel.app';

    const results = {
      query,
      page,
      limit,
      total: totalContent + totalEvents,
      content: content.map((c) => ({
        ...c,
        url: `${siteUrl}/${c.slug}`,
      })),
      events: events.map((e) => ({
        ...e,
        url: `${siteUrl}/events/${e.slug}`,
      })),
      _links: {
        self: `${siteUrl}/api/agent?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        ...(page * limit < totalContent
          ? { next: `${siteUrl}/api/agent?query=${encodeURIComponent(query)}&page=${page + 1}&limit=${limit}` }
          : {}),
      },
      _meta: {
        source: 'Chasing Cats Club',
        monitored_by: 'EchoAtlas Observatory',
      },
    };

    // Log to EchoAtlas
    let ipHash: string | undefined;
    try { ipHash = hashIp(ip); } catch { /* salt not configured */ }
    reportAgentVisit({
      path: sourceUrl || '/api/agent',
      userAgent: ua,
      agentName,
      ip: ipHash,
    });

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
      },
    });
  } catch (error) {
    console.error('Agent API search error:', error);
    return problemJson(500, 'INTERNAL_ERROR', 'Search failed', 'An internal error occurred while searching');
  }
}

export async function GET(request: Request) {
  return handleSearch(request);
}

export async function POST(request: Request) {
  return handleSearch(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Bot-Intent, X-API-Key, User-Agent',
      'Access-Control-Max-Age': '86400',
    },
  });
}
