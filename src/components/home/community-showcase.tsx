const highlights = [
  {
    title: 'Newsfeed: Iberian Lynx numbers climb for third year',
    description: 'Sebastian breaks down what the latest survey results mean for photographers heading to Spain this season.',
    category: 'News',
    date: 'Mar 12',
    icon: '📰'
  },
  {
    title: 'Member AMA: Tracking caracals near Cape Town',
    description: 'Rachel answers member-submitted questions and shares field intel from recent projects.',
    category: 'AMA',
    date: 'Mar 8',
    icon: '🎤'
  },
  {
    title: 'Community drop: Macro camera trap setup walkthrough',
    description: 'Step-by-step build from member Samira on capturing fishing cats in mangroves.',
    category: 'Workshop',
    date: 'Mar 5',
    icon: '🎓'
  }
];

export function CommunityShowcase() {
  return (
    <section className="bg-gradient-to-b from-deep-space to-midnight">
      <div className="container-section py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neon-purple/20">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">In Case You Missed It</h2>
          <p className="mt-4 text-lg text-gray-400">
            See what you&apos;ve missed, mark sessions as watched, and get nudged toward the stories you&apos;ll love next.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {highlights.map((item, index) => (
            <article 
              key={item.title} 
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-neon-cyan/30 hover:bg-white/10"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-cyan/0 to-neon-purple/0 opacity-0 transition-opacity group-hover:opacity-10" />
              
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan">{item.category}</p>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-neon-cyan transition-colors">{item.title}</h3>
                <p className="mt-3 text-sm text-gray-400">{item.description}</p>
                <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-gray-500">{item.date}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
