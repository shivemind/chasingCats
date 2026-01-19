import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!process.env.NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
    throw new Error('NEXTAUTH_SECRET is required in production.');
  }

  process.env.NEXTAUTH_SECRET = 'development-secret';
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
}

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user?.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.hashedPassword);

        if (!isValid) {
          return null;
        }

        return user;
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.membershipStatus = token.membershipStatus as string | null | undefined;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.email) {
        return token;
      }

      const user = await prisma.user.findUnique({
        where: { email: token.email },
        include: {
          memberships: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.membershipStatus = user.memberships[0]?.status ?? null;
      }

      return token;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
