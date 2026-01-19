import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  username: z.string().min(2),
  bio: z.string().optional(),
  location: z.string().optional(),
  favoriteCat: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
  }

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: {
      userId: session.user.id,
      ...parsed.data
    }
  });

  return NextResponse.json({ id: profile.id });
}
