import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDigestPreference, updateDigestPreference, type DigestFrequency } from '@/lib/digest';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preference = await getDigestPreference(session.user.id);

    // Return default preferences if none exist
    if (!preference) {
      return NextResponse.json({
        frequency: 'WEEKLY',
        includeNewContent: true,
        includeChallenges: true,
        includeTips: true
      });
    }

    return NextResponse.json(preference);
  } catch (error) {
    console.error('Get digest preference error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { frequency, includeNewContent, includeChallenges, includeTips } = body;

    // Validate frequency
    const validFrequencies: DigestFrequency[] = ['WEEKLY', 'DAILY', 'NONE'];
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency' },
        { status: 400 }
      );
    }

    const preference = await updateDigestPreference(session.user.id, {
      frequency,
      includeNewContent,
      includeChallenges,
      includeTips
    });

    return NextResponse.json(preference);
  } catch (error) {
    console.error('Update digest preference error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
