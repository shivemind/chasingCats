const features = [
  {
    title: 'Learn from the Experts',
    description:
      'Live talks and intimate workshops with biologists, conservationists, and photographers who are shaping the future of big cat protection.',
    icon: '🎓'
  },
  {
    title: 'Dial in Your Photo + Field Skills',
    description:
      'Camera trapping, remote expedition planning, low-light shooting, fieldcraft, and storytelling techniques from Sebastian and Rachel.',
    icon: '📷'
  },
  {
    title: 'Exclusive Deals &amp; Merch',
    description: 'Member-only merch drops, partner discounts, and access to 1:1 editing + coaching sessions.',
    icon: '🎁'
  }
];

export function FeatureGrid() {
  return (
    <section id="inside" className="container-section py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="section-heading">What&apos;s inside the club</h2>
        <p className="section-subtitle">
          Practical skills, conservation conversations, and a like-minded crew cheering on your cat encounters.
        </p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="flex h-full flex-col rounded-3xl border border-night/10 bg-white p-8 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl">
              <span aria-hidden>{feature.icon}</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-night" dangerouslySetInnerHTML={{ __html: feature.title }} />
            <p className="mt-3 text-sm text-night/70" dangerouslySetInnerHTML={{ __html: feature.description }} />
          </div>
        ))}
      </div>
    </section>
  );
}
