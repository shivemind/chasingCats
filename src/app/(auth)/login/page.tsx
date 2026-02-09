'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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

    // Check if user is admin and redirect accordingly
    try {
      const roleRes = await fetch('/api/auth/role');
      if (roleRes.ok) {
        const { role } = await roleRes.json();
        if (role === 'ADMIN') {
          window.location.href = '/admin';
          return;
        }
      }
    } catch {
      // If role check fails, use default redirect
    }

    // Use hard redirect to ensure session cookie is properly read
    window.location.href = callbackUrl;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-deep-space via-midnight to-night px-4 py-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-neon-cyan/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-neon-purple/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cat-eye/5 blur-3xl animate-pulse" />
      </div>

      {/* Cat eyes decoration */}
      <div className="absolute top-20 left-10 flex gap-3 opacity-20">
        <div className="h-4 w-2 rounded-full bg-cat-eye shadow-glow-cat-eye" />
        <div className="h-4 w-2 rounded-full bg-cat-eye shadow-glow-cat-eye" />
      </div>
      <div className="absolute bottom-20 right-10 flex gap-3 opacity-20">
        <div className="h-4 w-2 rounded-full bg-cat-eye-green shadow-glow" />
        <div className="h-4 w-2 rounded-full bg-cat-eye-green shadow-glow" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Glowing border card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-xl">
          {/* Header with cat icon */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 shadow-glow">
              <svg className="h-8 w-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-white/60">Sign in to access courses, live talks, and the community.</p>
          </div>

          {justRegistered ? (
            <div className="mb-6 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-3 text-sm text-neon-cyan">
              ✓ Account created! Sign in with your new credentials.
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-white/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 transition focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                placeholder="you@example.com"
              />
              {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-white/70">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 transition focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                placeholder="••••••••"
              />
              {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-xs text-white/50 hover:text-neon-cyan">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-neon-cyan to-brand px-6 py-3.5 text-sm font-semibold text-night shadow-glow transition hover:shadow-glow-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-center text-sm text-white/50">
              Not a member yet?{' '}
              <Link href="/join" className="font-semibold text-neon-cyan transition hover:text-white">
                Join the club →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
