import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { submitEntry, getUserEntry } from '@/lib/challenges';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, title, caption, imageUrl } = body;

    if (!challengeId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has an entry
    const existingEntry = await getUserEntry(challengeId, session.user.id);
    if (existingEntry) {
      return NextResponse.json(
        { error: 'You have already submitted an entry for this challenge' },
        { status: 400 }
      );
    }

    const entry = await submitEntry({
      challengeId,
      userId: session.user.id,
      imageUrl,
      title: title || undefined,
      caption: caption || undefined
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Submit entry error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to submit entry' },
      { status: 500 }
    );
  }
}
