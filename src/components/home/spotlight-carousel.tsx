import Link from 'next/link';

const spotlightItems = [
  {
    title: 'Next Talk: Biology of Claws with Dr. Ned Nedlinger',
    description: 'Live breakdown of retractable claws, tracking tips, and conservation updates.',
    date: '5 days • 6 hours • 23 min',
    cta: 'Submit your questions',
    href: '/events/biology-of-claws'
  },
  {
    title: 'Field Notes: Finding Pumas in Patagonia',
    description: 'Terrain intel, reading guanaco behavior, and ideal camera setups from the latest expedition.',
    date: 'Premieres April 4',
    cta: 'Save your spot',
    href: '/field/pumas-in-patagonia'
  },
  {
    title: 'Editing Lab: Snow Leopard Evening Sequence',
    description: 'Live edit of Sebastian’s RAW files with workflow tips for low-light subjects.',
    date: 'Archive session • 78 min',
    cta: 'Watch now',
    href: '/experts/snow-leopard-editing-lab'
  }
];

export function SpotlightCarousel() {
  return (
    <section className="bg-night text-[#F5F1E3]">
      <div className="container-section py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your next live experience</h2>
            <p className="mt-4 text-base text-[#F5F1E3]/70">
              We host monthly live talks and workshops. RSVP, drop your questions in advance, and catch the replay in the archive.
            </p>
          </div>
          <div className="relative w-full overflow-hidden">
            <div className="flex snap-x gap-6 overflow-x-auto pb-6">
              {spotlightItems.map((item) => (
                <article
                  key={item.title}
                  className="min-w-[280px] snap-center rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur transition hover:border-accent/60"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-accent/80">Featured</p>
                  <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#F5F1E3]/70">{item.description}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#F5F1E3]/60">{item.date}</p>
                  <Link
                    href={item.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
                  >
                    {item.cta} →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
