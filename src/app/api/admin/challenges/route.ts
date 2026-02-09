import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createChallenge } from '@/lib/challenges';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, theme, description, rules, startDate, endDate, votingEnd, featured } = body;

    if (!title || !slug || !theme || !description || !startDate || !endDate || !votingEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingChallenge = await prisma.photoChallenge.findUnique({
      where: { slug }
    });

    if (existingChallenge) {
      return NextResponse.json(
        { error: 'A challenge with this slug already exists' },
        { status: 400 }
      );
    }

    const challenge = await createChallenge({
      title,
      slug,
      theme,
      description,
      rules: rules || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      votingEnd: new Date(votingEnd),
      featured: featured || false
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error('Create challenge error:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const challenges = await prisma.photoChallenge.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { entries: true }
        }
      }
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Get challenges error:', error);
    return NextResponse.json(
      { error: 'Failed to get challenges' },
      { status: 500 }
    );
  }
}
