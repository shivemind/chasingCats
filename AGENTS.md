# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Subscription-based education platform for wildlife photographers and conservationists. Built with Next.js 15 App Router, Prisma (PostgreSQL), NextAuth v5, and Stripe subscriptions.

## Commands

```powershell
# Development
npm run dev              # Start dev server with Turbopack (http://localhost:3000)
npm run build            # Production build with Turbopack
npm run lint             # ESLint with Next.js rules

# Database
npx prisma db push       # Push schema changes to database
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma db seed       # Seed database with demo data
npx prisma studio        # Open Prisma database browser

# Stripe webhooks (local development)
stripe listen --events checkout.session.completed,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

## Architecture

### Authentication Flow
- NextAuth v5 with credentials provider (email/password) configured in `src/auth.ts`
- JWT strategy with custom session extensions for `id`, `role`, and `membershipStatus`
- Middleware (`src/middleware.ts`) protects routes via cookie check without importing NextAuth (keeps bundle small)
- Protected routes: `/account/*`, `/profile/*`, `/watch/*`, `/ask/*`
- Session types augmented in `src/types/next-auth.d.ts`

### Subscription/Billing
- Stripe integration in `src/lib/stripe.ts`
- Checkout flow: `src/app/api/stripe/checkout/route.ts` creates sessions with `userId` and `plan` in metadata
- Webhook handler (`src/app/api/stripe/webhook/route.ts`) processes `checkout.session.completed` and `customer.subscription.deleted` events
- Membership status stored in `Membership` model, linked to User

### Data Layer
- Prisma client singleton in `src/lib/prisma.ts` with global caching for dev hot-reload
- Key models: `User` → `Membership` (subscription), `Profile` (member info), `Content` (courses/talks/videos), `Category`, `Question` (AMA), `WatchStatus` (progress tracking)
- Content types: ARTICLE, VIDEO, TALK, COURSE, NEWS
- Skill levels: BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS

### Component Organization
- `src/components/ui/` - Primitive components (Button, Input, Textarea)
- `src/components/layout/` - Navbar, Footer
- `src/components/home/` - Landing page sections (Hero, SpotlightCarousel, Story, etc.)
- `src/components/[feature]/` - Feature-specific components (account, ask, content, join, profile)
- `src/components/providers/` - Context providers (SessionProvider)
- `src/components/shared/` - Shared components used across features (ContentCard)

### Route Structure
- `src/app/(auth)/` - Login/register pages (route group, no layout prefix)
- `src/app/(content)/[...slug]/` - Dynamic catch-all for content pages
- `src/app/api/` - API routes (auth, profile, questions, register, stripe/*, watch)
- Member-only pages: `/account`, `/profile/edit`, `/ask`
- Public pages: `/`, `/join`, `/experts`, `/field`, `/shop`, `/privacy`, `/terms`

## Environment Setup

Requires both `.env` (for Prisma CLI) and `.env.local` (for Next.js runtime) with the same values. Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, `STRIPE_WEBHOOK_SECRET`

## Conventions

- Path alias: `@/*` maps to `./src/*`
- Use `cn()` from `src/lib/utils.ts` for conditional Tailwind class merging
- Tailwind CSS 4 syntax (`@import 'tailwindcss'` in globals.css)
- Demo login: `member@chasingcats.club` / `password123`
