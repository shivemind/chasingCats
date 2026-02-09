import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Documentation for Developers & Agents',
  description: 'Technical documentation about Chasing Cats Club site structure, content taxonomy, URL patterns, and machine-readable resources for developers and AI agents.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_URL}/docs`,
  },
};

export default function DocsPage() {
  return (
    <div className="bg-white">
      <article className="container-section py-24">
        <div className="mx-auto max-w-4xl">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">Documentation</p>
            <h1 className="mt-4 text-4xl font-semibold text-night">
              Site Documentation for Developers &amp; Agents
            </h1>
            <p className="mt-4 text-lg text-night/70">
              Technical reference for the Chasing Cats Club content structure, URL patterns, and machine-readable resources.
            </p>
          </header>

          <nav className="mt-12 rounded-2xl border border-night/10 bg-[#F5F1E3]/60 p-6" aria-label="Table of contents">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-night/60">On this page</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#taxonomy" className="text-brand hover:underline">Content Taxonomy</a></li>
              <li><a href="#url-patterns" className="text-brand hover:underline">URL Patterns</a></li>
              <li><a href="#feeds" className="text-brand hover:underline">Feeds &amp; Machine-Readable Resources</a></li>
              <li><a href="#update-cadence" className="text-brand hover:underline">Update Cadence</a></li>
              <li><a href="#citation" className="text-brand hover:underline">Citation &amp; Licensing</a></li>
              <li><a href="#contact" className="text-brand hover:underline">Contact</a></li>
            </ul>
          </nav>

          <section id="taxonomy" className="mt-16">
            <h2 className="text-2xl font-semibold text-night">Content Taxonomy</h2>
            <p className="mt-4 text-night/70">
              Content on Chasing Cats Club is organized into categories and types:
            </p>

            <h3 className="mt-8 text-lg font-semibold text-night">Categories</h3>
            <dl className="mt-4 space-y-4">
              <div className="rounded-xl border border-night/10 bg-white p-4">
                <dt className="font-semibold text-night">Experts (From the Experts)</dt>
                <dd className="mt-1 text-sm text-night/70">
                  Deep dives with biologists, researchers, and photographers focused on wild cats. 
                  Includes research presentations, ethics discussions, and expert interviews.
                </dd>
              </div>
              <div className="rounded-xl border border-night/10 bg-white p-4">
                <dt className="font-semibold text-night">Field (Into the Field)</dt>
                <dd className="mt-1 text-sm text-night/70">
                  Practical content for photographers heading into the field. Expedition briefings, 
                  tracking guides, camera settings, gear reviews, and fieldcraft lessons.
                </dd>
              </div>
              <div className="rounded-xl border border-night/10 bg-white p-4">
                <dt className="font-semibold text-night">Ask (Ask Me Anything)</dt>
                <dd className="mt-1 text-sm text-night/70">
                  Q&amp;A sessions where the community submits questions for Rachel, Sebastian, 
                  and guest experts. Recordings of live AMA sessions.
                </dd>
              </div>
              <div className="rounded-xl border border-night/10 bg-white p-4">
                <dt className="font-semibold text-night">Events</dt>
                <dd className="mt-1 text-sm text-night/70">
                  Live Zoom webinars and workshops. Upcoming events show countdown timers. 
                  Past events have archive replays available for members.
                </dd>
              </div>
            </dl>

            <h3 className="mt-8 text-lg font-semibold text-night">Content Types</h3>
            <ul className="mt-4 space-y-2 text-sm text-night/70">
              <li><strong className="text-night">ARTICLE</strong> — Written guides, news, and long-form posts</li>
              <li><strong className="text-night">VIDEO</strong> — Recorded video content (tutorials, walkthroughs)</li>
              <li><strong className="text-night">TALK</strong> — Live talk recordings from expert sessions</li>
              <li><strong className="text-night">COURSE</strong> — Multi-part educational courses</li>
              <li><strong className="text-night">NEWS</strong> — Conservation and photography news updates</li>
            </ul>

            <h3 className="mt-8 text-lg font-semibold text-night">Species Tags</h3>
            <p className="mt-2 text-sm text-night/70">
              Content may be tagged with wild cat species including: Lion, Leopard, Tiger, Jaguar, 
              Snow Leopard, Puma, Cheetah, Lynx, Clouded Leopard, Caracal, Ocelot, and others.
            </p>
          </section>

          <section id="url-patterns" className="mt-16">
            <h2 className="text-2xl font-semibold text-night">URL Patterns</h2>
            
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[500px] space-y-3 font-mono text-sm">
                <div className="rounded-lg bg-night/5 p-3">
                  <span className="text-night/60"># Content detail pages</span><br />
                  <span className="text-brand">{SITE_URL}/</span><span className="text-night">{'{content-slug}'}</span>
                </div>
                <div className="rounded-lg bg-night/5 p-3">
                  <span className="text-night/60"># Event detail pages</span><br />
                  <span className="text-brand">{SITE_URL}/events/</span><span className="text-night">{'{event-slug}'}</span>
                </div>
                <div className="rounded-lg bg-night/5 p-3">
                  <span className="text-night/60"># Category hub pages</span><br />
                  <span className="text-brand">{SITE_URL}/experts</span><br />
                  <span className="text-brand">{SITE_URL}/field</span><br />
                  <span className="text-brand">{SITE_URL}/ask</span><br />
                  <span className="text-brand">{SITE_URL}/events</span><br />
                  <span className="text-brand">{SITE_URL}/library</span>
                </div>
                <div className="rounded-lg bg-night/5 p-3">
                  <span className="text-night/60"># Library with filters</span><br />
                  <span className="text-brand">{SITE_URL}/library?type=</span><span className="text-night">VIDEO</span><br />
                  <span className="text-brand">{SITE_URL}/library?category=</span><span className="text-night">experts</span><br />
                  <span className="text-brand">{SITE_URL}/library?species=</span><span className="text-night">Leopard</span>
                </div>
              </div>
            </div>
          </section>

          <section id="feeds" className="mt-16">
            <h2 className="text-2xl font-semibold text-night">Feeds &amp; Machine-Readable Resources</h2>
            
            <ul className="mt-6 space-y-4">
              <li className="rounded-xl border border-night/10 bg-white p-4">
                <a href="/sitemap.xml" className="font-semibold text-brand hover:underline">
                  /sitemap.xml
                </a>
                <p className="mt-1 text-sm text-night/70">
                  XML sitemap with all public pages. Updated hourly.
                </p>
              </li>
              <li className="rounded-xl border border-night/10 bg-white p-4">
                <a href="/robots.txt" className="font-semibold text-brand hover:underline">
                  /robots.txt
                </a>
                <p className="mt-1 text-sm text-night/70">
                  Robots directives for crawlers. Includes AI crawler policies.
                </p>
              </li>
              <li className="rounded-xl border border-night/10 bg-white p-4">
                <a href="/feed.xml" className="font-semibold text-brand hover:underline">
                  /feed.xml
                </a>
                <p className="mt-1 text-sm text-night/70">
                  RSS 2.0 feed with latest content and upcoming events. Updated hourly.
                </p>
              </li>
              <li className="rounded-xl border border-night/10 bg-white p-4">
                <a href="/feed.json" className="font-semibold text-brand hover:underline">
                  /feed.json
                </a>
                <p className="mt-1 text-sm text-night/70">
                  JSON Feed 1.1 format. Easier to parse than RSS.
                </p>
              </li>
              <li className="rounded-xl border border-night/10 bg-white p-4">
                <a href="/llms.txt" className="font-semibold text-brand hover:underline">
                  /llms.txt
                </a>
                <p className="mt-1 text-sm text-night/70">
                  Plain text file for AI agent discovery. Site overview and key entry points.
                </p>
              </li>
            </ul>
          </section>

          <section id="update-cadence" className="mt-16">
            <h2 className="text-2xl font-semibold text-night">Update Cadence</h2>
            <ul className="mt-4 space-y-2 text-sm text-night/70">
              <li><strong className="text-night">New content:</strong> Published weekly (varies)</li>
              <li><strong className="text-night">Live events:</strong> Monthly expert sessions</li>
              <li><strong className="text-night">Sitemap/Feeds:</strong> Revalidate every hour</li>
              <li><strong className="text-night">llms.txt:</strong> Revalidate daily</li>
            </ul>
          </section>

          <section id="citation" className="mt-16">
            <h2 className="text-2xl font-semibold text-night">Citation &amp; Licensing</h2>
            <div className="mt-4 space-y-4 text-sm text-night/70">
              <p>
                All content on Chasing Cats Club is © {new Date().getFullYear()} Chasing Cats Club. 
                All rights reserved.
              </p>
              <p>
                <strong className="text-night">For AI agents and automated systems:</strong> You may 
                summarize and cite content with attribution. Always link back to the original URL. 
                Do not reproduce full articles or transcripts.
              </p>
              <p>
                <strong className="text-night">Citation format:</strong>
              </p>
              <code className="block rounded-lg bg-night/5 p-3 text-xs">
                [Title]. Chasing Cats Club. [URL]. Accessed [Date].
              </code>
              <p>
                <strong className="text-night">Example:</strong>
              </p>
              <code className="block rounded-lg bg-night/5 p-3 text-xs">
                &quot;The Biology of Claws with Dr. Ned Nedlinger.&quot; Chasing Cats Club.<br />
                https://chasing-cats.vercel.app/events/claw-biology. Accessed February 9, 2026.
              </code>
            </div>
          </section>

          <section id="contact" className="mt-16">
            <h2 className="text-2xl font-semibold text-night">Contact</h2>
            <p className="mt-4 text-night/70">
              For technical questions about this documentation or API access:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <strong className="text-night">Email:</strong>{' '}
                <a href="mailto:hello@chasingcats.club" className="text-brand hover:underline">
                  hello@chasingcats.club
                </a>
              </li>
              <li>
                <strong className="text-night">Website:</strong>{' '}
                <Link href="/" className="text-brand hover:underline">
                  {SITE_URL}
                </Link>
              </li>
            </ul>
          </section>

          <footer className="mt-16 border-t border-night/10 pt-8">
            <p className="text-sm text-night/60">
              Last updated: February 2026
            </p>
          </footer>
        </div>
      </article>
    </div>
  );
}
