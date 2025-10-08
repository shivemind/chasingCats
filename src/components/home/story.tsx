import Link from 'next/link';
import Image from 'next/image';

export function StorySection() {
  return (
    <section className="container-section grid gap-12 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="order-2 rounded-3xl border border-night/10 bg-white p-10 shadow-card lg:order-1">
        <h2 className="section-heading">Who we are</h2>
        <p className="mt-6 text-base text-night/70">
          Rachel and Sebastian have spent the last decade guiding cat-focused expeditions across six continents. From camera trapping snow leopards in Ladakh to documenting jaguar conservation in the Pantanal, they&apos;re obsessed with helping more people experience, understand, and protect big cats.
        </p>
        <p className="mt-4 text-base text-night/70">
          Inside Chasing Cats Club, you&apos;ll join a global network of photographers, scientists, and fellow cat nerds trading intel, celebrating sightings, and funding fieldwork.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/join"
            className="rounded-full bg-night px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#F5F1E3] transition hover:bg-brand-dark"
          >
            Join the club
          </Link>
          <Link href="/about" className="text-sm font-semibold text-night hover:text-brand-dark">
            Meet Rachel &amp; Sebastian →
          </Link>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <div className="relative overflow-hidden rounded-3xl">
          <Image
            src="/images/expedition-collage.svg"
            alt="Collage of wild cat expeditions"
            width={900}
            height={600}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-night/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
