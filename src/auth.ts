import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

/**
 * Extend the JWT/session shape with your app-specific fields.
 * (No `any`, and keeps ESLint happy.)
 */
type AppJWT = JWT & {
  id?: string;
  role?: string;
  membershipStatus?: string | null;
};

type AppSession = Session & {
  user?: Session["user"] & {
    id?: string;
    role?: string;
    membershipStatus?: string | null;
  };
};

if (!process.env.NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET is required in production.");
  }
  process.env.NEXTAUTH_SECRET = "development-secret";
}

/**
 * IMPORTANT:
 * Do NOT hardcode localhost in production. In Vercel, NEXTAUTH_URL should be set in env.
 * Only default it in development to avoid signOut redirecting to localhost.
 */
if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV !== "production") {
  process.env.NEXTAUTH_URL = "http://localhost:3000";
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
        // Strict runtime validation so TS knows these are strings.
        const email =
          typeof credentials?.email === "string" ? credentials.email : null;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : null;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async session({
      token,
      session,
    }: {
      token: JWT;
      session: Session;
    }): Promise<AppSession> {
      const t = token as AppJWT;
      const s = session as AppSession;

      if (s.user) {
        if (typeof t.id === "string") s.user.id = t.id;
        if (typeof t.role === "string") s.user.role = t.role;
        s.user.membershipStatus =
          typeof t.membershipStatus === "string" || t.membershipStatus === null
            ? t.membershipStatus
            : undefined;
      }

      return s;
    },

    async jwt({ token, user, trigger }) {
      const t = token as AppJWT;

      // Only fetch from DB on initial sign-in or explicit refresh
      // This prevents slow DB queries on every request
      if (user) {
        // Initial sign-in - user object is passed from authorize()
        t.id = user.id;
        t.email = user.email ?? undefined;
        
        // Fetch membership status only on initial login
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            memberships: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });
        
        if (dbUser) {
          t.role = dbUser.role;
          t.membershipStatus = dbUser.memberships[0]?.status ?? null;
        }
      } else if (trigger === "update") {
        // Session update requested - refresh membership status
        if (t.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: t.id },
            include: {
              memberships: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          });
          
          if (dbUser) {
            t.role = dbUser.role;
            t.membershipStatus = dbUser.memberships[0]?.status ?? null;
          }
        }
      }
      // On subsequent requests, token already has the data - no DB query needed

      return t;
    },
  },
});
