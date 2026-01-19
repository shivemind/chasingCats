// src/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

/**
 * IMPORTANT:
 * - Do NOT force NEXTAUTH_URL to localhost in prod (causes signout/login callback weirdness)
 * - On Vercel, VERCEL_URL is available and changes per deployment (preview URLs)
 * - Prefer explicit NEXTAUTH_URL on Production, but safely infer from VERCEL_URL when missing
 */

const isProd = process.env.NODE_ENV === "production";

// Secret must exist in production
if (!process.env.NEXTAUTH_SECRET) {
  if (isProd) {
    throw new Error("NEXTAUTH_SECRET is required in production.");
  }
  process.env.NEXTAUTH_SECRET = "development-secret";
}

/**
 * Base URL inference (for redirect/callback correctness)
 * - If NEXTAUTH_URL is set, use it (best for Production)
 * - Else, if on Vercel, infer https://<deployment-host>
 * - Else, fall back to localhost for local dev only
 *
 * NOTE: We set it on process.env so NextAuth/Auth.js picks it up consistently.
 */
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  pages: { signIn: "/login" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // Strict runtime validation so TS (and runtime) treat these as strings
        const email =
          typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

        // NextAuth/Auth.js expects a "User" object; Prisma user is usually fine.
        return user;
      },
    }),
  ],

  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        // These token fields are added in jwt() below
        (session.user as any).id = token.id as string | undefined;
        (session.user as any).role = token.role as string | undefined;
        (session.user as any).membershipStatus = token.membershipStatus as
          | string
          | null
          | undefined;
      }
      return session;
    },

    async jwt({ token }) {
      // token.email can be string | null | undefined depending on provider/flow
      const email = typeof token.email === "string" ? token.email : null;
      if (!email) return token;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          memberships: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (user) {
        (token as any).id = user.id;
        (token as any).role = user.role;
        (token as any).membershipStatus = user.memberships[0]?.status ?? null;
      }

      return token;
    },
  },
});
