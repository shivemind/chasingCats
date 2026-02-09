import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Check if Accelerate URL has a valid API key (not a placeholder)
const accelerateUrl = process.env.PRISMA_DATABASE_URL;
const hasValidAccelerateKey = accelerateUrl && 
  !accelerateUrl.includes('YOUR_API_KEY') && 
  accelerateUrl.includes('accelerate.prisma-data.net');

// Use Accelerate URL only if valid, otherwise fall back to direct DATABASE_URL
const datasourceUrl = hasValidAccelerateKey 
  ? accelerateUrl 
  : process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error('DATABASE_URL is required to initialize Prisma');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: ['error', 'warn'],
    datasources: { db: { url: datasourceUrl } },
  });
  
  // Only use Accelerate extension when using Accelerate URL
  // Cast back to PrismaClient for consistent typing across the codebase
  if (hasValidAccelerateKey) {
    return client.$extends(withAccelerate()) as unknown as PrismaClient;
  }
  
  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
