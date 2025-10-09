'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly Explorer',
    price: '$15',
    cadence: 'per month',
    description: 'Full access billed monthly. Cancel anytime.',
    perks: [
      'Unlimited archive streaming',
      'Monthly live talks + AMAs',
      'Field intel drops and gear guides',
      'Member forum and comment threads'
    ],
    highlight: false
  },
  {
    id: 'annual',
    name: 'Annual Expedition',
    price: '$150',
    cadence: 'per year',
    description: 'Two months free plus a 60-minute 1:1 session.',
    perks: [
      'Everything in Monthly',
      '1x 60-minute strategy call with Rachel/Sebastian',
      'Invite a friend for one month free',
      'Priority invites to photo expeditions'
    ],
    highlight: true
  }
] as const;

export function PricingTable() {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number]['id']>('monthly');
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (planId: 'monthly' | 'annual') => {
    if (!session?.user) {
      router.push('/register?redirect=/join');
      return;
    }

    setSelectedPlan(planId);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId })
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Unable to start checkout');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plans.map((plan) => {
        const isHighlight = Boolean(plan.highlight);

        return (
          <div
            key={plan.id}
            className={`rounded-3xl border ${
            isHighlight ? 'border-brand bg-white shadow-card ring-2 ring-brand/20' : 'border-night/10 bg-white'
          } p-8`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-night">{plan.name}</h3>
            {isHighlight ? (
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Most popular
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-night/70">{plan.description}</p>
          <p className="mt-6 text-4xl font-semibold text-night">
            {plan.price}
            <span className="text-base font-normal text-night/60"> {plan.cadence}</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-night/70">
            {plan.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand" aria-hidden />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            fullWidth
            className="mt-8"
            variant={isHighlight ? 'primary' : 'secondary'}
            onClick={() => handleCheckout(plan.id)}
            disabled={isLoading}
          >
            {session?.user
              ? isLoading && selectedPlan === plan.id
                ? 'Redirecting…'
                : 'Start membership'
              : 'Create an account'}
          </Button>
          {selectedPlan === plan.id && error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>
        );
      })}
    </div>
  );
}
