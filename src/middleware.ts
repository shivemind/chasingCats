// src/middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/account/:path*", "/profile/:path*", "/watch/:path*", "/ask/:path*"],
};
