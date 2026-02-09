import Link from 'next/link';
import { format } from 'date-fns';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { SITE_URL, generateCollectionPageSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Events - Live Talks & Workshops',
  description: 'Upcoming live talks, workshops, and Q&A sessions with wild cat experts. Join our community events for expert-led discussions on wildlife photography and conservation.',
  openGraph: {
    title: 'Events | Chasing Cats Club',
    description: 'Upcoming live talks, workshops, and Q&A sessions with wild cat experts.',
    type: 'website',
    url: `${SITE_URL}/events`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events | Chasing Cats Club',
    description: 'Upcoming live talks, workshops, and Q&A sessions with wild cat experts.',
  },
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
};

const eventsPageSchema = generateCollectionPageSchema({
  name: 'Events - Live Talks & Workshops',
  description: 'Upcoming live talks, workshops, and Q&A sessions with wild cat experts.',
  url: '/events',
});

export default async function EventsPage() {
  const now = new Date();
  
  const [upcomingEvents, pastEvents] = await Promise.all([
    prisma.event.findMany({
      where: { startTime: { gte: now } },
      orderBy: { startTime: 'asc' },
    }),
    prisma.event.findMany({
      where: { startTime: { lt: now } },
      orderBy: { startTime: 'desc' },
      take: 12,
    }),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsPageSchema) }}
      />
      <div className="bg-white">
      <section className="container-section py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">Events</p>
          <h1 className="mt-4 text-4xl font-semibold text-night sm:text-5xl">
            Live talks, workshops, and Q&A sessions
          </h1>
          <p className="mt-4 text-lg text-night/70">
            Join our community for expert-led events on wild cat photography, conservation, and fieldcraft.
          </p>
        </div>

        {upcomingEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-night">Upcoming Events</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group rounded-3xl border border-night/10 bg-white p-6 shadow-sm transition hover:border-brand/30 hover:shadow-md"
                >
                  <span className="inline-flex rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                    Upcoming
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-night group-hover:text-brand">
                    {event.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-night/70">{event.description}</p>
                  <div className="mt-4 text-sm font-medium text-night/60">
                    <p>{format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')}</p>
                    <p>{format(new Date(event.startTime), 'h:mm a')}</p>
                  </div>
                  {event.host && (
                    <p className="mt-2 text-xs text-night/50">Hosted by {event.host}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-night">Past Events</h2>
            <p className="mt-2 text-sm text-night/60">
              Members can access recordings of past events in the archive.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group rounded-3xl border border-night/10 bg-[#F5F1E3]/40 p-6 transition hover:border-brand/30"
                >
                  <h3 className="text-lg font-semibold text-night group-hover:text-brand">
                    {event.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-night/70">{event.description}</p>
                  <p className="mt-4 text-sm text-night/50">
                    {format(new Date(event.startTime), 'MMMM d, yyyy')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length === 0 && pastEvents.length === 0 && (
          <div className="mt-16 rounded-3xl border border-night/10 bg-[#F5F1E3]/60 p-12 text-center">
            <p className="text-lg font-semibold text-night">No events scheduled yet</p>
            <p className="mt-2 text-sm text-night/70">Check back soon for upcoming talks and workshops.</p>
            <Link
              href="/join"
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Join to get notified
            </Link>
          </div>
        )}
      </section>
      </div>
    </>
  );
}
