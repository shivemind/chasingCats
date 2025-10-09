import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { SubscriptionStatus } from '@prisma/client';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(2)
});

export async function POST(request: Request) {
  const data = await request.json();
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const { name, email, password, username } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      profile: {
        create: {
          username
        }
      },
      memberships: {
        create: { status: SubscriptionStatus.INCOMPLETE }
      }
    }
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
