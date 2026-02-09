import Link from 'next/link';
import type { Content } from '@prisma/client';
import { format } from 'date-fns';
import { ContentImage } from './content-image';

interface ContentCardProps {
  content: Pick<Content, 'slug' | 'title' | 'excerpt' | 'thumbnailUrl' | 'publishedAt' | 'type' | 'duration' | 'species' | 'topic'>;
  eyebrow?: string;
  variant?: 'light' | 'dark';
}

export function ContentCard({ content, eyebrow, variant = 'light' }: ContentCardProps) {
  const { slug, title, excerpt, thumbnailUrl, publishedAt, type, duration, species, topic } = content;

  const isDark = variant === 'dark';

  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-3xl border shadow-sm transition hover:-translate-y-1 hover:shadow-card ${
      isDark 
        ? 'border-white/10 bg-black/30 backdrop-blur-sm hover:border-white/20' 
        : 'border-night/10 bg-white'
    }`}>
      <div className="relative aspect-video w-full overflow-hidden">
        <ContentImage src={thumbnailUrl} alt={title} type={type} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        {eyebrow ? (
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${
            isDark ? 'text-emerald-300' : 'text-brand-dark/80'
          }`}>{eyebrow}</p>
        ) : null}
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-night'}`}>
          <Link href={`/${slug}`} className="hover:underline">{title}</Link>
        </h3>
        <p className={`text-sm line-clamp-3 ${isDark ? 'text-white/70' : 'text-night/70'}`}>{excerpt}</p>
        <div className={`mt-auto space-y-1 text-xs ${isDark ? 'text-white/50' : 'text-night/60'}`}>
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
