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
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight via-deep-space to-midnight" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="container-section relative py-24">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="h-2 w-4 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700]" />
                  <div className="h-2 w-4 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700]" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan">Content Library</span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">The content library</h2>
              <p className="mt-2 text-lg text-gray-400">New workshops, Q&amp;As, and field briefings drop every week.</p>
            </div>
            <Link href="/library" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-neon-cyan/30 transition-all">
              Browse full archive
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          {/* From the Experts */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎓</span>
                <h3 className="text-xl font-semibold text-white">From the Experts</h3>
              </div>
              <Link href="/experts" className="text-sm font-semibold text-neon-cyan hover:text-neon-cyan/80 transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {experts.map((item) => (
                <ContentCard key={item.id} content={item} eyebrow="Expert Talk" />
              ))}
            </div>
          </div>
          
          {/* Into the Field */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <h3 className="text-xl font-semibold text-white">Into the Field</h3>
              </div>
              <Link href="/field" className="text-sm font-semibold text-neon-cyan hover:text-neon-cyan/80 transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {field.map((item) => (
                <ContentCard key={item.id} content={item} eyebrow="Field Notes" />
              ))}
            </div>
          </div>
          
          {/* Ask Me Anything */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎤</span>
                <h3 className="text-xl font-semibold text-white">Ask Me Anything</h3>
              </div>
              <Link href="/ask" className="text-sm font-semibold text-neon-cyan hover:text-neon-cyan/80 transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {ask.map((item) => (
                <ContentCard key={item.id} content={item} eyebrow="AMA" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
