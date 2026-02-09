import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStreakData, updateStreak, STREAK_REWARDS } from '@/lib/gamification';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const streakData = await getStreakData(session.user.id);
    
    // Add streak rewards with claimed status
    const streakRewards = STREAK_REWARDS.map(r => ({
      days: r.days,
      reward: r.reward,
      claimed: streakData.currentStreak >= r.days // Simplified - in production track claimed rewards
    }));

    return NextResponse.json({
      ...streakData,
      streakRewards
    });
  } catch (error) {
    console.error('Failed to get streak:', error);
    return NextResponse.json({ error: 'Failed to get streak' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await updateStreak(session.user.id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update streak:', error);
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
  }
}
