import Link from 'next/link';

interface PaywallProps {
  isLoggedIn: boolean;
  contentTitle: string;
}

export function Paywall({ isLoggedIn, contentTitle }: PaywallProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-night/10 bg-gradient-to-br from-[#F5F1E3] to-white p-8 md:p-12">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cat-eye/10 blur-3xl" />
      
      <div className="relative max-w-lg mx-auto text-center">
        {/* Lock icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-cat-eye shadow-lg">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-night md:text-3xl">
          This content is for members
        </h2>
        
        <p className="mt-4 text-night/70">
          &ldquo;{contentTitle}&rdquo; is part of our premium library. 
          {isLoggedIn 
            ? ' Subscribe to unlock full access to all videos, talks, and resources.'
            : ' Create an account and subscribe to unlock full access.'}
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          {isLoggedIn ? (
            <Link
              href="/join"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-cat-eye px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              View Plans
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-cat-eye px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Create Account
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-night/20 bg-white px-8 py-4 text-sm font-semibold text-night transition hover:bg-night/5"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Benefits list */}
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          {[
            { icon: '🎥', text: 'Full video library access' },
            { icon: '🎤', text: 'Live talks with experts' },
            { icon: '❓', text: 'Ask questions directly' },
            { icon: '🌍', text: 'Field guides & resources' },
          ].map((benefit) => (
            <div key={benefit.text} className="flex items-center gap-3 rounded-xl bg-white/60 p-3">
              <span className="text-xl">{benefit.icon}</span>
              <span className="text-sm font-medium text-night/80">{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
