import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";

    // Preserve full path + query so NextAuth returns you where you intended.
    url.searchParams.set(
      "callbackUrl",
      `${req.nextUrl.pathname}${req.nextUrl.search}`
    );

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only protect authenticated / member areas.
export const config = {
  matcher: ["/account/:path*", "/profile/:path*", "/watch/:path*", "/ask/:path*"],
};
