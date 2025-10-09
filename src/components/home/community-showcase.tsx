const highlights = [
  {
    title: 'Newsfeed: Iberian Lynx numbers climb for third year',
    description: 'Sebastian breaks down what the latest survey results mean for photographers heading to Spain this season.',
    category: 'News',
    date: 'Mar 12'
  },
  {
    title: 'Member AMA: Tracking caracals near Cape Town',
    description: 'Rachel answers member-submitted questions and shares field intel from recent projects.',
    category: 'AMA',
    date: 'Mar 8'
  },
  {
    title: 'Community drop: Macro camera trap setup walkthrough',
    description: 'Step-by-step build from member Samira on capturing fishing cats in mangroves.',
    category: 'Workshop',
    date: 'Mar 5'
  }
];

export function CommunityShowcase() {
  return (
    <section className="bg-white">
      <div className="container-section py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">Community pulse</h2>
          <p className="section-subtitle">
            See what you&apos;ve missed, mark sessions as watched, and get nudged toward the stories you&apos;ll love next.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-3xl border border-night/10 bg-[#F5F1E3]/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/60">{item.category}</p>
              <h3 className="mt-4 text-lg font-semibold text-night">{item.title}</h3>
              <p className="mt-3 text-sm text-night/70">{item.description}</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-night/50">{item.date}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
