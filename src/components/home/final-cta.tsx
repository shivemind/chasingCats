import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="container-section py-24">
      <div className="rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-night p-[1px]">
        <div className="rounded-3xl bg-night px-10 py-16 text-[#F5F1E3] md:px-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-accent">Ready to chase cats?</p>
            <h2 className="mt-6 text-3xl font-semibold sm:text-4xl">
              Get expert guidance, community accountability, and exclusive expeditions to find the cats you dream about.
            </h2>
            <p className="mt-4 text-base text-[#F5F1E3]/70">
              Membership starts at $15/month or $150/year (includes a 60-minute strategy session with Sebastian &amp; Rachel).
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/join"
                className="rounded-full bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-wide text-night transition hover:bg-white"
              >
                Choose your plan
              </Link>
              <Link href="/login" className="text-sm font-semibold text-[#F5F1E3] hover:text-white">
                Already a member? Sign in →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
