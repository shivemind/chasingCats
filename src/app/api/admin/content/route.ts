import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ContentType, SkillLevel } from '@prisma/client';

const contentSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1).max(500),
  body: z.string().min(1),
  type: z.nativeEnum(ContentType),
  thumbnailUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  resourceUrl: z.string().url().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  level: z.nativeEnum(SkillLevel).optional(),
  region: z.string().max(100).optional().nullable(),
  species: z.string().max(100).optional().nullable(),
  topic: z.string().max(100).optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  featured: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

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

    const body = await request.json();
    const parsed = contentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid content data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const content = await prisma.content.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        type: data.type,
        thumbnailUrl: data.thumbnailUrl ?? null,
        videoUrl: data.videoUrl ?? null,
        resourceUrl: data.resourceUrl ?? null,
        duration: data.duration ?? null,
        level: data.level,
        region: data.region ?? null,
        species: data.species ?? null,
        topic: data.topic ?? null,
        categoryId: data.categoryId ?? null,
        featured: data.featured ?? false,
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
