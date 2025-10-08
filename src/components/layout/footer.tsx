import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-night/10 bg-night text-sand">
      <div className="container-section py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Chasing Cats Club</h3>
            <p className="mt-4 text-sm text-sand/70">
              Community, courses, and conservation insights from wildlife guides Rachel &amp; Sebastian.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-sand/80">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-sand/70">
              <li>
                <Link href="/experts" className="hover:text-sand">
                  From the Experts
                </Link>
              </li>
              <li>
                <Link href="/field" className="hover:text-sand">
                  Into the Field
                </Link>
              </li>
              <li>
                <Link href="/ask" className="hover:text-sand">
                  Ask Me Anything
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-sand">
                  Shop
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-sand/80">Membership</h4>
            <ul className="mt-3 space-y-2 text-sm text-sand/70">
              <li>
                <Link href="/join" className="hover:text-sand">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-sand">
                  Manage subscription
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-sand">
                  Upcoming talks
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-sand/80">Stay in touch</h4>
            <p className="mt-3 text-sm text-sand/70">
              Get the latest conservation news, content drops, and expedition updates.
            </p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 rounded-md border border-sand/30 bg-night px-3 py-2 text-sm placeholder:text-sand/40 focus:border-brand focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-night transition hover:bg-white"
              >
                Notify me
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-sand/10 pt-6 text-sm text-sand/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Chasing Cats Club. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-sand">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-sand">
              Terms
            </Link>
            <Link href="mailto:hello@chasingcats.club" className="hover:text-sand">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
