import { PrismaClient, ContentType, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'member@chasingcats.club' },
    update: {},
    create: {
      email: 'member@chasingcats.club',
      name: 'Chasing Cats Member',
      hashedPassword: password,
      profile: {
        create: {
          username: 'cat_member',
          bio: 'Wild cat enthusiast and photographer.',
          favoriteCat: 'Snow Leopard',
          quizResult: 'Clouded Leopard'
        }
      },
      memberships: {
        create: {
          plan: SubscriptionPlan.MONTHLY,
          status: SubscriptionStatus.ACTIVE
        }
      }
    }
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'experts' },
      update: {},
      create: {
        name: 'From the Experts',
        slug: 'experts'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'field' },
      update: {},
      create: {
        name: 'Into the Field',
        slug: 'field'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'ask-me-anything' },
      update: {},
      create: {
        name: 'Ask Me Anything',
        slug: 'ask-me-anything'
      }
    })
  ]);

  const [experts, field, ask] = categories;

  const baseContent = [
    {
      title: 'Do wild cats meow? Vocalizations decoded',
      slug: 'experts/do-wild-cats-meow',
      excerpt: 'Dr. Ellen Melon breaks down the anatomy of wild cat vocalizations and what they signal in the field.',
      body: '<p>Full talk transcript and resource links.</p>',
      type: ContentType.TALK,
      thumbnailUrl: '/images/content-vocalizations.svg',
      publishedAt: new Date('2024-03-01T10:00:00Z'),
      duration: 68,
      species: 'Various',
      topic: 'Behavior',
      categoryId: experts.id,
      region: 'Global'
    },
    {
      title: 'Tracking jaguars after dark in the Pantanal',
      slug: 'field/tracking-jaguars-after-dark',
      excerpt: 'Sebastian shares fieldcraft, safety considerations, and gear for nocturnal jaguar encounters.',
      body: '<p>Gear checklist, GPS downloads, and recommended itineraries.</p>',
      type: ContentType.VIDEO,
      thumbnailUrl: '/images/content-jaguar.svg',
      publishedAt: new Date('2024-02-20T15:00:00Z'),
      duration: 54,
      species: 'Jaguar',
      topic: 'Fieldcraft',
      categoryId: field.id,
      region: 'Pantanal, Brazil'
    },
    {
      title: 'Ask us anything: Clouded leopard camera traps',
      slug: 'ask/clouded-leopard-camera-traps',
      excerpt: 'Rachel and Sebastian answer member-submitted questions about camera trapping elusive forest cats.',
      body: '<p>Transcript, kit list, and location intel.</p>',
      type: ContentType.COURSE,
      thumbnailUrl: '/images/content-camera-trap.svg',
      publishedAt: new Date('2024-02-12T18:00:00Z'),
      duration: 72,
      species: 'Clouded Leopard',
      topic: 'Camera Trapping',
      categoryId: ask.id,
      region: 'Borneo'
    },
    {
      title: 'Do wild cats dream? Neurology of the night',
      slug: 'experts/do-wild-cats-dream',
      excerpt: 'Neuroscientist Dr. Priya Sharma shares new research on REM cycles in big cats and what it means for rehabilitation.',
      body: '<p>Download the research slides and follow-up reading list.</p>',
      type: ContentType.TALK,
      thumbnailUrl: '/images/content-neuro.svg',
      publishedAt: new Date('2024-03-10T17:00:00Z'),
      duration: 58,
      species: 'Lion',
      topic: 'Research',
      categoryId: experts.id,
      region: 'Global'
    },
    {
      title: 'Field briefing: Snow leopard trekking routes 2024',
      slug: 'field/snow-leopard-trekking-routes-2024',
      excerpt: 'Updated logistics, local partners, and weather windows for Ladakh expeditions.',
      body: '<p>Download the full route map and local contacts.</p>',
      type: ContentType.VIDEO,
      thumbnailUrl: '/images/content-snow-leopard.svg',
      publishedAt: new Date('2024-03-05T12:00:00Z'),
      duration: 42,
      species: 'Snow Leopard',
      topic: 'Planning',
      categoryId: field.id,
      region: 'Ladakh, India'
    },
    {
      title: 'Ask anything: Ethics of baiting vs. patience',
      slug: 'ask/ethics-of-baiting',
      excerpt: 'A community debate moderated by Rachel with conservation biologists and pro photographers.',
      body: '<p>Replay, recommended readings, and code of ethics template.</p>',
      type: ContentType.VIDEO,
      thumbnailUrl: '/images/content-ethics.svg',
      publishedAt: new Date('2024-03-08T20:00:00Z'),
      duration: 63,
      species: 'Various',
      topic: 'Ethics',
      categoryId: ask.id,
      region: 'Global'
    }
  ];

  await Promise.all(
    baseContent.map((item) =>
      prisma.content.upsert({
        where: { slug: item.slug },
        update: item,
        create: item
      })
    )
  );

  await prisma.event.upsert({
    where: { slug: 'biology-of-claws' },
    update: {
      title: 'The Biology of Claws with Dr. Ned Nedlinger',
      description: 'Live webinar with claw expert Dr. Ned Nedlinger and hosted by Sebastian & Rachel.',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    create: {
      title: 'The Biology of Claws with Dr. Ned Nedlinger',
      slug: 'biology-of-claws',
      description: 'Live webinar with claw expert Dr. Ned Nedlinger and hosted by Sebastian & Rachel.',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      zoomLink: 'https://zoom.us/j/123456789',
      host: 'Sebastian & Rachel'
    }
  });

  console.log('Database seeded successfully with baseline content.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
