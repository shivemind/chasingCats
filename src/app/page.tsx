import { prisma } from '@/lib/prisma';
import { AnimatedHero } from '@/components/home/animated-hero';
import { FeatureGrid } from '@/components/home/feature-grid';
import { EventPromo } from '@/components/home/event-promo';
import { ArchivePreview } from '@/components/home/archive-preview';
import { StorySection } from '@/components/home/story';
import { CommunityShowcase } from '@/components/home/community-showcase';
import { FinalCTA } from '@/components/home/final-cta';

export default async function HomePage() {
  const [experts, field, ask] = await Promise.all([
    prisma.content.findMany({
      where: { category: { slug: 'experts' } },
      orderBy: { publishedAt: 'desc' },
      take: 3
    }),
    prisma.content.findMany({
      where: { category: { slug: 'field' } },
      orderBy: { publishedAt: 'desc' },
      take: 3
    }),
    prisma.content.findMany({
      where: { category: { slug: 'ask-me-anything' } },
      orderBy: { publishedAt: 'desc' },
      take: 3
    })
  ]);

  return (
    <>
      <AnimatedHero />
      <FeatureGrid />
      <EventPromo />
      <CommunityShowcase />
      <ArchivePreview experts={experts} field={field} ask={ask} />
      <StorySection />
      <FinalCTA />
    </>
  );
}
