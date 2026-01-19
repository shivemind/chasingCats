import { PrismaClient } from '@prisma/client';

const datasourceUrl = process.env.DATABASE_URL ?? 'file:./dev.db';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Falling back to file:./dev.db.');
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: { db: { url: datasourceUrl } }
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
