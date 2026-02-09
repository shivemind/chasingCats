import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

const priceMap: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  annual: process.env.STRIPE_ANNUAL_PRICE_ID
};

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    let body: { plan?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { plan } = body;
    const normalizedPlan = plan === 'annual' ? 'annual' : 'monthly';
    const priceId = priceMap[normalizedPlan];

    if (!priceId) {
      console.error('Missing Stripe price ID for plan:', normalizedPlan);
      return NextResponse.json(
        { error: 'Billing plan not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const successUrl = process.env.STRIPE_SUCCESS_URL;
    const cancelUrl = process.env.STRIPE_CANCEL_URL;

    if (!successUrl || !cancelUrl) {
      console.error('Missing Stripe redirect URLs');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Check for existing active subscription
    let membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Prevent creating duplicate subscriptions
    if (membership?.status === 'ACTIVE' && membership.stripeSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Please manage it from your account page.' },
        { status: 400 }
      );
    }

    let customerId = membership?.stripeCustomerId ?? undefined;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });

      if (!user?.email) {
        return NextResponse.json(
          { error: 'Email address is required to create a subscription' },
          { status: 400 }
        );
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: {
          userId: session.user.id
        }
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
            stripeCustomerId: customerId,
            status: 'INCOMPLETE'
          }
        });
      }
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      payment_method_types: ['card'],
      customer_update: {
        address: 'auto',
        name: 'auto'
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan: normalizedPlan
        }
      },
      metadata: {
        plan: normalizedPlan,
        userId: session.user.id
      },
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    if (!checkoutSession.url) {
      throw new Error('Failed to create checkout session URL');
    }

    console.log('Checkout session created:', {
      sessionId: checkoutSession.id,
      userId: session.user.id,
      plan: normalizedPlan
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);

    // Handle Stripe-specific errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as { type: string; message?: string };

      if (stripeError.type === 'StripeCardError') {
        return NextResponse.json(
          { error: 'Your card was declined. Please try a different payment method.' },
          { status: 400 }
        );
      }

      if (stripeError.type === 'StripeInvalidRequestError') {
        const message = stripeError.message || 'Invalid payment request';
        console.error('StripeInvalidRequestError:', message);
        return NextResponse.json(
          { error: message },
          { status: 400 }
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
