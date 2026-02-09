import { NextRequest, NextResponse } from 'next/server';

// IndexNow key - also needs to be available as a static file
// Create a file at /public/{key}.txt containing just the key
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'chasingcats-indexnow-key';

/**
 * POST /api/indexnow
 * Notify search engines about new or updated URLs
 * 
 * Body: { urls: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chasing-cats.vercel.app';
    const host = new URL(siteUrl).host;

    // IndexNow accepts up to 10,000 URLs per request
    const payload = {
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
      urlList: urls.map(url => url.startsWith('http') ? url : `${siteUrl}${url}`),
    };

    // Submit to IndexNow (Bing, Yandex, etc.)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      return NextResponse.json({
        success: true,
        message: 'URLs submitted to IndexNow',
        urlCount: urls.length,
      });
    }

    return NextResponse.json(
      { error: 'IndexNow submission failed', status: response.status },
      { status: 500 }
    );
  } catch (error) {
    console.error('IndexNow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/indexnow
 * Returns the IndexNow key for verification
 */
export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
