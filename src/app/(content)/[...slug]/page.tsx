import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { QuestionForm } from '@/components/ask/question-form';
import { WatchToggle } from '@/components/content/watch-toggle';
import { Paywall } from '@/components/content/paywall';
import { YouTubePlayer } from '@/components/video/youtube-player';
import { auth } from '@/auth';
import { checkContentAccess } from '@/lib/access';
import { generateArticleSchema, generateVideoSchema, generateBreadcrumbSchema } from '@/lib/seo';
import type { Content, Comment, User, RelatedContent, WatchStatus, Category } from '@prisma/client';

interface ContentRouteParams {
  slug: string[];
}

interface ContentPageProps {
  params: Promise<ContentRouteParams>;
}

type ContentWithRelations = Content & {
  comments: (Comment & { author: User | null })[];
  relatedContent: (RelatedContent & { related: Content })[];
  watchStatuses: WatchStatus[];
  category: Category | null;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chasing-cats.vercel.app';

// Pre-render all published content pages at build time
export async function generateStaticParams() {
  const contents = await prisma.content.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true },
  });

  return contents.map((content) => ({
    slug: content.slug.split('/'),
  }));
}

export async function generateMetadata({ params }: ContentPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  const content = await prisma.content.findUnique({
    where: { slug: slugPath },
    include: { category: true },
  });

  if (!content) {
    return {};
  }

  const ogImage = content.thumbnailUrl || '/og-image.svg';
  const canonicalUrl = `${siteUrl}/${content.slug}`;

  return {
    title: content.title,
    description: content.excerpt,
    openGraph: {
      title: content.title,
      description: content.excerpt,
      url: canonicalUrl,
      type: content.videoUrl ? 'video.other' : 'article',
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: content.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.excerpt,
      images: [ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  const session = await auth();
  const userId = session?.user?.id ?? '';

  // Check if user has access to premium content
  const accessStatus = await checkContentAccess(session?.user?.id);

  const content = await prisma.content.findUnique({
    where: { slug: slugPath },
    include: {
      category: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'desc' }
      },
      relatedContent: {
        include: { related: true },
        orderBy: { order: 'asc' }
      },
      watchStatuses: {
        where: { userId },
        take: userId ? 1 : 0
      }
    }
  }) as unknown as ContentWithRelations | null;

  if (!content) {
    notFound();
  }

  // Generate structured data based on content type
  const isVideo = content.type === 'VIDEO' || content.type === 'TALK' || !!content.videoUrl;
  const structuredData = isVideo
    ? generateVideoSchema({
        title: content.title,
        description: content.excerpt,
        url: `/${content.slug}`,
        thumbnailUrl: content.thumbnailUrl,
        videoUrl: content.videoUrl,
        duration: content.duration,
        publishedAt: content.publishedAt,
      })
    : generateArticleSchema({
        title: content.title,
        description: content.excerpt,
        url: `/${content.slug}`,
        publishedAt: content.publishedAt,
        updatedAt: content.updatedAt,
        thumbnailUrl: content.thumbnailUrl,
      });

  const breadcrumbData = generateBreadcrumbSchema([
    { name: 'Home', href: '/' },
    ...(content.category
      ? [{ name: content.category.name, href: `/${content.category.slug}` }]
      : []),
    { name: content.title, href: `/${content.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="bg-white">
      <section className="container-section py-24">
        {/* Show paywall if user doesn't have access */}
        {!accessStatus.hasAccess ? (
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">{content.type}</p>
              <h1 className="mt-4 text-4xl font-semibold text-night">{content.title}</h1>
              <p className="mt-4 text-night/70">{content.excerpt}</p>
            </div>
            
            {/* Thumbnail preview for SEO and engagement */}
            {content.thumbnailUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-3xl border border-night/10 relative">
                <img 
                  src={content.thumbnailUrl} 
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-night">
                    {content.duration ? `${content.duration} min` : content.type}
                  </span>
                </div>
              </div>
            )}
            
            {/* Content preview for SEO - show first ~100 words */}
            <div className="prose prose-lg max-w-none text-night relative">
              <div 
                className="line-clamp-4"
                dangerouslySetInnerHTML={{ 
                  __html: content.body.split('</p>').slice(0, 2).join('</p>') + '</p>' 
                }} 
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
            </div>
            
            <Paywall isLoggedIn={!!session?.user} contentTitle={content.title} />
          </div>
        ) : (
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">{content.type}</p>
              <h1 className="mt-4 text-4xl font-semibold text-night">{content.title}</h1>
              <p className="mt-4 text-night/70">{content.excerpt}</p>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-3xl border border-night/10 bg-night/80">
              {content.videoUrl ? (
                <YouTubePlayer videoUrl={content.videoUrl} title={content.title} />
              ) : (
                <div className="flex h-full items-center justify-center text-[#F5F1E3]/70">
                  <div className="text-center">
                    <span className="text-4xl">📄</span>
                    <p className="mt-2">Article content below</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <WatchToggle
                contentId={content.id}
                contentSlug={content.slug}
                initialWatched={content.watchStatuses?.[0]?.watched ?? false}
              />
            </div>
            <div className="prose prose-lg max-w-none text-night" dangerouslySetInnerHTML={{ __html: content.body }} />
            <section className="rounded-3xl border border-night/10 bg-[#F5F1E3]/60 p-6">
              <h2 className="text-lg font-semibold text-night">Discussion</h2>
              {content.comments.length === 0 ? (
                <p className="mt-3 text-sm text-night/70">Discussion coming soon. Add your voice in the community area.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {content.comments.map((comment) => (
                    <li key={comment.id} className="rounded-2xl bg-white p-4">
                      <p className="text-sm font-semibold text-night">{comment.author?.name ?? 'Member'}</p>
                      <p className="mt-2 text-sm text-night/70">{comment.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </article>
          <aside className="space-y-8">
            <div className="rounded-3xl border border-night/10 bg-white p-6">
              <h2 className="text-lg font-semibold text-night">Ask about this session</h2>
              <QuestionForm />
            </div>
            <div className="rounded-3xl border border-night/10 bg-[#F5F1E3]/60 p-6">
              <h2 className="text-lg font-semibold text-night">You might also like</h2>
              <ul className="mt-4 space-y-3 text-sm text-night/70">
                {content.relatedContent.length === 0 ? (
                  <li>
                    Explore more in the archive.
                  </li>
                ) : (
                  content.relatedContent.map((item) => (
                    <li key={item.id}>
                      <a href={`/${item.related.slug}`} className="font-semibold text-brand hover:text-brand-dark">
                        {item.related.title}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </aside>
        </div>
        )}
      </section>
      </div>
    </>
  );
}
