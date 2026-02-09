import { prisma } from './prisma';

export type AccessStatus = {
  hasAccess: boolean;
  reason: 'active_subscription' | 'educational_pass' | 'admin' | 'no_access' | 'not_logged_in';
  educationalPassExpiry?: Date | null;
};

/**
 * Check if a user has access to premium content.
 * Access is granted if:
 * - User is an admin
 * - User has an ACTIVE subscription
 * - User has a valid educational pass (not expired)
 */
export async function checkContentAccess(userId: string | undefined): Promise<AccessStatus> {
  if (!userId) {
    return { hasAccess: false, reason: 'not_logged_in' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!user) {
    return { hasAccess: false, reason: 'not_logged_in' };
  }

  // Admins always have access
  if (user.role === 'ADMIN') {
    return { hasAccess: true, reason: 'admin' };
  }

  // Get the user's latest membership
  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      status: true,
      educationalPassExpiry: true
    }
  });

  if (!membership) {
    return { hasAccess: false, reason: 'no_access' };
  }

  // Check for valid educational pass
  if (membership.educationalPassExpiry && new Date(membership.educationalPassExpiry) > new Date()) {
    return { 
      hasAccess: true, 
      reason: 'educational_pass',
      educationalPassExpiry: membership.educationalPassExpiry
    };
  }

  // Check for active subscription
  if (membership.status === 'ACTIVE') {
    return { hasAccess: true, reason: 'active_subscription' };
  }

  return { hasAccess: false, reason: 'no_access' };
}
