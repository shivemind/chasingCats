import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ContentCard } from '@/components/shared/content-card';
import Link from 'next/link';
import { SITE_URL, generateCollectionPageSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Into the Field - Expedition Guides & Fieldcraft',
  description: 'Expedition briefings, tracking guides, camera settings, and fieldcraft lessons for photographing wild cats in the field.',
  openGraph: {
    title: 'Into the Field | Chasing Cats Club',
    description: 'Expedition briefings, tracking guides, and fieldcraft lessons for photographing wild cats.',
    type: 'website',
    url: `${SITE_URL}/field`,
  },
  alternates: {
    canonical: `${SITE_URL}/field`,
  },
};

const fieldPageSchema = generateCollectionPageSchema({
  name: 'Into the Field',
  description: 'Expedition briefings, tracking guides, and fieldcraft lessons for photographing wild cats.',
  url: '/field',
});

export default async function FieldPage() {
  const contents = await prisma.content.findMany({
    where: { category: { slug: 'field' } },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fieldPageSchema) }}
      />
      <div className="bg-white">
        <section className="container-section py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">Into the Field</p>
            <h1 className="mt-4 text-4xl font-semibold text-night">Fieldcraft, logistics, and editing labs from the front lines.</h1>
            <p className="mt-4 text-night/70">
              Follow Sebastian and Rachel into jungles, deserts, and mountains. Watch gear walk-throughs, live edits, and location briefings.
            </p>
          </div>
          <Link
            href="/ask"
            className="rounded-full bg-night px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#F5F1E3] transition hover:bg-brand-dark"
          >
            Submit a topic request
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} eyebrow="Field Notes" />
          ))}
        </div>
        </section>
      </div>
    </>
  );
}
