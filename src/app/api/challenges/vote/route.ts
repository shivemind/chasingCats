import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { voteForEntry } from '@/lib/challenges';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const vote = await voteForEntry(entryId, session.user.id);

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    console.error('Vote error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    );
  }
}
