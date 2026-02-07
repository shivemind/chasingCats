'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' })
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/account';
  const [error, setError] = useState<string | null>(null);
  const justRegistered = searchParams.get('registered');

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    const response = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password
    });

    if (response?.error) {
      setError('Invalid email or password.');
      return;
    }

    // Use hard redirect to ensure session cookie is properly read
    window.location.href = callbackUrl;
  };

  return (
    <div className="container-section flex min-h-[calc(100vh-8rem)] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-night/10 bg-white p-10 shadow-card">
        <h1 className="text-2xl font-semibold text-night">Welcome back</h1>
        <p className="mt-2 text-sm text-night/70">Sign in to access courses, live talks, and the community.</p>
        {justRegistered ? (
          <div className="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-brand-dark">
            Account created! Sign in with your new credentials.
          </div>
        ) : null}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-night">
              Email
            </label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} className="mt-2" />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold text-night">
              Password
            </label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} className="mt-2" />
            {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-night/70">
          Not a member yet?{' '}
          <Link href="/join" className="font-semibold text-brand hover:text-brand-dark">
            Join the club
          </Link>
        </p>
      </div>
    </div>
  );
}
