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

    async jwt({ token }: { token: JWT }): Promise<JWT> {
      const t = token as AppJWT;

      // NextAuth sets email as string | null | undefined depending on provider/session state.
      const email = typeof t.email === "string" ? t.email : null;
      if (!email) return t;

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
        t.id = user.id;
        t.role = user.role;
        t.membershipStatus = user.memberships[0]?.status ?? null;
      }

      return t;
    },
  },
});
