import Link from 'next/link';
import Image from 'next/image';

export function StorySection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-deep-space to-midnight">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-neon-purple/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-neon-cyan/5 blur-3xl" />
      
      <div className="container-section relative grid gap-12 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="order-2 relative rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm lg:order-1">
          {/* Cat eyes decoration */}
          <div className="absolute top-6 right-6 flex gap-2 opacity-30">
            <div className="h-2 w-4 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700]" />
            <div className="h-2 w-4 rounded-full bg-cat-eye shadow-[0_0_10px_#ffd700]" />
          </div>
          
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan">Our Story</span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Who we are</h2>
          <p className="mt-6 text-base text-gray-400">
            Rachel and Sebastian have spent the last decade guiding cat-focused expeditions across six continents. From camera trapping snow leopards in Ladakh to documenting jaguar conservation in the Pantanal, they&apos;re obsessed with helping more people experience, understand, and protect big cats.
          </p>
          <p className="mt-4 text-base text-gray-400">
            Inside Chasing Cats Club, you&apos;ll join a global network of photographers, scientists, and fellow cat nerds trading intel, celebrating sightings, and funding fieldwork.
          </p>
          
          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <p className="text-2xl font-bold text-neon-cyan">6</p>
              <p className="text-xs text-gray-500">Continents</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <p className="text-2xl font-bold text-neon-purple">10+</p>
              <p className="text-xs text-gray-500">Years</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <p className="text-2xl font-bold text-cat-eye">36</p>
              <p className="text-xs text-gray-500">Cat Species</p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/join"
              className="rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:shadow-[0_0_20px_rgba(0,245,212,0.4)]"
            >
              Join the club
            </Link>
            <Link href="/about" className="flex items-center gap-1 text-sm font-semibold text-white hover:text-neon-cyan transition-colors">
              Meet Rachel &amp; Sebastian →
            </Link>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/images/expedition-collage.svg"
              alt="Collage of wild cat expeditions"
              width={900}
              height={600}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-deep-space/80 via-deep-space/40 to-transparent" />
            
            {/* Floating cat eyes */}
            <div className="absolute bottom-8 right-8 flex gap-3 animate-pulse">
              <div className="h-4 w-8 rounded-full bg-cat-eye shadow-[0_0_20px_#ffd700]" />
              <div className="h-4 w-8 rounded-full bg-cat-eye shadow-[0_0_20px_#ffd700]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
