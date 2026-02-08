import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to get subscription period end
async function getSubscriptionPeriodEnd(subscriptionId: string): Promise<Date | undefined> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    // @ts-expect-error - Stripe SDK type definitions don't include current_period_end but it exists
    const currentPeriodEnd: number | undefined = subscription.current_period_end;
    return currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined;
  } catch (error) {
    console.error('Error retrieving subscription period:', error);
    return undefined;
  }
}

// Helper function to determine subscription plan from price ID
function getPlanFromPriceId(priceId: string): 'MONTHLY' | 'ANNUAL' {
  if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID) {
    return 'ANNUAL';
  }
  return 'MONTHLY';
}

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error('Webhook signature or secret missing');
    return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: `Webhook error: ${(error as Error).message}` }, { status: 400 });
  }

  console.log('Received Stripe webhook:', event.type);

  try {
    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string | null;
      const customerId = session.customer as string | null;
      const userId = session.metadata?.userId ?? session.client_reference_id ?? null;

      console.log('Processing checkout.session.completed:', { userId, customerId, subscriptionId });

      if (userId && customerId) {
        const currentPeriodEnd = subscriptionId
          ? await getSubscriptionPeriodEnd(subscriptionId)
          : undefined;

        const plan = session.metadata?.plan === 'annual' ? 'ANNUAL' : 'MONTHLY';

        await prisma.membership.upsert({
          where: { stripeCustomerId: customerId },
          update: {
            userId,
            stripeSubscription: subscriptionId ?? undefined,
            status: 'ACTIVE',
            plan,
            currentPeriodEnd
          },
          create: {
            userId,
            stripeCustomerId: customerId,
            stripeSubscription: subscriptionId ?? undefined,
            status: 'ACTIVE',
            plan,
            currentPeriodEnd
          }
        });

        console.log('Membership activated for user:', userId);
      }
    }

    // Handle subscription updates (plan changes, renewals, etc.)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;
      // @ts-expect-error - Stripe SDK type definitions don't include current_period_end but it exists
      const currentPeriodEndTimestamp: number = subscription.current_period_end ?? Math.floor(Date.now() / 1000);
      const currentPeriodEnd = new Date(currentPeriodEndTimestamp * 1000);

      // Determine plan from price ID
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? getPlanFromPriceId(priceId) : 'MONTHLY';

      // Map Stripe status to our status
      let membershipStatus: 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'PAST_DUE' | 'TRIALING' = 'ACTIVE';
      if (status === 'canceled') membershipStatus = 'CANCELED';
      else if (status === 'incomplete' || status === 'incomplete_expired') membershipStatus = 'INCOMPLETE';
      else if (status === 'past_due') membershipStatus = 'PAST_DUE';
      else if (status === 'trialing') membershipStatus = 'TRIALING';

      console.log('Updating subscription:', { customerId, status: membershipStatus, plan });

      await prisma.membership.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscription: subscription.id,
          status: membershipStatus,
          plan,
          currentPeriodEnd
        }
      });
    }

    // Handle subscription deletion/cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;

      console.log('Subscription deleted:', subscription.id);

      // @ts-expect-error - Stripe SDK type definitions don't include current_period_end but it exists
      const currentPeriodEndTimestamp: number = subscription.current_period_end ?? Math.floor(Date.now() / 1000);

      await prisma.membership.updateMany({
        where: { stripeSubscription: subscription.id },
        data: {
          status: 'CANCELED',
          currentPeriodEnd: new Date(currentPeriodEndTimestamp * 1000)
        }
      });
    }

    // Handle successful payment
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      // @ts-expect-error - Stripe SDK type definitions don't include subscription but it exists
      const subscriptionId: string | null = invoice.subscription ?? null;
      const customerId = invoice.customer as string;

      console.log('Payment succeeded:', { customerId, subscriptionId });

      if (subscriptionId) {
        const currentPeriodEnd = await getSubscriptionPeriodEnd(subscriptionId);

        await prisma.membership.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: 'ACTIVE',
            currentPeriodEnd
          }
        });
      }
    }

    // Handle failed payment
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      console.log('Payment failed:', { customerId });

      await prisma.membership.updateMany({
        where: { stripeCustomerId: customerId },
        data: { status: 'PAST_DUE' }
      });

      // TODO: Send email notification to user about failed payment
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
