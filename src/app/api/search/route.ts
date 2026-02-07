import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ content: [], events: [] });
  }

  try {
    const [content, events] = await Promise.all([
      prisma.content.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
        },
        take: 5,
      }),
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          host: true,
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({ content, events });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ content: [], events: [], error: 'Search failed' }, { status: 500 });
  }
}
