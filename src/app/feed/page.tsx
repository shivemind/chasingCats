import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkContentAccess } from '@/lib/access';
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
  const userId = session?.user?.id;

  const limit = 20;
  
  // Check if user has paid access for interactions (only if logged in)
  const accessStatus = userId ? await checkContentAccess(userId) : { hasAccess: false };
  const hasPaidAccess = accessStatus.hasAccess;

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
      reactions: userId ? {
        where: { userId },
        select: { type: true }
      } : false
    }
  }) as unknown as PostWithRelations[];

  // Get reaction counts by type
  const postIds = posts.map(p => p.id);
  const reactionCounts = await (prisma.reaction.groupBy({
    by: ['postId', 'type'],
    where: { postId: { in: postIds } },
    _count: { type: true }
  }) as unknown as Promise<Array<{ postId: string; type: 'PURR' | 'ROAR'; _count: { type: number } }>>);

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
    userReaction: (Array.isArray(post.reactions) && post.reactions[0]?.type as 'PURR' | 'ROAR') || null
  }));

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-emerald-900 via-green-800 to-emerald-950 -mt-[1px] pt-[1px]">
        {/* Jungle Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Tropical overlay pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c8 15 25 15 30 30-15 8-15 25-30 30-8-15-25-15-30-30 15-8 15-25 30-30z' fill='%23fff' fill-opacity='0.08'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
          
          {/* Floating jungle elements - static positioned for SSR */}
          <div className="absolute top-[10%] left-[5%] text-6xl opacity-20 animate-pulse">🌿</div>
          <div className="absolute top-[20%] right-[10%] text-5xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>🍃</div>
          <div className="absolute top-[50%] left-[8%] text-4xl opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}>🌴</div>
          <div className="absolute top-[35%] right-[5%] text-7xl opacity-15 animate-pulse" style={{ animationDelay: '1.5s' }}>🌿</div>
          <div className="absolute top-[70%] left-[12%] text-5xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>🍃</div>
          <div className="absolute top-[80%] right-[15%] text-4xl opacity-15 animate-pulse" style={{ animationDelay: '0.8s' }}>🌱</div>
          <div className="absolute top-[5%] left-[50%] text-3xl opacity-25 animate-pulse" style={{ animationDelay: '1.2s' }}>🦜</div>
          <div className="absolute top-[90%] right-[45%] text-4xl opacity-20 animate-pulse" style={{ animationDelay: '1.8s' }}>🦋</div>
          
          {/* Light rays through canopy */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-emerald-400/5" />
          
          {/* Misty atmosphere at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950/60 to-transparent" />
        </div>

        <section className="container-section py-8 sm:py-12 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center sm:text-left">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-emerald-300">
                Community
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white drop-shadow-lg">
                Pride Feed 🦁
              </h1>
              <p className="mt-2 text-sm text-emerald-100/90">
                Share your wildcat sightings, photos, and connect with fellow enthusiasts.
              </p>
            </div>

            {/* Feed */}
            <FeedList
              initialPosts={postsWithReactions}
              initialCursor={nextCursor}
              currentUserId={userId}
              isAdmin={session?.user?.role === 'ADMIN'}
              hasPaidAccess={hasPaidAccess}
            />
          </div>
        </section>
    </div>
  );
}
