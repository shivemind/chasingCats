import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getPassExpiryEmail } from '@/lib/email';

/**
 * Cron job to check for expiring educational passes
 * Run daily via Vercel Cron or similar scheduler
 * 
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-expiring-passes",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find passes expiring in the next 24-48 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const expiringMemberships = await prisma.membership.findMany({
      where: {
        educationalPassExpiry: {
          gte: tomorrow,
          lt: dayAfter,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`Found ${expiringMemberships.length} expiring educational passes`);

    let sent = 0;
    let failed = 0;

    for (const membership of expiringMemberships) {
      if (!membership.user.email || !membership.educationalPassExpiry) continue;

      const emailContent = getPassExpiryEmail(
        membership.user.name || '',
        membership.educationalPassExpiry
      );

      const success = await sendEmail({
        ...emailContent,
        to: membership.user.email,
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      checked: expiringMemberships.length,
      emailsSent: sent,
      emailsFailed: failed,
    });
  } catch (error) {
    console.error('Error checking expiring passes:', error);
    return NextResponse.json(
      { error: 'Failed to check expiring passes' },
      { status: 500 }
    );
  }
}
