import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateQuestionSchema = z.object({
  answer: z.string().optional(),
  status: z.enum(['PENDING', 'ANSWERED', 'ARCHIVED']).optional()
});

async function checkAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (user?.role !== 'ADMIN') {
    return { error: 'Forbidden', status: 403 };
  }

  return { session };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const payload = await request.json();
    const parsed = updateQuestionSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const updateData: { answer?: string; status?: 'PENDING' | 'ANSWERED' | 'ARCHIVED'; answeredAt?: Date } = {};
    
    if (parsed.data.answer !== undefined) {
      updateData.answer = parsed.data.answer;
    }
    
    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status;
      // Set answeredAt when status changes to ANSWERED
      if (parsed.data.status === 'ANSWERED') {
        updateData.answeredAt = new Date();
      }
    }

    const question = await prisma.question.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;

    await prisma.question.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
