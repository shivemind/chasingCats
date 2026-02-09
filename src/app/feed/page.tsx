import { redirect } from 'next/navigation';
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

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/feed');
  }

  const limit = 20;
  
  // Check if user has paid access for interactions
  const accessStatus = await checkContentAccess(session.user.id);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Jungle Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient - deep jungle colors */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-green-800 to-emerald-950" />
        
        {/* Tropical overlay pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c8 15 25 15 30 30-15 8-15 25-30 30-8-15-25-15-30-30 15-8 15-25 30-30z' fill='%23000' fill-opacity='0.15'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Animated floating leaves */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="animate-float-slow absolute top-[10%] left-[5%] text-6xl opacity-20">🌿</div>
          <div className="animate-float-medium absolute top-[20%] right-[10%] text-5xl opacity-25">🍃</div>
          <div className="animate-float-fast absolute top-[60%] left-[15%] text-4xl opacity-15">🌴</div>
          <div className="animate-float-slow absolute top-[40%] right-[5%] text-7xl opacity-20">🌿</div>
          <div className="animate-float-medium absolute bottom-[20%] left-[8%] text-5xl opacity-25">🍃</div>
          <div className="animate-float-fast absolute top-[75%] right-[20%] text-4xl opacity-15">🌱</div>
          <div className="animate-float-slow absolute top-[5%] left-[45%] text-3xl opacity-20">🦜</div>
          <div className="animate-float-medium absolute bottom-[10%] right-[40%] text-4xl opacity-20">🦋</div>
        </div>
        
        {/* Light rays through canopy */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-emerald-400/5" />
        
        {/* Misty atmosphere at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-emerald-950/80 to-transparent" />
      </div>

      <section className="container-section py-8 sm:py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-emerald-300/80">
              Community
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white drop-shadow-lg">
              Pride Feed 🦁
            </h1>
            <p className="mt-2 text-sm text-emerald-100/80">
              Share your wildcat sightings, photos, and connect with fellow enthusiasts.
            </p>
          </div>

          {/* Feed */}
          <FeedList
            initialPosts={postsWithReactions}
            initialCursor={nextCursor}
            currentUserId={session.user.id}
            isAdmin={session.user.role === 'ADMIN'}
            hasPaidAccess={hasPaidAccess}
          />
        </div>
      </section>
    </div>
  );
}
