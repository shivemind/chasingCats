import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkContentAccess } from '@/lib/access';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import type { Post, User, Profile, ReactionType } from '@prisma/client';

type PostWithRelations = Post & {
  author: Pick<User, 'id' | 'name' | 'image'> & {
    profile: Pick<Profile, 'username' | 'photoUrl'> | null;
  };
  _count: { comments: number; reactions: number };
  reactions: Array<{ type: ReactionType }>;
};

const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  imageUrl: z.string().url().optional().or(z.literal(''))
});

// GET /api/feed - List posts with pagination (public - anyone can view)
export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor }
    }),
    orderBy: { createdAt: 'desc' },
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
      _count: {
        select: { comments: true, reactions: true }
      },
      // Only fetch user's reactions if logged in
      reactions: userId ? {
        where: { userId },
        select: { type: true }
      } : false
    }
  }) as unknown as PostWithRelations[];

  // Get reaction counts by type for each post
  const postIds = posts.map(p => p.id);
  const reactionCounts = await prisma.reaction.groupBy({
    by: ['postId', 'type'],
    where: { postId: { in: postIds } },
    _count: { type: true }
  }) as Array<{ postId: string; type: 'PURR' | 'ROAR'; _count: { type: number } }>;

  // Map reaction counts to posts
  const reactionCountMap = new Map<string, { purrs: number; roars: number }>();
  for (const r of reactionCounts) {
    const current = reactionCountMap.get(r.postId) || { purrs: 0, roars: 0 };
    if (r.type === 'PURR') current.purrs = r._count.type;
    if (r.type === 'ROAR') current.roars = r._count.type;
    reactionCountMap.set(r.postId, current);
  }

  let nextCursor: string | undefined;
  if (posts.length > limit) {
    const nextItem = posts.pop();
    nextCursor = nextItem?.id;
  }

  const postsWithReactions = posts.map((post) => ({
    ...post,
    reactionCounts: reactionCountMap.get(post.id) || { purrs: 0, roars: 0 },
    userReaction: (Array.isArray(post.reactions) && post.reactions[0]?.type) || null
  }));

  return NextResponse.json({
    posts: postsWithReactions,
    nextCursor
  });
}

// POST /api/feed - Create a new post
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 10 posts per hour per user
  const rateLimitResult = rateLimit(`feed:post:${session.user.id}`, { limit: 10, windowSeconds: 3600 });
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'You are posting too frequently. Please wait before creating another post.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        }
      }
    );
  }

  // Check for paid membership
  const access = await checkContentAccess(session.user.id);
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'Paid membership required to create posts' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid post data', details: parsed.error.flatten() }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl || null,
      authorId: session.user.id
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
      },
      _count: {
        select: { comments: true, reactions: true }
      }
    }
  });

  return NextResponse.json({
    ...post,
    reactionCounts: { purrs: 0, roars: 0 },
    userReaction: null,
    reactions: []
  });
}
