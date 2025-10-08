import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sand via-white to-sand">
      <div className="container-section grid gap-10 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-dark shadow-sm">
            Conservation-first storytelling
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-night sm:text-5xl lg:text-6xl">
            A home for cat nerds, expedition dreamers, and conservation storytellers.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-night/70">
            Join Rachel &amp; Sebastian for deep-dive workshops, live expedition briefings, expert interviews, and a private community focused on photographing and protecting the world&apos;s wild cats.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3 text-base font-semibold text-white shadow-card transition hover:bg-brand-dark"
            >
              Become a member
            </Link>
            <Link href="#inside" className="text-base font-semibold text-night hover:text-brand-dark">
              See what&apos;s inside →
            </Link>
          </div>
          <dl className="mt-10 grid gap-6 text-sm text-night/70 sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-night">20+ hrs of courses</dt>
              <dd>Camera trapping, fieldcraft, editing, ethics.</dd>
            </div>
            <div>
              <dt className="font-semibold text-night">Live Q&amp;As monthly</dt>
              <dd>Bring your questions to Rachel &amp; Sebastian.</dd>
            </div>
            <div>
              <dt className="font-semibold text-night">Global cat intel</dt>
              <dd>Species dossiers, tracking guides &amp; itineraries.</dd>
            </div>
          </dl>
        </div>
        <div className="relative rounded-3xl border border-night/10 bg-white/90 p-6 shadow-card">
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-night/90">
            <div className="flex h-full w-full items-center justify-center text-sand/60">
              <div className="text-center">
                <p className="text-sm uppercase tracking-widest text-accent">Preview</p>
                <p className="mt-3 text-xl font-semibold text-sand">
                  Watch: &ldquo;Tracking Clouded Leopards in Borneo&rdquo;
                </p>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-night/70">
            Members unlock the full archive, including expedition recaps, gear breakdowns, and live workshop recordings.
          </p>
          <div className="mt-6 flex items-center gap-4 rounded-xl bg-sand/60 p-4">
            <Image
              src="/images/rachel-sebastian.svg"
              alt="Rachel and Sebastian"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-night">Meet your guides</p>
              <p className="text-sm text-night/70">Wildlife pros, expedition leaders, conservation storytellers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
