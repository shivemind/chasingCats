import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!stripeSecretKey) {
  if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
}

export const stripe = new Stripe(stripeSecretKey ?? 'sk_test_placeholder');
