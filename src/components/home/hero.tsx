import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-midnight via-deep-space to-night">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-cat-pattern opacity-30" />
      <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-neon-cyan/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-neon-purple/10 blur-3xl" />
      
      {/* Cat eyes accent */}
      <div className="absolute top-1/4 right-1/4 flex gap-8 opacity-20">
        <div className="h-4 w-8 rounded-full bg-cat-eye shadow-cat-eye" />
        <div className="h-4 w-8 rounded-full bg-cat-eye shadow-cat-eye" />
      </div>
      
      <div className="container-section relative z-10 grid gap-10 py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neon-cyan shadow-glow backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-neon-cyan" />
            Enter the Wild
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            A home for{' '}
            <span className="bg-gradient-to-r from-neon-cyan via-brand-light to-neon-purple bg-clip-text text-transparent">
              wild cat nerds
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            Join our community of cat enthusiasts to unlock expert knowledge about the world&apos;s most elusive felines. Learn from guides, conservationists, and wildlife photographers.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/join"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-neon-cyan to-brand px-8 py-4 text-base font-semibold text-night shadow-glow transition-all hover:shadow-glow-accent"
            >
              <span className="relative z-10">Become a member</span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-cat-eye opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link href="#inside" className="group flex items-center gap-2 text-base font-semibold text-white/80 transition hover:text-neon-cyan">
              See what&apos;s inside
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <dl className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <dt className="font-semibold text-neon-cyan">20+ hrs of courses</dt>
              <dd className="mt-1 text-sm text-white/60">Camera trapping, fieldcraft, editing, ethics.</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <dt className="font-semibold text-accent">Live Q&amp;As monthly</dt>
              <dd className="mt-1 text-sm text-white/60">Direct access to Rachel &amp; Sebastian.</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <dt className="font-semibold text-neon-purple">Global cat intel</dt>
              <dd className="mt-1 text-sm text-white/60">Species dossiers &amp; tracking guides.</dd>
            </div>
          </dl>
        </div>
        <div className="relative">
          {/* Glowing border effect */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-neon-cyan via-neon-purple to-accent opacity-50 blur-sm" />
          <div className="relative rounded-3xl border border-white/20 bg-night/80 p-6 backdrop-blur-xl">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-deep-space to-midnight">
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  {/* Cat eyes animation */}
                  <div className="mb-6 flex justify-center gap-6">
                    <div className="h-3 w-6 animate-pulse rounded-full bg-cat-eye-green shadow-cat-eye" />
                    <div className="h-3 w-6 animate-pulse rounded-full bg-cat-eye-green shadow-cat-eye" style={{ animationDelay: '0.5s' }} />
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-accent">Featured Preview</p>
                  <p className="mt-3 text-xl font-semibold text-white">
                    Tracking Clouded Leopards in Borneo
                  </p>
                  <button className="mt-4 rounded-full border border-white/30 bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20">
                    ▶ Watch Trailer
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/60">
              Members unlock the full archive, including hours of expert talks, field insights, and photo lectures.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
