import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Post, User, Profile, PostComment, ReactionType } from '@prisma/client';

type RouteParams = { params: Promise<{ postId: string }> };

type PostWithRelations = Post & {
  author: Pick<User, 'id' | 'name' | 'image'> & {
    profile: Pick<Profile, 'username' | 'photoUrl'> | null;
  };
  comments: Array<PostComment & {
    author: Pick<User, 'id' | 'name' | 'image'> & {
      profile: Pick<Profile, 'username' | 'photoUrl'> | null;
    };
  }>;
  _count: { comments: number; reactions: number };
  reactions: Array<{ type: ReactionType }>;
};

// GET /api/feed/[postId] - Get a single post
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();
  const { postId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
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
      },
      comments: {
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
      },
      _count: {
        select: { comments: true, reactions: true }
      },
      reactions: {
        where: { userId: session.user.id },
        select: { type: true }
      }
    }
  }) as unknown as PostWithRelations | null;

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Get reaction counts by type
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
    ...post,
    reactionCounts: counts,
    userReaction: post.reactions[0]?.type || null
  });
}

// DELETE /api/feed/[postId] - Delete a post (author only)
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();
  const { postId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true }
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Only author or admin can delete
  if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.post.delete({
    where: { id: postId }
  });

  return NextResponse.json({ success: true });
}
