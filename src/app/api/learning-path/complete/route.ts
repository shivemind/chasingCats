import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { markPathItemComplete } from '@/lib/learning-path';
import { updateMissionProgress } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentId } = await request.json();
    
    if (!contentId) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    const path = await markPathItemComplete(session.user.id, contentId);
    
    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    // Update mission progress for learning path completion
    await updateMissionProgress(session.user.id, 'complete_path', 1);

    return NextResponse.json({ 
      success: true,
      completed: path.completed,
      totalItems: path.totalItems,
      progress: (path.completed / path.totalItems) * 100
    });
  } catch (error) {
    console.error('Failed to mark item complete:', error);
    return NextResponse.json({ error: 'Failed to mark complete' }, { status: 500 });
  }
}
