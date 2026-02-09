import { prisma } from '@/lib/prisma';

// Email provider abstraction - supports Resend and SendGrid
export interface EmailProvider {
  send(options: EmailOptions): Promise<boolean>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Resend Provider (requires RESEND_API_KEY)
export class ResendProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: EmailOptions): Promise<boolean> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: options.from || 'Chasing Cats Club <digest@chasingcats.club>',
        to: options.to,
        subject: options.subject,
        html: options.html
      })
    });

    return response.ok;
  }
}

// SendGrid Provider (requires SENDGRID_API_KEY)
export class SendGridProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: EmailOptions): Promise<boolean> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: options.from || 'digest@chasingcats.club', name: 'Chasing Cats Club' },
        subject: options.subject,
        content: [{ type: 'text/html', value: options.html }]
      })
    });

    return response.ok;
  }
}

// Factory function to get the appropriate email provider
export function getEmailProvider(): EmailProvider | null {
  const resendKey = process.env.RESEND_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;

  if (resendKey) {
    return new ResendProvider(resendKey);
  }

  if (sendgridKey) {
    return new SendGridProvider(sendgridKey);
  }

  return null;
}

// Check if email provider is available
export function isEmailAvailable(): boolean {
  return !!(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
}

// Digest preferences
export type DigestFrequency = 'WEEKLY' | 'DAILY' | 'NONE';

export async function getDigestPreference(userId: string) {
  return prisma.digestPreference.findUnique({
    where: { userId }
  });
}

export async function updateDigestPreference(
  userId: string, 
  data: {
    frequency?: DigestFrequency;
    includeNewContent?: boolean;
    includeChallenges?: boolean;
    includeTips?: boolean;
  }
) {
  return prisma.digestPreference.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      frequency: data.frequency || 'WEEKLY',
      includeNewContent: data.includeNewContent ?? true,
      includeChallenges: data.includeChallenges ?? true,
      includeTips: data.includeTips ?? true
    }
  });
}

// Get users who want to receive digests
export async function getDigestSubscribers(frequency: DigestFrequency) {
  return prisma.digestPreference.findMany({
    where: { frequency },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });
}

// Generate digest content
export async function generateDigestContent() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get new content from the past week
  const newContent = await prisma.content.findMany({
    where: {
      publishedAt: { gte: oneWeekAgo, not: null }
    },
    orderBy: { publishedAt: 'desc' },
    take: 5
  });

  // Get active challenges
  const activeChallenges = await prisma.photoChallenge.findMany({
    where: {
      status: { in: ['ACTIVE', 'VOTING'] }
    },
    take: 3
  });

  // Photography tips (static for now, could be dynamic)
  const tips = [
    "Try shooting during the 'golden hour' for warm, soft lighting on your wildlife subjects.",
    "Use continuous autofocus (AF-C) when tracking moving animals.",
    "A minimum shutter speed of 1/focal length helps prevent camera shake.",
    "Study animal behavior patterns to anticipate great photo opportunities.",
    "Fill the frame with your subject for maximum impact."
  ];

  return {
    newContent,
    activeChallenges,
    tip: tips[Math.floor(Math.random() * tips.length)]
  };
}

// Build HTML email template
export function buildDigestEmail(
  userName: string,
  content: Awaited<ReturnType<typeof generateDigestContent>>,
  preferences: { includeNewContent: boolean; includeChallenges: boolean; includeTips: boolean }
): string {
  const sections: string[] = [];

  // Header
  sections.push(`
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #000; font-size: 28px; margin: 0;">🐆 Chasing Cats Club</h1>
      <p style="color: #000; margin: 10px 0 0; opacity: 0.8;">Your Weekly Photography Digest</p>
    </div>
  `);

  // Greeting
  sections.push(`
    <div style="padding: 30px 20px;">
      <p style="color: #fff; font-size: 16px; margin: 0 0 20px;">
        Hey ${userName || 'there'}! 👋
      </p>
      <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 30px;">
        Here's what's happening in the Chasing Cats Club this week.
      </p>
    </div>
  `);

  // New Content Section
  if (preferences.includeNewContent && content.newContent.length > 0) {
    const contentItems = content.newContent.map(c => `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <h4 style="color: #fff; margin: 0 0 8px; font-size: 16px;">${c.title}</h4>
        <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px;">${c.type}</p>
      </div>
    `).join('');

    sections.push(`
      <div style="padding: 0 20px 30px;">
        <h3 style="color: #8B5CF6; font-size: 18px; margin: 0 0 16px;">📚 New Content</h3>
        ${contentItems}
      </div>
    `);
  }

  // Challenges Section
  if (preferences.includeChallenges && content.activeChallenges.length > 0) {
    const challengeItems = content.activeChallenges.map(c => `
      <div style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <h4 style="color: #fff; margin: 0 0 8px; font-size: 16px;">${c.title}</h4>
        <p style="color: #06B6D4; margin: 0; font-size: 13px;">${c.theme}</p>
        <span style="display: inline-block; background: ${c.status === 'ACTIVE' ? 'rgba(34,197,94,0.2)' : 'rgba(168,85,247,0.2)'}; color: ${c.status === 'ACTIVE' ? '#22c55e' : '#a855f7'}; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px;">
          ${c.status === 'ACTIVE' ? 'Open for Entries' : 'Voting Open'}
        </span>
      </div>
    `).join('');

    sections.push(`
      <div style="padding: 0 20px 30px;">
        <h3 style="color: #8B5CF6; font-size: 18px; margin: 0 0 16px;">📸 Photo Challenges</h3>
        ${challengeItems}
      </div>
    `);
  }

  // Tip Section
  if (preferences.includeTips) {
    sections.push(`
      <div style="padding: 0 20px 30px;">
        <div style="background: linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(6,182,212,0.2) 100%); border-radius: 12px; padding: 20px;">
          <h3 style="color: #fff; font-size: 16px; margin: 0 0 12px;">💡 Photography Tip of the Week</h3>
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px; line-height: 1.6;">
            ${content.tip}
          </p>
        </div>
      </div>
    `);
  }

  // Footer
  sections.push(`
    <div style="padding: 30px 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 10px;">
        Happy shooting! 📷
      </p>
      <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 0;">
        You're receiving this because you subscribed to the Chasing Cats Club digest.
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #8B5CF6;">Manage preferences</a>
      </p>
    </div>
  `);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #111827;">
          ${sections.join('')}
        </div>
      </body>
    </html>
  `;
}

// Send digest to a single user
export async function sendDigestToUser(
  userId: string,
  email: string,
  name: string | null
) {
  const provider = getEmailProvider();
  if (!provider) {
    throw new Error('Email provider not configured');
  }

  const preference = await getDigestPreference(userId);
  if (!preference || preference.frequency === 'NONE') {
    return false;
  }

  const content = await generateDigestContent();
  const html = buildDigestEmail(name || 'there', content, {
    includeNewContent: preference.includeNewContent,
    includeChallenges: preference.includeChallenges,
    includeTips: preference.includeTips
  });

  return provider.send({
    to: email,
    subject: '🐆 Your Weekly Photography Digest',
    html
  });
}

// Admin: Get digest statistics
export async function getDigestStats() {
  const [totalSubscribers, weeklyCount, dailyCount] = await Promise.all([
    prisma.digestPreference.count({
      where: { frequency: { not: 'NONE' } }
    }),
    prisma.digestPreference.count({
      where: { frequency: 'WEEKLY' }
    }),
    prisma.digestPreference.count({
      where: { frequency: 'DAILY' }
    })
  ]);

  return {
    totalSubscribers,
    weeklyCount,
    dailyCount
  };
}
