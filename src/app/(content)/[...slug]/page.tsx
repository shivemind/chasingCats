import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { QuestionForm } from '@/components/ask/question-form';
import { WatchToggle } from '@/components/content/watch-toggle';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ContentRouteParams {
  slug: string[];
}

interface ContentPageProps {
  params: Promise<ContentRouteParams>;
}

export async function generateMetadata({ params }: ContentPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  const content = await prisma.content.findUnique({
    where: { slug: slugPath }
  });

  if (!content) {
    return {};
  }

  return {
    title: `${content.title} | Chasing Cats Club`,
    description: content.excerpt
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? '';

  const content = await prisma.content.findUnique({
    where: { slug: slugPath },
    include: {
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
  });

  if (!content) {
    notFound();
  }

  return (
    <div className="bg-white">
      <section className="container-section py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">{content.type}</p>
              <h1 className="mt-4 text-4xl font-semibold text-night">{content.title}</h1>
              <p className="mt-4 text-night/70">{content.excerpt}</p>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-3xl border border-night/10 bg-night/80">
              <div className="flex h-full items-center justify-center text-[#F5F1E3]/70">
                {content.videoUrl ? 'Video player placeholder' : 'Audio/Article placeholder'}
              </div>
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
      </section>
    </div>
  );
}
