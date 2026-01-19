import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const watchSchema = z.object({
  contentId: z.string(),
  watched: z.boolean()
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = watchSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const watch = await prisma.watchStatus.upsert({
    where: {
      userId_contentId: {
        userId: session.user.id,
        contentId: parsed.data.contentId
      }
    },
    update: {
      watched: parsed.data.watched
    },
    create: {
      userId: session.user.id,
      contentId: parsed.data.contentId,
      watched: parsed.data.watched
    }
  });

  return NextResponse.json({ id: watch.id });
}
