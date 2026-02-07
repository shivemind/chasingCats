import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
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

    const data = await request.json();

    const content = await prisma.content.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        type: data.type,
        thumbnailUrl: data.thumbnailUrl,
        videoUrl: data.videoUrl,
        resourceUrl: data.resourceUrl,
        duration: data.duration,
        level: data.level,
        region: data.region,
        species: data.species,
        topic: data.topic,
        categoryId: data.categoryId || null,
        featured: data.featured,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null
      }
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
