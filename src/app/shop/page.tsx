import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Shop - Member Merchandise & Services',
  description: 'Exclusive merchandise, 1:1 editing sessions with Sebastian, and expedition add-ons for Chasing Cats Club members.',
  openGraph: {
    title: 'Shop | Chasing Cats Club',
    description: 'Exclusive merchandise, editing sessions, and expedition add-ons for members.',
    type: 'website',
    url: `${SITE_URL}/shop`,
  },
  alternates: {
    canonical: `${SITE_URL}/shop`,
  },
};

const products = [
  {
    title: '1:1 Editing Session with Sebastian',
    description: '60-minute screen share to review your workflow, tackle tough files, and prep for publication.',
    price: '$250',
    link: 'https://cal.com/sebastian-cat/editing-session'
  },
  {
    title: 'Camera Trap Starter Kit',
    description: 'A curated list of gear plus a private setup tutorial for capturing elusive forest cats ethically.',
    price: '$180',
    link: '#'
  },
  {
    title: 'Chasing Cats Conservation Tee',
    description: 'Organic cotton tee featuring hand-illustrated big cat line work. Profits support field partners.',
    price: '$38',
    link: '#'
  }
];

export default function ShopPage() {
  return (
    <div className="bg-white">
      <section className="container-section py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">Shop</p>
          <h1 className="mt-4 text-4xl font-semibold text-night">Member-exclusive gear, sessions, and conservation drops.</h1>
          <p className="mt-4 text-night/70">
            Stock rotates monthly—check back for merch collabs, expedition discounts, and partner perks.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <div key={product.title} className="flex h-full flex-col rounded-3xl border border-night/10 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-night">{product.title}</h3>
              <p className="mt-3 flex-1 text-sm text-night/70">{product.description}</p>
              <p className="mt-4 text-sm font-semibold text-night">{product.price}</p>
              <Link
                href={product.link}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
              >
                View details →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
