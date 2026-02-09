import type { Metadata } from 'next';
import { PricingTable } from '@/components/join/pricing-table';
import { generateMembershipSchema, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Join the Chasing Cats Club - Membership Pricing',
  description: 'Choose your plan to unlock live talks, workshops, field intel, and community features. Monthly ($15/mo) or Annual ($150/yr) membership options.',
  openGraph: {
    title: 'Join the Chasing Cats Club',
    description: 'Access wildlife photography courses, expert interviews, live talks, and a supportive community.',
    type: 'website',
    url: `${SITE_URL}/join`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join the Chasing Cats Club',
    description: 'Access wildlife photography courses, expert interviews, live talks, and a supportive community.',
  },
  alternates: {
    canonical: `${SITE_URL}/join`,
  },
};

// Membership pricing for structured data
const membershipSchema = generateMembershipSchema([
  {
    name: 'Monthly Explorer',
    description: 'Full access billed monthly. Cancel anytime.',
    price: 15,
    billingPeriod: 'month',
  },
  {
    name: 'Annual Expedition',
    description: 'Two months free plus a 60-minute 1:1 session.',
    price: 150,
    billingPeriod: 'year',
  },
]);

export default function JoinPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(membershipSchema) }}
      />
      <div className="bg-white">
      <section className="container-section py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">Membership</p>
          <h1 className="mt-4 text-4xl font-semibold text-night sm:text-5xl">
            Access the world&apos;s premier wild cat storytelling hub.
          </h1>
          <p className="mt-4 text-lg text-night/70">
            Subscribe monthly or annually to unlock workshops, expeditions, 1:1 support, and the friendliest community of cat nerds.
          </p>
        </div>
        <div className="mt-16">
          <PricingTable />
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[{
            title: 'Live video talks',
            description:
              'Zoom broadcasts with researchers, photographers, and conservationists. Submit questions in advance and watch replays.'
          },
          {
            title: 'Interactive archive',
            description:
              'Mark sessions as watched, comment with the community, and get personalized suggestions based on your interests.'
          },
          {
            title: 'Member perks',
            description:
              'Invite a friend for one month free, access merch drops, and claim partner discounts on gear and travel.'
          }].map((item) => (
            <div key={item.title} className="rounded-3xl border border-night/10 bg-[#F5F1E3]/60 p-6">
              <h3 className="text-lg font-semibold text-night">{item.title}</h3>
              <p className="mt-3 text-sm text-night/70">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
      </div>
    </>
  );
}
