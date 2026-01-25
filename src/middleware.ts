import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal cookie gate for NextAuth/Auth.js v5.
// Keeps middleware bundle tiny (no next-auth imports).
export function middleware(req: NextRequest) {
  const cookies = req.cookies;

  // Common v5 cookie names (depending on HTTPS / secure context)
  const hasSession =
    cookies.has("__Secure-authjs.session-token") ||
    cookies.has("authjs.session-token") ||
    // Fallbacks (occasionally seen depending on config)
    cookies.has("__Secure-next-auth.session-token") ||
    cookies.has("next-auth.session-token");

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set(
      "callbackUrl",
      `${req.nextUrl.pathname}${req.nextUrl.search}`
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/profile/:path*", "/watch/:path*", "/ask/:path*"],
};
