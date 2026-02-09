export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for Chasing Cats Club membership. Learn about billing, content usage, and cancellation policies.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <section className="container-section py-24 prose max-w-3xl text-night">
        <h1>Terms of Service</h1>
        <p className="lead">Last updated: February 2026</p>
        <p>Welcome to the Chasing Cats Club membership platform. By accessing the site or subscribing to our services, you agree to the following terms:</p>
        
        <h2>1. Membership & Billing</h2>
        <ul>
          <li><strong>Automatic Renewal:</strong> Memberships renew automatically based on the billing cadence you select (monthly or annual). You will be charged at the start of each billing period.</li>
          <li><strong>Annual Benefits:</strong> Annual memberships include one 60-minute strategy session with Rachel or Sebastian.</li>
          <li><strong>Educational Pass:</strong> Complimentary educational passes provide 2 days of full access. After expiration, a paid subscription is required to continue accessing premium content.</li>
          <li><strong>Price Changes:</strong> We may adjust pricing with 30 days notice. Changes apply at your next renewal.</li>
          <li><strong>Payment Processing:</strong> All payments are securely processed by Stripe. We do not store your credit card information.</li>
        </ul>
        
        <h2>2. Account & Access</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>Sharing login credentials outside of your household is prohibited and may result in account termination.</li>
          <li>You must be at least 18 years old to create an account.</li>
        </ul>
        
        <h2>3. Content Usage</h2>
        <p>
          All content including videos, articles, and resources is original to Rachel, Sebastian, or their guests and is protected by copyright.
        </p>
        <ul>
          <li>Content is for personal, non-commercial use only.</li>
          <li>Downloading, copying, or redistributing content without permission is prohibited.</li>
          <li>You may share brief quotes with proper attribution for educational purposes.</li>
        </ul>
        
        <h2>4. Cancellation & Refunds</h2>
        <ul>
          <li>You can cancel your subscription at any time via the Stripe billing portal in your account settings.</li>
          <li>Cancelled subscriptions remain active until the end of the current billing period.</li>
          <li>Refunds are provided at our discretion for technical issues or billing errors.</li>
          <li>No refunds are provided for partial months or educational passes.</li>
        </ul>
        
        <h2>5. Limitation of Liability</h2>
        <p>
          Chasing Cats Club provides educational content for informational purposes. We are not responsible for any outcomes resulting from applying information learned through our platform. Wildlife photography involves inherent risks.
        </p>
        
        <h2>6. Contact</h2>
        <p>Questions about these terms? Contact us at <a href="mailto:hello@chasingcats.club">hello@chasingcats.club</a>.</p>
      </section>
    </div>
  );
}
