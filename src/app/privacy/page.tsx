export const metadata = {
  title: 'Privacy Policy | Chasing Cats Club'
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <section className="container-section py-24 prose max-w-3xl text-night">
        <h1>Privacy Policy</h1>
        <p>
          Chasing Cats Club respects your privacy and only collects the information we need to deliver your membership, communicate
          updates, and improve our services.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>Account information (name, email, profile details)</li>
          <li>Billing information processed securely by Stripe</li>
          <li>Usage data about the content you view to personalize recommendations</li>
        </ul>
        <h2>How we use your information</h2>
        <p>
          We use the data we collect to provide access to content, notify you about new sessions, personalize your member experience,
          and share conservation updates. We never sell your personal information.
        </p>
        <h2>Contact</h2>
        <p>If you have questions, reach out to hello@chasingcats.club.</p>
      </section>
    </div>
  );
}
