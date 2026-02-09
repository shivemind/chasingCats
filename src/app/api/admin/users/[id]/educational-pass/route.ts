import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin();
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id: userId } = await params;

    // Calculate expiry date (2 days from now)
    const educationalPassExpiry = new Date();
    educationalPassExpiry.setDate(educationalPassExpiry.getDate() + 2);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's existing membership
    const existingMembership = await prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    let membership;

    if (existingMembership) {
      // Update existing membership with educational pass
      membership = await prisma.membership.update({
        where: { id: existingMembership.id },
        data: {
          educationalPassExpiry,
          status: 'ACTIVE'
        }
      });
    } else {
      // Create new membership with educational pass
      membership = await prisma.membership.create({
        data: {
          userId,
          educationalPassExpiry,
          status: 'ACTIVE'
        }
      });
    }

    return NextResponse.json({
      success: true,
      educationalPassExpiry: membership.educationalPassExpiry,
      message: `Educational pass granted until ${educationalPassExpiry.toLocaleDateString()}`
    });
  } catch (error) {
    console.error('Error granting educational pass:', error);
    return NextResponse.json(
      { error: 'Failed to grant educational pass' },
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

    const { id: userId } = await params;

    // Find user's membership and remove educational pass
    const membership = await prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!membership) {
      return NextResponse.json({ error: 'No membership found' }, { status: 404 });
    }

    await prisma.membership.update({
      where: { id: membership.id },
      data: { educationalPassExpiry: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking educational pass:', error);
    return NextResponse.json(
      { error: 'Failed to revoke educational pass' },
      { status: 500 }
    );
  }
}
