/**
 * Email utility for sending notifications
 * 
 * For production, integrate with a service like:
 * - Resend (recommended for Next.js)
 * - SendGrid
 * - AWS SES
 * 
 * Set EMAIL_FROM and your provider's API key in environment variables.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'Chasing Cats Club <hello@chasingcats.club>';

/**
 * Send an email notification
 * Currently logs to console - replace with actual email provider in production
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  // Log email in development or when Resend is not configured
  if (process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY) {
    console.log('📧 Email would be sent:', { to, subject });
    console.log('HTML:', html.substring(0, 200) + '...');
    return true;
  }

  try {
    // Dynamic import to avoid build errors when resend is not installed
    // Install with: npm install resend
    const resendModule = await import('resend').catch(() => null);
    
    if (!resendModule) {
      console.warn('Resend package not installed. Install with: npm install resend');
      console.log('📧 Email would be sent:', { to, subject });
      return true;
    }

    const resend = new resendModule.Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Email template for educational pass expiry reminder
 */
export function getPassExpiryEmail(userName: string, expiryDate: Date): EmailOptions {
  const formattedDate = expiryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    to: '', // Will be set by caller
    subject: '🐱 Your Educational Pass Expires Tomorrow',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 20px;">
          Hi ${userName || 'there'}! 👋
        </h1>
        
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          Your educational pass for <strong>Chasing Cats Club</strong> expires on <strong>${formattedDate}</strong>.
        </p>
        
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          To keep accessing our full library of wildlife photography content, expert talks, and community features, choose a membership plan that works for you.
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://chasingcats.club'}/join" 
             style="display: inline-block; background: linear-gradient(135deg, #00b4d8, #06d6a0); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
            View Membership Plans →
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Thanks for being part of our wild cat community!<br/>
          — Rachel & Sebastian
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #999; font-size: 12px;">
          Chasing Cats Club | Wildlife Photography Education<br/>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://chasingcats.club'}" style="color: #00b4d8;">chasingcats.club</a>
        </p>
      </div>
    `,
  };
}

/**
 * Email template for password reset
 */
export function getPasswordResetEmail(resetUrl: string): EmailOptions {
  return {
    to: '', // Will be set by caller
    subject: 'Reset Your Password - Chasing Cats Club',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 20px;">
          Reset Your Password
        </h1>
        
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password for your Chasing Cats Club account.
        </p>
        
        <p style="color: #444; font-size: 16px; line-height: 1.6;">
          Click the button below to create a new password. This link expires in 1 hour.
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #a855f7, #00b4d8); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Reset Password →
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #999; font-size: 12px;">
          Chasing Cats Club | Wildlife Photography Education
        </p>
      </div>
    `,
  };
}
