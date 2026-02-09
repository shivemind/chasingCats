import { NextRequest, NextResponse } from 'next/server';
import { 
  getDigestSubscribers, 
  getEmailProvider, 
  generateDigestContent, 
  buildDigestEmail,
  isEmailAvailable
} from '@/lib/digest';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // If no secret is configured, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV === 'development';
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if email provider is available
    if (!isEmailAvailable()) {
      return NextResponse.json(
        { error: 'Email provider not configured' },
        { status: 503 }
      );
    }

    const provider = getEmailProvider();
    if (!provider) {
      return NextResponse.json(
        { error: 'Email provider not configured' },
        { status: 503 }
      );
    }

    // Get frequency from query params (default to WEEKLY)
    const { searchParams } = new URL(request.url);
    const frequency = searchParams.get('frequency') === 'DAILY' ? 'DAILY' : 'WEEKLY';

    // Get subscribers
    const subscribers = await getDigestSubscribers(frequency);
    
    if (subscribers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No subscribers for this frequency',
        sent: 0
      });
    }

    // Generate digest content
    const content = await generateDigestContent();

    // Send to each subscriber
    const results = await Promise.allSettled(
      subscribers.map(async (sub) => {
        if (!sub.user.email) return { success: false, reason: 'No email' };

        const html = buildDigestEmail(sub.user.name || 'there', content, {
          includeNewContent: sub.includeNewContent,
          includeChallenges: sub.includeChallenges,
          includeTips: sub.includeTips
        });

        const success = await provider.send({
          to: sub.user.email,
          subject: frequency === 'DAILY' 
            ? '🐆 Your Daily Photography Update' 
            : '🐆 Your Weekly Photography Digest',
          html
        });

        return { success, email: sub.user.email };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: subscribers.length
    });
  } catch (error) {
    console.error('Digest cron error:', error);
    return NextResponse.json(
      { error: 'Failed to send digests' },
      { status: 500 }
    );
  }
}
