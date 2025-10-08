export const metadata = {
  title: 'Terms of Service | Chasing Cats Club'
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <section className="container-section py-24 prose max-w-3xl text-night">
        <h1>Terms of Service</h1>
        <p>Welcome to the Chasing Cats Club membership platform. By accessing the site you agree to the following:</p>
        <h2>Membership</h2>
        <ul>
          <li>Memberships renew automatically based on the billing cadence you select.</li>
          <li>Annual memberships include one 60-minute strategy session with Rachel or Sebastian.</li>
          <li>Sharing login credentials outside of your household is prohibited.</li>
        </ul>
        <h2>Content</h2>
        <p>
          All content is original to Rachel, Sebastian, or their guests. Please request permission before redistributing any materials outside of the community.
        </p>
        <h2>Cancellation</h2>
        <p>You can manage or cancel your subscription at any time via the Stripe billing portal.</p>
      </section>
    </div>
  );
}
