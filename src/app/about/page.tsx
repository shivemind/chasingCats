import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'About | Chasing Cats Club',
  description: 'Meet Rachel and Sebastian - wildlife photographers and conservationists behind Chasing Cats Club.'
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="container-section py-24">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">About Us</p>
          <h1 className="mt-4 text-4xl font-semibold text-night sm:text-5xl">
            Meet Rachel & Sebastian
          </h1>
          <p className="mt-6 text-lg text-night/70">
            Wildlife photographers, expedition leaders, and conservation storytellers with over a decade of experience tracking wild cats across six continents.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F1E3]">
        <div className="container-section py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-3xl bg-night/10">
              <Image
                src="/images/rachel-sebastian.svg"
                alt="Rachel and Sebastian in the field"
                width={600}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-night">Our Story</h2>
              <div className="mt-6 space-y-4 text-base text-night/70">
                <p>
                  We met on a snow leopard expedition in Ladakh in 2015. What started as a shared passion for wild cats 
                  quickly became a partnership—both in life and in conservation photography.
                </p>
                <p>
                  Since then, we&apos;ve guided dozens of cat-focused expeditions, from tracking jaguars in the Pantanal 
                  to documenting clouded leopards in Borneo. We&apos;ve worked with conservation organizations, published 
                  in major wildlife magazines, and built a community of photographers who share our obsession.
                </p>
                <p>
                  Chasing Cats Club is our way of sharing everything we&apos;ve learned—the fieldcraft, the camera techniques, 
                  the hard-won intel on where and when to find these elusive animals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-section py-24">
        <h2 className="text-center text-3xl font-semibold text-night">What We Believe</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-night/10 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl">
              🐆
            </div>
            <h3 className="mt-6 text-xl font-semibold text-night">Conservation First</h3>
            <p className="mt-3 text-sm text-night/70">
              Every photograph, every expedition, every story we tell serves a larger purpose: 
              protecting wild cats and their habitats for future generations.
            </p>
          </div>
          <div className="rounded-3xl border border-night/10 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl">
              📸
            </div>
            <h3 className="mt-6 text-xl font-semibold text-night">Ethical Photography</h3>
            <p className="mt-3 text-sm text-night/70">
              We never bait, call in, or stress our subjects. Patience and fieldcraft—not shortcuts—are 
              what produce meaningful wildlife encounters.
            </p>
          </div>
          <div className="rounded-3xl border border-night/10 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl">
              🌍
            </div>
            <h3 className="mt-6 text-xl font-semibold text-night">Community Impact</h3>
            <p className="mt-3 text-sm text-night/70">
              A portion of every membership goes directly to conservation projects. Together, our 
              community has funded camera trap studies, anti-poaching efforts, and habitat protection.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-night text-[#F5F1E3]">
        <div className="container-section py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold">Ready to join the expedition?</h2>
            <p className="mt-4 text-lg text-[#F5F1E3]/70">
              Get access to everything we know about finding and photographing wild cats.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/join"
                className="rounded-full bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-wide text-night transition hover:bg-white"
              >
                Become a member
              </Link>
              <Link
                href="/experts"
                className="rounded-full border border-[#F5F1E3]/30 px-8 py-3 text-sm font-semibold text-[#F5F1E3] transition hover:bg-white/10"
              >
                Browse free content
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
