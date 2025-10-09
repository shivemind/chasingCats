import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const questionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  contentId: z.string().optional()
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = questionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors.join(', ') || 'Invalid question' }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      question: parsed.data.question,
      authorId: session.user.id,
      contentId: parsed.data.contentId
    }
  });

  return NextResponse.json({ id: question.id });
}
