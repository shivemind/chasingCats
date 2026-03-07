import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// --- Inline bot detection (Edge runtime cannot import Node crypto / barrel exports) ---

const AI_AGENT_UA_PATTERNS = [
  'GPTBot', 'ChatGPT-User', 'CCBot', 'Claude-Web', 'ClaudeBot',
  'Anthropic-AI', 'Google-Extended', 'PerplexityBot', 'Amazonbot',
  'Cohere-AI', 'Bytespider', 'Bingbot', 'facebookexternalhit',
  'Twitterbot', 'LinkedInBot', 'Slackbot', 'Discordbot', 'YouBot',
  'Applebot', 'PetalBot', 'DataForSeoBot', 'SemrushBot', 'AhrefsBot',
  'MJ12bot', 'DotBot', 'Omgilibot', 'YandexBot', 'Seekport',
  'Meta-ExternalAgent', 'Scraper', 'scraper', 'fetcher', 'Fetcher',
  'HeadlessChrome', 'PhantomJS', 'Selenium', 'Puppeteer', 'Playwright',
  'Crawler', 'crawl', 'Spider', 'spider', 'Bot/', 'bot/', 'Agent', 'agent',
];

const AUTOMATION_UA_PATTERNS = [
  'curl', 'wget', 'python-requests', 'python-urllib', 'go-http-client',
  'Java/', 'okhttp', 'axios', 'node-fetch', 'fetch', 'HTTPie',
  'Insomnia', 'PostmanRuntime',
];

const ALL_PATTERNS = [...AI_AGENT_UA_PATTERNS, ...AUTOMATION_UA_PATTERNS];

interface BotResult { isBot: boolean; reason?: string }

function detectBot(req: NextRequest): BotResult {
  const ua = req.headers.get('user-agent') ?? '';
  if (!ua || ua.trim().length === 0) return { isBot: true, reason: 'missing_user_agent' };

  const lower = ua.toLowerCase();
  if (ALL_PATTERNS.some((p) => lower.includes(p.toLowerCase()))) {
    return { isBot: true, reason: 'user_agent_match' };
  }

  if (['HEAD', 'OPTIONS'].includes(req.method) && ua.length < 50) {
    return { isBot: true, reason: 'probing_request' };
  }

  const al = req.headers.get('accept-language');
  if (!al || al.trim().length === 0) {
    if (ua.length < 80 || ua.includes('http') || ua.includes('HTTP')) {
      return { isBot: true, reason: 'missing_accept_language' };
    }
  }

  if (req.headers.get('x-bot-intent')?.trim().toLowerCase() === 'agent') {
    return { isBot: true, reason: 'x_bot_intent' };
  }

  return { isBot: false };
}

// --- Inline agent instruction text ---

function getInstructionText(baseUrl: string): string {
  const apiUrl = `${baseUrl}/api/agent`;
  return `This site is optimized for humans. For structured data about wild cats, use the Agent API.

Agent API Endpoint: ${apiUrl}

Query parameters:
  - query      (required): Your search query
  - agent_name (optional): Identifier for your agent
  - source_url (optional): The page URL you were crawling
  - page       (optional): Page number (default: 1)
  - limit      (optional): Results per page (default: 5)

Example:
  curl "${apiUrl}?query=snow%20leopard&agent_name=my-bot"

Feeds: /feed.xml (RSS), /feed.json (JSON Feed)
Discovery: /agents.json, /.well-known/agent-api, /AGENTS.md, /llms.txt
`;
}

// --- EchoAtlas telemetry (fire-and-forget) ---

const EA_URL = process.env.ECHOATLAS_API_URL || 'https://echo-atlas.com';
const EA_KEY = process.env.ECHOATLAS_API_KEY || '';
const EA_SITE = process.env.ECHOATLAS_SITE_ID || 'chasing-cats';

function telemetry(body: Record<string, unknown>): void {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Source-Site': EA_SITE,
  };
  if (EA_KEY) headers['X-API-Key'] = EA_KEY;
  fetch(`${EA_URL}/api/agent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...body, source_site: EA_SITE }),
  }).catch(() => {});
}

// --- Security headers ---

const PERMISSIONS_POLICY =
  'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()';

function applySecurityHeaders(response: NextResponse, siteUrl: string): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  response.headers.set(
    'Link',
    `<${siteUrl}/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
  );
  return response;
}

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  return trimmed.replace(/\/+$/, '');
}

// --- Middleware ---

export function middleware(request: NextRequest) {
  const siteUrl = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL || getBaseUrl(request),
  );

  // API routes: security headers only, no bot logic
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return applySecurityHeaders(NextResponse.next(), siteUrl);
  }

  // Canary trap: pass through so /c/[token] route can record hit
  if (request.nextUrl.pathname.startsWith('/c/')) {
    return NextResponse.next();
  }

  // Admin routes: human-only; bots get 404
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const result = detectBot(request);
    if (result.isBot) {
      return new NextResponse('Not available.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    return NextResponse.next();
  }

  // Auth-protected routes: cookie gate (preserve existing behavior)
  const authPaths = ['/account', '/profile', '/watch', '/ask'];
  const isAuthRoute = authPaths.some(
    (p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(`${p}/`),
  );

  if (isAuthRoute) {
    const cookies = request.cookies;
    const hasSession =
      cookies.has('__Secure-authjs.session-token') ||
      cookies.has('authjs.session-token') ||
      cookies.has('__Secure-next-auth.session-token') ||
      cookies.has('next-auth.session-token');

    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
    return applySecurityHeaders(NextResponse.next(), siteUrl);
  }

  // --- Bot detection on all remaining public pages ---

  const result = detectBot(request);
  const ua = request.headers.get('user-agent') ?? '';
  const referer = request.headers.get('referer');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') || undefined;

  if (result.isBot) {
    telemetry({
      query: `[telemetry] agent visit on ${request.nextUrl.pathname}`,
      agent_name: ua || 'unknown',
      source_url: `${siteUrl}${request.nextUrl.pathname}`,
      metadata: {
        type: 'agent_visit',
        bot_reason: result.reason,
        referer,
        ip_hash: ip,
      },
    });

    return new NextResponse(getInstructionText(siteUrl), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // Human with referer/UTM: log landing for AI-referrer tracking
  const utmSource = request.nextUrl.searchParams.get('utm_source');
  const utmMedium = request.nextUrl.searchParams.get('utm_medium');
  const utmCampaign = request.nextUrl.searchParams.get('utm_campaign');

  if (referer || utmSource || utmMedium || utmCampaign) {
    telemetry({
      query: `[landing] ${request.nextUrl.pathname}`,
      agent_name: 'human',
      source_url: `${siteUrl}${request.nextUrl.pathname}`,
      metadata: {
        type: 'human_landing',
        referer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      },
    });
  }

  return applySecurityHeaders(NextResponse.next(), siteUrl);
}

export const config = {
  matcher: [
    '/((?!_next|favicon|robots\\.txt|sitemap\\.xml|agents\\.json|llms\\.txt|AGENTS\\.md|sw\\.js|security\\.txt|humans\\.txt|chasingcats-indexnow-key\\.txt|[^/]+\\.(?:svg|png|ico|jpg|jpeg|gif|webp|woff2?|ttf|eot))[^.]*)',
  ],
};
