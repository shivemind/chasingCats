import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative mt-0 border-t border-white/10 bg-gradient-to-b from-deep-space to-night text-white">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/4 h-40 w-40 rounded-full bg-neon-cyan/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-neon-purple/5 blur-3xl" />
      </div>

      {/* Cat eyes decoration */}
      <div className="absolute top-8 right-12 flex gap-2 opacity-10">
        <div className="h-3 w-1.5 rounded-full bg-cat-eye" />
        <div className="h-3 w-1.5 rounded-full bg-cat-eye" />
      </div>

      <div className="container-section relative py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20">
                <div className="flex gap-1">
                  <div className="h-2 w-1 rounded-full bg-cat-eye shadow-glow-cat-eye" />
                  <div className="h-2 w-1 rounded-full bg-cat-eye shadow-glow-cat-eye" />
                </div>
              </div>
              <h3 className="text-lg font-bold">Chasing Cats Club</h3>
            </div>
            <p className="mt-4 text-sm text-white/50">
              Community, courses, and conservation insights from wildlife guides Rachel &amp; Sebastian.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition hover:border-neon-cyan/50 hover:text-neon-cyan">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition hover:border-neon-cyan/50 hover:text-neon-cyan">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition hover:border-neon-cyan/50 hover:text-neon-cyan">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan">Explore</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/experts" className="text-white/60 transition hover:text-white">
                  From the Experts
                </Link>
              </li>
              <li>
                <Link href="/field" className="text-white/60 transition hover:text-white">
                  Into the Field
                </Link>
              </li>
              <li>
                <Link href="/ask" className="text-white/60 transition hover:text-white">
                  Ask Me Anything
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-white/60 transition hover:text-white">
                  Shop
                </Link>
              </li>
            </ul>
          </div>

          {/* Membership */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-purple">Membership</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/join" className="text-white/60 transition hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-white/60 transition hover:text-white">
                  Manage subscription
                </Link>
              </li>
              <li>
                <Link href="/library" className="text-white/60 transition hover:text-white">
                  Content Library
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/60 transition hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-cat-eye">Stay in touch</h4>
            <p className="mt-4 text-sm text-white/50">
              Get the latest conservation news, content drops, and expedition updates.
            </p>
            <form className="mt-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-neon-cyan to-brand px-4 py-2.5 text-sm font-semibold text-night transition hover:shadow-glow"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/40">
            &copy; {new Date().getFullYear()} Chasing Cats Club. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/40 transition hover:text-neon-cyan">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/40 transition hover:text-neon-cyan">
              Terms
            </Link>
            <Link href="mailto:hello@chasingcats.club" className="text-white/40 transition hover:text-neon-cyan">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
