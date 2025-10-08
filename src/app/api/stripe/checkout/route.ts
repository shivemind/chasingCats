import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

const priceMap: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  annual: process.env.STRIPE_ANNUAL_PRICE_ID
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan } = await request.json();
  const normalizedPlan = plan === 'annual' ? 'annual' : 'monthly';
  const priceId = priceMap[normalizedPlan];

  if (!priceId) {
    return NextResponse.json({ error: 'Billing plan not configured' }, { status: 500 });
  }

  const successUrl = process.env.STRIPE_SUCCESS_URL;
  const cancelUrl = process.env.STRIPE_CANCEL_URL;

  if (!successUrl || !cancelUrl) {
    return NextResponse.json({ error: 'Stripe redirect URLs not configured' }, { status: 500 });
  }

  let membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  let customerId = membership?.stripeCustomerId ?? undefined;

  if (!customerId) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user?.email) {
      return NextResponse.json({ error: 'Missing email for Stripe customer' }, { status: 400 });
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined
    });

    customerId = customer.id;

    if (membership) {
      await prisma.membership.update({
        where: { id: membership.id },
        data: { stripeCustomerId: customerId }
      });
    } else {
      membership = await prisma.membership.create({
        data: {
          userId: session.user.id,
          stripeCustomerId: customerId
        }
      });
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        userId: session.user.id,
        plan: normalizedPlan
      },
      trial_settings: {
        end_behavior: { missing_payment_method: 'cancel' }
      }
    },
    metadata: { plan: normalizedPlan, userId: session.user.id },
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl
  });

  return NextResponse.json({ url: checkoutSession.url });
}
