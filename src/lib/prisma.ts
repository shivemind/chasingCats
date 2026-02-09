import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const datasourceUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error('PRISMA_DATABASE_URL or DATABASE_URL is required to initialize Prisma');
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: { db: { url: datasourceUrl } },
  }).$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
