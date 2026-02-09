import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserXP } from '@/lib/gamification';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const xpData = await getUserXP(session.user.id);
    
    return NextResponse.json(xpData);
  } catch (error) {
    console.error('Failed to get XP:', error);
    return NextResponse.json({ error: 'Failed to get XP' }, { status: 500 });
  }
}
