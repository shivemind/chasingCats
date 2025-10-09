import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';

if (!process.env.NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is required in production.');
  }

  process.env.NEXTAUTH_SECRET = 'development-secret';
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user?.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);

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
        session.user.membershipStatus = token.membershipStatus as string | undefined;
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
