# Chasing Cats Club

Subscription-based education platform for wildlife photographers and conservationists run by Rachel and Sebastian. Built with Next.js App Router, Prisma, and Stripe subscriptions.

## Features

- Marketing landing page with hero, carousel, and storytelling sections inspired by the provided wireframes.
- Protected member areas for course archive, live talk listings, AMA prompts, and personal account management.
- Email/password authentication with NextAuth credentials provider and Prisma (SQLite by default).
- Stripe integration for monthly and annual subscriptions (no free trial) with billing portal access.
- AMA submission flow, profile editor, and watchlist tracking for member content.
- Seed script that bootstraps baseline users, categories, and rich sample content.

## Tech stack

- [Next.js 15 App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Prisma ORM](https://www.prisma.io/) with SQLite (swap to Postgres/MySQL for production)
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Stripe](https://stripe.com) for billing

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Copy `.env.example` to `.env.local` and fill in values:
   ```bash
   cp .env.example .env.local
   ```
   - Generate `NEXTAUTH_SECRET` (use `openssl rand -base64 32`).
   - Create Stripe prices for `$15/month` and `$150/year` and paste their IDs.
   - Update success/cancel URLs for your deployment (defaults work locally).

3. **Provision the database**
   ```bash
   npx prisma db push
   npx prisma generate
   npx prisma db seed
   ```
   The seed creates a demo member (`member@chasingcats.club` / `password123`) and example content.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000).

5. **Stripe webhooks (optional)**
   - Install the Stripe CLI and run `stripe listen --events checkout.session.completed,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook`.
   - Set `STRIPE_WEBHOOK_SECRET` to the signing secret from the CLI output.

## Deploying to Vercel

1. Create a new Vercel project and import this repository.
2. Add all environment variables from `.env.local` into the Vercel dashboard (including `DATABASE_URL`, `NEXTAUTH_SECRET`, Stripe keys, price IDs, and webhook secret).
3. If you use a production database, update `DATABASE_URL` accordingly and run `npx prisma migrate deploy` via a build hook or Vercel build command.

## Testing checklist

- `npm run lint` – linting with Next.js/ESLint configuration.
- Stripe checkout buttons require valid environment variables. Without them, API routes respond with configuration errors.

## Project structure highlights

```
├─ prisma/                 # Prisma schema and seed
├─ src/
│  ├─ app/                # App Router routes (marketing + authenticated)
│  ├─ components/         # Reusable UI + feature components
│  ├─ lib/                # Prisma client, auth config, Stripe helper
│  └─ types/              # NextAuth module augmentation
└─ public/images/         # Illustrative SVG assets for hero/content tiles
```

## Account credentials

- **Demo member**: `member@chasingcats.club` / `password123`
- After subscribing via Stripe, membership status updates automatically via webhook (requires Stripe CLI in development).

## Notes

- Tailwind CSS 4 syntax is used (`@import 'tailwindcss'` in `globals.css`).
- Replace placeholder product links and upload URLs before launch.
- For production, configure an object storage bucket for member photo uploads and set `UPLOAD_BASE_URL` accordingly.
