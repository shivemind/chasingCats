export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Chasing Cats Club collects, uses, and protects your personal information. We respect your privacy and never sell your data.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <section className="container-section py-24 prose max-w-3xl text-night">
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: February 2026</p>
        <p>
          Chasing Cats Club respects your privacy and only collects the information we need to deliver your membership, communicate updates, and improve our services.
        </p>
        
        <h2>1. Information We Collect</h2>
        <h3>Account Information</h3>
        <ul>
          <li>Name and email address when you register</li>
          <li>Username and profile details you choose to provide</li>
          <li>Password (stored securely using industry-standard hashing)</li>
        </ul>
        
        <h3>Billing Information</h3>
        <ul>
          <li>Payment card details are processed securely by Stripe and never stored on our servers</li>
          <li>We receive transaction confirmations and subscription status from Stripe</li>
        </ul>
        
        <h3>Usage Data</h3>
        <ul>
          <li>Content you view, watch progress, and engagement metrics</li>
          <li>Questions you submit and discussions you participate in</li>
          <li>Device information, browser type, and IP address for security and analytics</li>
        </ul>
        
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li><strong>Provide Services:</strong> Deliver access to content, process payments, and manage your account</li>
          <li><strong>Personalization:</strong> Recommend content based on your interests and viewing history</li>
          <li><strong>Communication:</strong> Send membership updates, new content notifications, and educational pass reminders</li>
          <li><strong>Improvement:</strong> Analyze usage patterns to improve our platform and content</li>
          <li><strong>Security:</strong> Detect and prevent fraud, abuse, and unauthorized access</li>
        </ul>
        
        <h2>3. Information Sharing</h2>
        <p><strong>We never sell your personal information.</strong></p>
        <p>We may share information with:</p>
        <ul>
          <li><strong>Service Providers:</strong> Stripe (payments), Vercel (hosting), email services</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
        </ul>
        
        <h2>4. Data Retention</h2>
        <p>
          We retain your account data while your account is active. After account deletion, we may retain certain data for legal compliance and fraud prevention for up to 7 years.
        </p>
        
        <h2>5. Your Rights</h2>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update inaccurate information via your profile settings</li>
          <li><strong>Deletion:</strong> Request account deletion by contacting us</li>
          <li><strong>Export:</strong> Download your data in a portable format</li>
        </ul>
        
        <h2>6. Cookies & Analytics</h2>
        <p>
          We use essential cookies for authentication and preferences. We use Vercel Analytics to understand site usage in an anonymized way. No third-party advertising trackers are used.
        </p>
        
        <h2>7. Contact</h2>
        <p>
          Questions about privacy? Contact us at <a href="mailto:hello@chasingcats.club">hello@chasingcats.club</a>.
        </p>
      </section>
    </div>
  );
}
