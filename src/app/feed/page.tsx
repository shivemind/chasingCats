import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { FeedList } from '@/components/feed/feed-list';
import type { Metadata } from 'next';
import type { Post, User, Profile, ReactionType } from '@prisma/client';

type PostWithRelations = Post & {
  author: Pick<User, 'id' | 'name' | 'image'> & {
    profile: Pick<Profile, 'username' | 'photoUrl'> | null;
  };
  _count: { comments: number; reactions: number };
  reactions: Array<{ type: ReactionType }>;
};

export const metadata: Metadata = {
  title: 'Pride Feed',
  description: 'Share and connect with fellow wildcat enthusiasts in the Chasing Cats community feed.'
};

export default async function FeedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/feed');
  }

  const limit = 20;

  const posts = await prisma.post.findMany({
    take: limit + 1,
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
      reactions: {
        where: { userId: session.user.id },
        select: { type: true }
      }
    }
  }) as unknown as PostWithRelations[];

  // Get reaction counts by type
  const postIds = posts.map(p => p.id);
  const reactionCounts = await prisma.reaction.groupBy({
    by: ['postId', 'type'],
    where: { postId: { in: postIds } },
    _count: { type: true }
  }) as Array<{ postId: string; type: 'PURR' | 'ROAR'; _count: { type: number } }>;

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
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.author,
    _count: post._count,
    reactionCounts: reactionCountMap.get(post.id) || { purrs: 0, roars: 0 },
    userReaction: (post.reactions[0]?.type as 'PURR' | 'ROAR') || null
  }));

  return (
    <div className="bg-[#F5F1E3] min-h-screen">
      <section className="container-section py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-brand/70">
              Community
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-night">
              Pride Feed 🦁
            </h1>
            <p className="mt-2 text-sm text-night/70">
              Share your wildcat sightings, photos, and connect with fellow enthusiasts.
            </p>
          </div>

          {/* Feed */}
          <FeedList
            initialPosts={postsWithReactions}
            initialCursor={nextCursor}
            currentUserId={session.user.id}
            isAdmin={session.user.role === 'ADMIN'}
          />
        </div>
      </section>
    </div>
  );
}
