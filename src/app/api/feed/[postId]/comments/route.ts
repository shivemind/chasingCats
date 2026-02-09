import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkContentAccess } from '@/lib/access';
import { z } from 'zod';

type RouteParams = { params: Promise<{ postId: string }> };

const commentSchema = z.object({
  body: z.string().min(1).max(1000)
});

// GET /api/feed/[postId]/comments - Get comments for a post
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();
  const { postId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const comments = await prisma.postComment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            select: { username: true, photoUrl: true }
          }
        }
      }
    }
  });

  return NextResponse.json({ comments });
}

// POST /api/feed/[postId]/comments - Add a comment to a post
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  const { postId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check for paid membership
  const access = await checkContentAccess(session.user.id);
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'Paid membership required to comment' }, { status: 403 });
  }

  // Verify post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true }
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid comment data' }, { status: 400 });
  }

  const comment = await prisma.postComment.create({
    data: {
      body: parsed.data.body,
      authorId: session.user.id,
      postId
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: {
            select: { username: true, photoUrl: true }
          }
        }
      }
    }
  });

  return NextResponse.json(comment);
}
