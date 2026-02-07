import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// In production, this would interact with the database
// For now, we use a simple in-memory store (resets on server restart)
const progressStore = new Map<string, Record<string, {
  progress: number;
  lastPosition: number;
  completedAt?: string;
  updatedAt: string;
}>>();

export async function GET(
  request: Request,
  context: { params: Promise<{ contentId: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ progress: null });
  }

  const { contentId } = await context.params;
  const userProgress = progressStore.get(session.user.id);
  const progress = userProgress?.[contentId];

  return NextResponse.json({ 
    progress: progress ? {
      contentId,
      ...progress,
    } : null 
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ contentId: string }> }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { contentId } = await context.params;
    const body = await request.json();
    const { progress, lastPosition, completedAt } = body;

    // Get or create user's progress store
    let userProgress = progressStore.get(session.user.id);
    if (!userProgress) {
      userProgress = {};
      progressStore.set(session.user.id, userProgress);
    }

    // Update progress
    userProgress[contentId] = {
      progress,
      lastPosition,
      completedAt,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true,
      progress: {
        contentId,
        ...userProgress[contentId],
      }
    });
  } catch (error) {
    console.error('Failed to save progress:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

// Get all progress for a user (for Continue Watching section)
export async function getAllProgress(userId: string) {
  return progressStore.get(userId) || {};
}
