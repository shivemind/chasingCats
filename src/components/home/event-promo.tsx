import Link from 'next/link';

export function EventPromo() {
  return (
    <section className="container-section py-24">
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-deep-space via-midnight to-deep-space p-10 md:p-16 overflow-hidden">
        {/* Cat eyes decoration */}
        <div className="absolute top-8 right-8 flex gap-3 opacity-20">
          <div className="h-4 w-8 rounded-full bg-cat-eye shadow-[0_0_15px_#ffd700]" />
          <div className="h-4 w-8 rounded-full bg-cat-eye shadow-[0_0_15px_#ffd700]" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-neon-cyan/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-neon-purple/10 blur-3xl" />
        
        <div className="relative grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan">Next Expert Session</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              The Biology of Claws with Dr. Ned Nedlinger
            </h2>
            <p className="mt-4 text-base text-gray-400">
              A deep dive into claw evolution, why some cats roar, and how to read paw prints in the field. Submit questions for Rachel and Sebastian to bring to Dr. Nedlinger.
            </p>
            <dl className="mt-6 grid gap-4 text-sm text-gray-400 sm:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-4">
                <dt className="font-semibold text-white">Goes live in</dt>
                <dd className="mt-1 text-neon-cyan">5 days • 6 hours • 23 minutes</dd>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <dt className="font-semibold text-white">Format</dt>
                <dd className="mt-1">Zoom Webinar + Archive replay</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/ask"
                className="rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:shadow-[0_0_20px_rgba(0,245,212,0.4)]"
              >
                Submit your question
              </Link>
              <Link href="/events/biology-of-claws" className="flex items-center gap-1 text-sm font-semibold text-white hover:text-neon-cyan transition-colors">
                Event details 
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5">
            <div className="aspect-[4/3] w-full">
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center p-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-cyan/20">
                    <svg className="h-8 w-8 text-neon-cyan" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-sm uppercase tracking-widest text-neon-purple">Preview</p>
                  <p className="mt-3 text-xl font-semibold text-white">
                    Dr. Ned Nedlinger on Claw Biology
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Watch the teaser
                  </p>
                </div>
              </div>
            </div>
            <p className="border-t border-white/10 p-4 text-center text-xs uppercase tracking-[0.3em] text-neon-cyan/80">Included with membership</p>
          </div>
        </div>
      </div>
    </section>
  );
}
