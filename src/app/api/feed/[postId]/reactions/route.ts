import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

type RouteParams = { params: Promise<{ postId: string }> };

const reactionSchema = z.object({
  type: z.enum(['PURR', 'ROAR'])
});

// POST /api/feed/[postId]/reactions - Toggle reaction (purr/roar)
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  const { postId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
  }

  // Verify post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true }
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Check existing reaction
  const existingReaction = await prisma.reaction.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId
      }
    }
  });

  let userReaction: string | null = null;

  if (existingReaction) {
    if (existingReaction.type === parsed.data.type) {
      // Same type - remove reaction (toggle off)
      await prisma.reaction.delete({
        where: { id: existingReaction.id }
      });
      userReaction = null;
    } else {
      // Different type - update reaction
      await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { type: parsed.data.type }
      });
      userReaction = parsed.data.type;
    }
  } else {
    // No existing reaction - create new
    await prisma.reaction.create({
      data: {
        type: parsed.data.type,
        userId: session.user.id,
        postId
      }
    });
    userReaction = parsed.data.type;
  }

  // Get updated counts
  const reactionCounts = await prisma.reaction.groupBy({
    by: ['type'],
    where: { postId },
    _count: { type: true }
  }) as Array<{ type: 'PURR' | 'ROAR'; _count: { type: number } }>;

  const counts = { purrs: 0, roars: 0 };
  for (const r of reactionCounts) {
    if (r.type === 'PURR') counts.purrs = r._count.type;
    if (r.type === 'ROAR') counts.roars = r._count.type;
  }

  return NextResponse.json({
    userReaction,
    reactionCounts: counts
  });
}
