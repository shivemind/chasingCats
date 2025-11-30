import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: `Webhook error: ${(error as Error).message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = session.subscription as string | null;
    const customerId = session.customer as string | null;
    const userId = session.metadata?.userId ?? session.client_reference_id ?? null;

    if (userId && customerId) {
      let currentPeriodEnd: Date | undefined;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        let invoiceId: string | undefined;
        const latestInvoice = subscription.latest_invoice;
        if (typeof latestInvoice === 'string') {
          invoiceId = latestInvoice;
        } else if (latestInvoice) {
          invoiceId = latestInvoice.id;
        }

        if (invoiceId) {
          const invoice = await stripe.invoices.retrieve(invoiceId);
          const firstLine = invoice.lines?.data?.[0];
          const periodEnd = firstLine?.period?.end ?? invoice.period_end;

          if (typeof periodEnd === 'number') {
            currentPeriodEnd = new Date(periodEnd * 1000);
          }
        }
      }

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
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;

    await prisma.membership.updateMany({
      where: { stripeSubscription: subscription.id },
      data: { status: 'CANCELED' }
    });
  }

  return NextResponse.json({ received: true });
}
