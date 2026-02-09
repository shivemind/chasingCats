import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ContentCard } from '@/components/shared/content-card';
import Link from 'next/link';
import type { Content, Category } from '@prisma/client';
import { SITE_URL, generateCollectionPageSchema } from '@/lib/seo';

type ContentWithCategory = Content & { category: Category | null };

interface LibraryPageProps {
  searchParams?: Promise<{
    type?: string;
    category?: string;
    species?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Content Library - Full Archive',
  description: 'Browse the full archive of expert talks, field guides, courses, and AMAs about wild cats. Filter by type, category, or species.',
  openGraph: {
    title: 'Content Library | Chasing Cats Club',
    description: 'Browse the full archive of expert talks, field guides, courses, and AMAs about wild cats.',
    type: 'website',
    url: `${SITE_URL}/library`,
  },
  alternates: {
    canonical: `${SITE_URL}/library`,
  },
};

const libraryPageSchema = generateCollectionPageSchema({
  name: 'Content Library',
  description: 'Browse the full archive of expert talks, field guides, courses, and AMAs about wild cats.',
  url: '/library',
});

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const filters = (await searchParams) ?? {};

  const contents = await prisma.content.findMany({
    where: {
      type: filters.type ? { equals: filters.type as 'ARTICLE' | 'VIDEO' | 'TALK' | 'COURSE' | 'NEWS' } : undefined,
      category: filters.category ? { slug: filters.category } : undefined,
      species: filters.species ? { equals: filters.species } : undefined
    },
    include: {
      category: true
    },
    orderBy: { publishedAt: 'desc' }
  }) as unknown as ContentWithCategory[];

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  const uniqueSpecies = await prisma.content.findMany({
    select: { species: true },
    distinct: ['species']
  });
  const speciesOptions = uniqueSpecies.map(item => item.species).filter(Boolean) as string[];

  const contentTypes = ['ARTICLE', 'VIDEO', 'TALK', 'COURSE', 'NEWS'];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(libraryPageSchema) }}
      />
      <div className="bg-white">
        <section className="container-section py-12 sm:py-16 md:py-24">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-brand/70">Content Library</p>
            <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl font-semibold text-night">Explore the full archive</h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-night/70">
              Browse expert talks, field guides, courses, and AMAs. Filter by type, category, or species.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-night/60">{contents.length} items</p>
        </div>

        <form className="mt-8 sm:mt-12 grid gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-night/10 bg-[#F5F1E3]/60 p-4 sm:p-6 md:grid-cols-4">
          <label className="text-xs sm:text-sm font-semibold text-night">
            Type
            <select
              name="type"
              defaultValue={filters.type ?? ''}
              className="mt-1.5 sm:mt-2 w-full rounded-lg sm:rounded-xl border border-night/10 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-night/80 focus:border-brand focus:outline-none"
            >
              <option value="">All types</option>
              {contentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs sm:text-sm font-semibold text-night">
            Category
            <select
              name="category"
              defaultValue={filters.category ?? ''}
              className="mt-1.5 sm:mt-2 w-full rounded-lg sm:rounded-xl border border-night/10 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-night/80 focus:border-brand focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs sm:text-sm font-semibold text-night">
            Species
            <select
              name="species"
              defaultValue={filters.species ?? ''}
              className="mt-1.5 sm:mt-2 w-full rounded-lg sm:rounded-xl border border-night/10 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-night/80 focus:border-brand focus:outline-none"
            >
              <option value="">All species</option>
              {speciesOptions.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2 sm:gap-3 md:col-span-1">
            <button type="submit" className="flex-1 rounded-full bg-night px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#F5F1E3]">
              Filter
            </button>
            <Link href="/library" className="flex-shrink-0 text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark px-2">
              Clear
            </Link>
          </div>
        </form>

        {contents.length === 0 ? (
          <div className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl border border-night/10 bg-[#F5F1E3]/30 p-8 sm:p-12 text-center">
            <p className="text-base sm:text-lg font-semibold text-night">No content found</p>
            <p className="mt-2 text-xs sm:text-sm text-night/70">Try adjusting your filters or browse all content.</p>
            <Link href="/library" className="mt-3 sm:mt-4 inline-flex text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark">
              Clear filters →
            </Link>
          </div>
        ) : (
          <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contents.map((content) => (
              <ContentCard 
                key={content.id} 
                content={content} 
                eyebrow={content.category?.name ?? content.type} 
              />
            ))}
        </div>
        )}
        </section>
      </div>
    </>
  );
}
