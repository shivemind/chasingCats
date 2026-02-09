import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserMissions } from '@/lib/gamification';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const missions = await getUserMissions(session.user.id);
    
    return NextResponse.json({ missions });
  } catch (error) {
    console.error('Failed to get missions:', error);
    return NextResponse.json({ error: 'Failed to get missions' }, { status: 500 });
  }
}
