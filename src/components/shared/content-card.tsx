import Link from 'next/link';
import type { Content } from '@prisma/client';
import { format } from 'date-fns';

interface ContentCardProps {
  content: Pick<Content, 'slug' | 'title' | 'excerpt' | 'thumbnailUrl' | 'publishedAt' | 'type' | 'duration' | 'species' | 'topic'>;
  eyebrow?: string;
}

export function ContentCard({ content, eyebrow }: ContentCardProps) {
  const { slug, title, excerpt, thumbnailUrl, publishedAt, type, duration, species, topic } = content;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-night/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-video w-full overflow-hidden bg-night/10">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand/10 text-brand">{type}</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/80">{eyebrow}</p> : null}
        <h3 className="text-lg font-semibold text-night">
          <Link href={`/${slug}`}>{title}</Link>
        </h3>
        <p className="text-sm text-night/70 line-clamp-3">{excerpt}</p>
        <div className="mt-auto space-y-1 text-xs text-night/60">
          {publishedAt ? <p>{format(new Date(publishedAt), 'MMM d, yyyy')}</p> : null}
          <p className="uppercase tracking-wide">
            {type.toLowerCase()} {duration ? `• ${duration} min` : ''}
          </p>
          {species ? <p>Species: {species}</p> : null}
          {topic ? <p>Topic: {topic}</p> : null}
        </div>
      </div>
    </article>
  );
}
