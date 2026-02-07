'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Name is required' }),
    email: z.string().email({ message: 'Valid email required' }),
    password: z.string().min(8, { message: 'Password must be 8+ characters' }),
    confirmPassword: z.string().min(8),
    username: z.string().min(2, { message: 'Username required' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword']
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          username: values.username
        })
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Unable to register');
      }

      // Auto sign-in immediately after registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password
      });

      if (signInResult?.error) {
        // If auto sign-in fails, redirect to login page
        const target = redirect ? `/login?registered=1&callbackUrl=${encodeURIComponent(redirect)}` : '/login?registered=1';
        window.location.href = target;
        return;
      }

      // Successfully signed in - use hard redirect to ensure session cookie is read
      // This avoids the issue where Next.js client-side navigation doesn't pick up the new session
      window.location.href = redirect ?? '/account';
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-deep-space via-midnight to-night px-4 py-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-neon-purple/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-neon-cyan/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-cat-eye/5 blur-3xl animate-pulse" />
      </div>

      {/* Cat eyes decoration */}
      <div className="absolute top-32 right-20 flex gap-3 opacity-15">
        <div className="h-5 w-2.5 rounded-full bg-cat-eye shadow-glow-cat-eye" />
        <div className="h-5 w-2.5 rounded-full bg-cat-eye shadow-glow-cat-eye" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 shadow-glow-purple">
              <svg className="h-8 w-8 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Join the pride</h1>
            <p className="mt-2 text-sm text-white/60">Access the entire archive, live talks, and expert Q&amp;As.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-white/70">Full name</label>
                <input
                  id="name"
                  autoComplete="name"
                  {...register('name')}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 transition focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                  placeholder="Jane Smith"
                />
                {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
              </div>
              <div>
                <label htmlFor="username" className="text-sm font-medium text-white/70">Username</label>
                <input
                  id="username"
                  autoComplete="username"
                  {...register('username')}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 transition focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                  placeholder="wildcatlover"
                />
                {errors.username ? <p className="mt-1 text-xs text-red-400">{errors.username.message}</p> : null}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-white/70">Email</label>
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

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="password" className="text-sm font-medium text-white/70">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 transition focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                  placeholder="••••••••"
                />
                {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-white/70">Confirm</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 transition focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan"
                  placeholder="••••••••"
                />
                {errors.confirmPassword ? <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p> : null}
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
              className="w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan px-6 py-3.5 text-sm font-semibold text-night shadow-glow-purple transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-center text-sm text-white/50">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-neon-cyan transition hover:text-white">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
