'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ManageSubscriptionButtonProps {
  hasStripeCustomer?: boolean;
}

export function ManageSubscriptionButton({ hasStripeCustomer = false }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      // If no Stripe customer exists, redirect to checkout instead
      if (!hasStripeCustomer) {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'monthly' })
        });

        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error ?? 'Unable to start checkout');
        }

        const { url } = await response.json();
        window.location.href = url;
        return;
      }

      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Unable to open billing portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = hasStripeCustomer ? 'Manage subscription' : 'Subscribe now';

  return (
    <div className="mt-6 space-y-2">
      <Button type="button" onClick={handleClick} disabled={loading}>
        {loading ? 'Loading…' : buttonText}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
