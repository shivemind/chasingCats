import Link from 'next/link';

export function EventPromo() {
  return (
    <section className="container-section py-24">
      <div className="rounded-3xl border border-night/10 bg-white p-10 shadow-card md:p-16">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/70">Next Live Session</p>
            <h2 className="mt-4 text-3xl font-semibold text-night sm:text-4xl">
              The Biology of Claws with Dr. Ned Nedlinger
            </h2>
            <p className="mt-4 text-base text-night/70">
              A deep dive into claw evolution, why some cats roar, and how to read paw prints in the field. Submit questions for Rachel and Sebastian to bring to Dr. Nedlinger.
            </p>
            <dl className="mt-6 grid gap-4 text-sm text-night/70 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-night">Goes live in</dt>
                <dd>5 days • 6 hours • 23 minutes</dd>
              </div>
              <div>
                <dt className="font-semibold text-night">Format</dt>
                <dd>Zoom Webinar + Archive replay</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/ask"
                className="rounded-full bg-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-card transition hover:bg-brand-dark"
              >
                Submit your question
              </Link>
              <Link href="/events/biology-of-claws" className="text-sm font-semibold text-night hover:text-brand-dark">
                Event details →
              </Link>
            </div>
          </div>
          <div className="rounded-3xl bg-night/90 p-8 text-sand">
            <h3 className="text-lg font-semibold">What you&apos;ll learn</h3>
            <ul className="mt-5 space-y-4 text-sm text-sand/80">
              <li>How claw structure informs species identification in the field</li>
              <li>Reading scratch marks and tree sign to locate elusive cats</li>
              <li>Photography setups for capturing paw detail ethically</li>
              <li>Conservation case studies: lynx rewilding and tiger corridors</li>
            </ul>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-accent/80">Included with membership</p>
          </div>
        </div>
      </div>
    </section>
  );
}
