import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { claimMissionReward } from '@/lib/gamification';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await claimMissionReward(session.user.id, id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to claim mission:', error);
    return NextResponse.json({ error: 'Failed to claim mission' }, { status: 500 });
  }
}
