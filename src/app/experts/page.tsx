import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ContentCard } from '@/components/shared/content-card';
import { UpcomingExpertSession } from '@/components/experts/upcoming-session';
import Link from 'next/link';
import { SITE_URL, generateCollectionPageSchema } from '@/lib/seo';

interface ExpertsPageProps {
  searchParams?: {
    species?: string;
    region?: string;
    topic?: string;
  };
}

export const metadata: Metadata = {
  title: 'From the Experts - Wild Cat Research & Photography Talks',
  description: 'Deep dives with biologists, researchers, and photographers focused on wild cats. Expert talks on conservation, ethics, and wildlife photography techniques.',
  openGraph: {
    title: 'From the Experts | Chasing Cats Club',
    description: 'Deep dives with biologists, researchers, and photographers focused on wild cats.',
    type: 'website',
    url: `${SITE_URL}/experts`,
  },
  alternates: {
    canonical: `${SITE_URL}/experts`,
  },
};

const expertsPageSchema = generateCollectionPageSchema({
  name: 'From the Experts',
  description: 'Deep dives with biologists, researchers, and photographers focused on wild cats.',
  url: '/experts',
});

export default async function ExpertsPage({ searchParams }: ExpertsPageProps) {
  const filters = searchParams ?? {};

  const contents = await prisma.content.findMany({
    where: {
      category: { slug: 'experts' },
      species: filters.species ? { equals: filters.species } : undefined,
      region: filters.region ? { equals: filters.region } : undefined,
      topic: filters.topic ? { equals: filters.topic } : undefined
    },
    orderBy: { publishedAt: 'desc' }
  });

  const uniqueSpecies = await prisma.content.findMany({
    where: { category: { slug: 'experts' } },
    select: { species: true },
    distinct: ['species']
  });

  const uniqueTopics = await prisma.content.findMany({
    where: { category: { slug: 'experts' } },
    select: { topic: true },
    distinct: ['topic']
  });

  const speciesOptions = uniqueSpecies.map((item) => item.species).filter(Boolean) as string[];
  const topicOptions = uniqueTopics.map((item) => item.topic).filter(Boolean) as string[];

  const upcomingEvent = await prisma.event.findFirst({
    where: { startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(expertsPageSchema) }}
      />
      <div className="bg-white">
        {upcomingEvent && <UpcomingExpertSession event={upcomingEvent} />}
      <section className="container-section py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">From the Experts</p>
            <h1 className="mt-4 text-4xl font-semibold text-night">Research, ethics, and field intel from cat specialists.</h1>
            <p className="mt-4 text-night/70">
              Browse live talks and archived lectures. Filter by species, region, or topic to find exactly what you need for your next expedition.
            </p>
          </div>
          <Link
            href="mailto:hello@chasingcats.club?subject=Expert+Request"
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-card transition hover:bg-brand-dark"
          >
            Request a speaker
          </Link>
        </div>

        <form className="mt-12 grid gap-4 rounded-3xl border border-night/10 bg-[#F5F1E3]/60 p-6 md:grid-cols-3">
          <label className="text-sm font-semibold text-night">
            Species
            <select
              name="species"
              defaultValue={filters.species ?? ''}
              className="mt-2 w-full rounded-xl border border-night/10 bg-white px-4 py-3 text-sm text-night/80 focus:border-brand focus:outline-none"
            >
              <option value="">All</option>
              {speciesOptions.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-night">
            Topic
            <select
              name="topic"
              defaultValue={filters.topic ?? ''}
              className="mt-2 w-full rounded-xl border border-night/10 bg-white px-4 py-3 text-sm text-night/80 focus:border-brand focus:outline-none"
            >
              <option value="">All</option>
              {topicOptions.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-3">
            <button type="submit" className="w-full rounded-full bg-night px-6 py-3 text-sm font-semibold text-[#F5F1E3]">
              Filter sessions
            </button>
            <Link href="/experts" className="text-sm font-semibold text-brand hover:text-brand-dark">
              Clear
            </Link>
          </div>
        </form>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} eyebrow="Expert Talk" />
          ))}
        </div>
      </section>
      </div>
    </>
  );
}
