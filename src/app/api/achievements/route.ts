import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Mock user achievements - in production, these would come from the database
function getUserAchievements(userId: string) {
  // Demo achievements
  const achievements = [
    {
      badgeId: 'first_video' as const,
      earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    },
    {
      badgeId: 'first_event' as const,
      earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
    {
      badgeId: 'early_bird' as const,
      earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
  ];

  // In-progress achievements
  const progress = {
    binge_watcher: 30, // 30% - watched 3/10 videos
    event_regular: 40, // 40% - attended 2/5 events
    dedicated_learner: 6, // 6% - watched 3/50 videos
  };

  return { achievements, progress };
}

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ achievements: [], progress: {} });
  }

  const data = getUserAchievements(session.user.id);
  
  return NextResponse.json(data);
}

// Award a new badge
export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { badgeId } = await request.json();
    
    // In production, validate and save to database
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      badge: {
        badgeId,
        earnedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to award badge' }, { status: 500 });
  }
}
