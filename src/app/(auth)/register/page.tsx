'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const router = useRouter();
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

      const target = redirect ? `/login?registered=1&callbackUrl=${encodeURIComponent(redirect)}` : '/login?registered=1';
      router.push(target);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="container-section flex min-h-[calc(100vh-8rem)] items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-3xl border border-night/10 bg-white p-10 shadow-card">
        <h1 className="text-2xl font-semibold text-night">Create your account</h1>
        <p className="mt-2 text-sm text-night/70">Access the entire archive, live talks, and expert Q&amp;As.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="text-sm font-semibold text-night">
                Full name
              </label>
              <Input id="name" autoComplete="name" {...register('name')} className="mt-2" />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
            </div>
            <div>
              <label htmlFor="username" className="text-sm font-semibold text-night">
                Username
              </label>
              <Input id="username" autoComplete="username" {...register('username')} className="mt-2" />
              {errors.username ? <p className="mt-1 text-xs text-red-600">{errors.username.message}</p> : null}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-night">
              Email
            </label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} className="mt-2" />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-night">
                Password
              </label>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} className="mt-2" />
              {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-night">
                Confirm password
              </label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} className="mt-2" />
              {errors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p> : null}
            </div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} fullWidth>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-night/70">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
