import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

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
    const newPriceId = priceMap[normalizedPlan];

    if (!newPriceId) {
      console.error('Missing Stripe price ID for plan:', normalizedPlan);
      return NextResponse.json(
        { error: 'Billing plan not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Get user's current membership
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!membership?.stripeSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found. Please create a new subscription.' },
        { status: 404 }
      );
    }

    // Retrieve current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(membership.stripeSubscription);

    if (!subscription || subscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Your subscription has been canceled. Please create a new subscription.' },
        { status: 400 }
      );
    }

    // Get the current subscription item
    const subscriptionItemId = subscription.items.data[0]?.id;
    const currentPriceId = subscription.items.data[0]?.price.id;

    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: 'Could not find subscription item. Please contact support.' },
        { status: 500 }
      );
    }

    // Check if trying to change to the same plan
    if (currentPriceId === newPriceId) {
      return NextResponse.json(
        { error: 'You are already subscribed to this plan.' },
        { status: 400 }
      );
    }

    // Update the subscription with proration
    await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscriptionItemId,
          price: newPriceId
        }
      ],
      proration_behavior: 'create_prorations',
      metadata: {
        userId: session.user.id,
        plan: normalizedPlan
      }
    });

    // Retrieve the updated subscription to get current period end
    const updatedSub = await stripe.subscriptions.retrieve(subscription.id);
    // @ts-expect-error - Stripe SDK type definitions don't include current_period_end but it exists
    const currentPeriodEndTimestamp: number = updatedSub.current_period_end ?? Math.floor(Date.now() / 1000);

    // Update membership in database
    const newPlan = normalizedPlan === 'annual' ? 'ANNUAL' : 'MONTHLY';
    const currentPeriodEnd = new Date(currentPeriodEndTimestamp * 1000);

    await prisma.membership.update({
      where: { id: membership.id },
      data: {
        plan: newPlan,
        currentPeriodEnd
      }
    });

    console.log('Plan changed successfully:', {
      userId: session.user.id,
      subscriptionId: subscription.id,
      oldPlan: currentPriceId,
      newPlan: newPriceId
    });

    return NextResponse.json({
      success: true,
      plan: newPlan,
      currentPeriodEnd: currentPeriodEnd.toISOString()
    });
  } catch (error) {
    console.error('Stripe plan change error:', error);

    // Handle Stripe-specific errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as { type: string; message?: string };

      if (stripeError.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { error: 'Invalid plan change request. Please try again or contact support.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to change plan. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
