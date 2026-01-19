// middleware.ts

export { auth as middleware } from 'next-auth/middleware';

// Only protect authenticated / member areas.
// Everything else should be public.
export const config = {
  matcher: [
    '/account/:path*',
    '/profile/:path*',
    '/watch/:path*',
    '/ask/:path*',
  ]
};
