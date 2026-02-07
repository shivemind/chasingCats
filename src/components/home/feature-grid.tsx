const features = [
  {
    title: 'Monthly Expert Talks',
    description: 'Deep dives on cat topics and your chance to ask the experts.',
    icon: '🐆',
    gradient: 'from-neon-cyan to-brand',
    glow: 'shadow-glow'
  },
  {
    title: 'Courses & Lectures',
    description: 'Camera trapping, fieldcraft, editing, photo ethics.',
    icon: '📷',
    gradient: 'from-accent to-cat-eye',
    glow: 'shadow-glow-accent'
  },
  {
    title: 'Access to Pros',
    description: 'Anything cat or photo related? Ask us!',
    icon: '🔮',
    gradient: 'from-neon-purple to-brand-light',
    glow: 'shadow-glow-purple'
  }
];

export function FeatureGrid() {
  return (
    <section id="inside" className="relative bg-gradient-to-b from-night via-deep-space to-midnight py-24">
      {/* Background accents */}
      <div className="absolute inset-0 bg-cat-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-neon-cyan/5 blur-3xl" />
      <div className="absolute top-1/2 right-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-neon-purple/5 blur-3xl" />
      
      <div className="container-section relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            What&apos;s inside the{' '}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">club</span>
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Practical skills, conservation conversations, and a like-minded crew cheering on your cat encounters.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-white/20 hover:${feature.glow}`}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-10`} />
              
              <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-2xl shadow-lg`}>
                <span aria-hidden>{feature.icon}</span>
              </div>
              <h3 className="relative mt-6 text-xl font-semibold text-white">{feature.title}</h3>
              <p className="relative mt-3 text-sm text-white/60">{feature.description}</p>
              
              {/* Cat eye decoration */}
              <div className="absolute bottom-4 right-4 flex gap-2 opacity-20 transition-opacity group-hover:opacity-40">
                <div className="h-1.5 w-3 rounded-full bg-cat-eye" />
                <div className="h-1.5 w-3 rounded-full bg-cat-eye" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
