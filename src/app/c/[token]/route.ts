import { NextResponse } from 'next/server';
import { reportCanaryHit } from '@/lib/echoatlas/telemetry';
import { autoPostEvent } from '@/lib/echoatlas/social';
import { getClientIp } from '@/lib/rate-limit';

// Canary trap: honeypot URLs that can be embedded in content.
// Any request to /c/{token} is suspicious -- it means someone followed
// a link that only exists as a trap embedded in our content/feeds.
// Always returns 404, but silently reports the hit to EchoAtlas.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const ip = getClientIp(request);
  const ua = request.headers.get('user-agent') ?? '';
  const referer = request.headers.get('referer') ?? '';

  let ipHash: string | undefined;
  try {
    const { hashIp } = await import('@/lib/echoatlas/ip-hash');
    ipHash = hashIp(ip);
  } catch { /* salt not configured */ }

  reportCanaryHit({ token, ip: ipHash, userAgent: ua, referer });

  autoPostEvent({
    eventType: 'canary_hit',
    title: `Canary token accessed: ${token}`,
    body: `Someone followed canary trap /c/${token} on Chasing Cats. UA: ${ua.slice(0, 100)}`,
    url: `/c/${token}`,
    metadata: { token, ua: ua.slice(0, 200), referer: referer.slice(0, 200) },
  });

  return new NextResponse('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
