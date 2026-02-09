import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { EventCountdown } from '@/components/events/event-countdown';
import { generateEventSchema, generateBreadcrumbSchema } from '@/lib/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chasing-cats.vercel.app';

// Enable ISR - revalidate every 60 seconds for new events
export const revalidate = 60;
export const dynamicParams = true;

// Pre-render all event pages at build time
export async function generateStaticParams() {
  const events = await prisma.event.findMany({
    select: { slug: true },
  });

  return events.map((event) => ({
    slug: event.slug,
  }));
}

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  
  if (!event) {
    return { title: 'Event Not Found' };
  }

  const canonicalUrl = `${siteUrl}/events/${event.slug}`;
  
  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description,
      images: [`${siteUrl}/og-image.svg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });

  if (!event) {
    notFound();
  }

  const isUpcoming = new Date(event.startTime) > new Date();

  // Generate structured data
  const eventSchema = generateEventSchema({
    title: event.title,
    description: event.description,
    url: `/events/${event.slug}`,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    host: event.host,
    isOnline: true,
  });

  const breadcrumbData = generateBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: event.title, href: `/events/${event.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="bg-white">
      <section className="container-section py-24">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/experts" className="text-sm font-semibold text-brand hover:text-brand-dark">
              ← Back to Experts
            </Link>
            {isUpcoming && (
              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                Upcoming
              </span>
            )}
          </div>

          <h1 className="mt-6 text-3xl font-semibold text-night sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>
          
          <p className="mt-6 text-lg text-night/70">{event.description}</p>

          <div className="mt-8 grid gap-6 rounded-3xl border border-night/10 bg-[#F5F1E3]/60 p-8 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-night/60">Date & Time</h3>
              <p className="mt-2 text-lg font-semibold text-night">
                {format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="mt-1 text-base text-night/70">
                {format(new Date(event.startTime), 'h:mm a')} - {event.endTime ? format(new Date(event.endTime), 'h:mm a') : 'TBD'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-night/60">Format</h3>
              <p className="mt-2 text-lg font-semibold text-night">Zoom Webinar</p>
              <p className="mt-1 text-base text-night/70">Live session + archive replay for members</p>
            </div>
            {event.host && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-night/60">Host</h3>
                <p className="mt-2 text-lg font-semibold text-night">{event.host}</p>
              </div>
            )}
            {event.location && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-night/60">Location</h3>
                <p className="mt-2 text-lg font-semibold text-night">{event.location}</p>
              </div>
            )}
          </div>

          {isUpcoming && (
            <div className="mt-8">
              <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-night/60">
                Event starts in
              </h3>
              <EventCountdown targetDate={event.startTime.toISOString()} />
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/ask"
              className="rounded-full bg-brand px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-card transition hover:bg-brand-dark"
            >
              Submit your question
            </Link>
            <Link
              href="/join"
              className="rounded-full border border-night/20 px-8 py-3 text-sm font-semibold text-night transition hover:bg-night/5"
            >
              Join to attend live
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-night text-[#F5F1E3]">
        <div className="container-section py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold">Members get full access</h2>
            <p className="mt-4 text-[#F5F1E3]/70">
              Live attendance, replay access, Q&A participation, and downloadable resources.
            </p>
            <Link
              href="/join"
              className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-night transition hover:bg-white"
            >
              Become a member
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
