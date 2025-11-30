import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

const datasourceUrl = process.env.DATABASE_URL ?? 'file:./dev.db';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = datasourceUrl;
}

let hasPreparedDatabase = false;

const maybePrepareSqlite = () => {
  if (hasPreparedDatabase) return;
  hasPreparedDatabase = true;

  if (process.env.NODE_ENV === 'production') return;
  if (!datasourceUrl.startsWith('file:')) return;

  const sqlitePath = datasourceUrl.replace(/^file:/, '');
  const absolutePath = resolve(process.cwd(), sqlitePath);

  if (existsSync(absolutePath)) return;

  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    execSync('npx prisma db seed', { stdio: 'inherit' });
  } catch (error) {
    console.warn(
      '⚠️  Failed to prepare the local SQLite database automatically. Run `npx prisma db push && npx prisma db seed` manually.',
      error
    );
  }
};

maybePrepareSqlite();

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
