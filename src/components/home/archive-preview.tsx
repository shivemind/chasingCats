import Link from 'next/link';
import type { Content } from '@prisma/client';
import { ContentCard } from '@/components/shared/content-card';

interface ArchivePreviewProps {
  experts: Content[];
  field: Content[];
  ask: Content[];
}

export function ArchivePreview({ experts, field, ask }: ArchivePreviewProps) {
  return (
    <section className="container-section py-24">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">The content library</h2>
            <p className="section-subtitle">New workshops, Q&amp;As, and field briefings drop every week.</p>
          </div>
          <Link href="/library" className="text-sm font-semibold text-night hover:text-brand-dark">
            Browse full archive →
          </Link>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-night">From the Experts</h3>
            <Link href="/experts" className="text-sm font-semibold text-brand hover:text-brand-dark">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {experts.map((item) => (
              <ContentCard key={item.id} content={item} eyebrow="Expert Talk" />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-night">Into the Field</h3>
            <Link href="/field" className="text-sm font-semibold text-brand hover:text-brand-dark">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {field.map((item) => (
              <ContentCard key={item.id} content={item} eyebrow="Field Notes" />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-night">Ask Me Anything</h3>
            <Link href="/ask" className="text-sm font-semibold text-brand hover:text-brand-dark">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {ask.map((item) => (
              <ContentCard key={item.id} content={item} eyebrow="AMA" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
