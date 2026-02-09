import { PrismaClient, ContentType, SubscriptionPlan, SubscriptionStatus, ReactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@chasingcats.club' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@chasingcats.club',
      name: 'Admin User',
      hashedPassword: password,
      role: 'ADMIN',
      profile: {
        create: {
          username: 'admin',
          bio: 'Site administrator',
          favoriteCat: 'All of them'
        }
      }
    }
  });

  // Regular member user
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

  // Seed the Pride Feed with sample posts
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@chasingcats.club' } });
  const memberUser = await prisma.user.findUnique({ where: { email: 'member@chasingcats.club' } });

  if (adminUser && memberUser) {
    // Clear existing posts for clean re-seeding
    await prisma.reaction.deleteMany({});
    await prisma.postComment.deleteMany({});
    await prisma.post.deleteMany({});

    const samplePosts = [
      {
        content: "Just got back from an incredible snow leopard expedition in Ladakh! 🐆❄️ After 6 days of trekking at 4,500m altitude, we finally spotted a mother and her two cubs resting on a rocky outcrop. The moment she locked eyes with us from 200m away... I'll never forget it. Worth every frozen toe!",
        imageUrl: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800',
        authorId: adminUser.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        content: "Why did the leopard lose at poker? Because he was playing with a cheetah! 🃏😸\n\nOkay okay, I'll see myself out...",
        imageUrl: null,
        authorId: memberUser.id,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        content: "Camera trap gold from the Pantanal! 📸 This jaguar has been visiting the same watering hole every night for a week. Notice the unique rosette pattern on his left shoulder - we've nicknamed him 'Constellation'. Local researchers confirmed he's a 7-year-old male with a territory spanning 80 sq km!",
        imageUrl: 'https://images.unsplash.com/photo-1551972873-b7e8754e8e26?w=800',
        authorId: adminUser.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        content: "Hot take: Clouded leopards are the most underrated wild cats. Those canine teeth! That climbing ability! They can hang upside down from branches and descend trees headfirst. Absolute units of the arboreal world. 🌳🐱\n\nChange my mind.",
        imageUrl: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=800',
        authorId: memberUser.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        content: "My cat at 3 AM vs every wild cat documentary I've watched: same energy 😹\n\nSeriously though, watching my tabby stalk a dust bunny really puts feline evolution into perspective. 65 million years of apex predator development, all to pounce on my socks.",
        imageUrl: null,
        authorId: memberUser.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        content: "ICYMI: New research published in Nature shows African lions have distinct 'dialects' in their roars depending on their region! Lions from the Serengeti have measurably different vocalizations than those from Kruger. The researchers think it helps prides identify neighbors vs strangers. 🦁🔬\n\nLink in comments!",
        imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800',
        authorId: adminUser.id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        content: "Finally organized my wildlife photography from last year's puma tracking trip in Patagonia. 847 photos. 3 actual puma sightings. 844 photos of \"is that a rock or a cat?\" 🪨😅\n\nThe 3 good ones were absolutely worth it though!",
        imageUrl: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800',
        authorId: memberUser.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        content: "PSA for anyone planning a tiger safari in India: \n\n🐅 Book Bandhavgarh or Ranthambore at least 3-4 months ahead\n🐅 Early morning safaris (6 AM) have the best sighting rates\n🐅 Bring a 200-400mm lens minimum\n🐅 Patience > equipment\n\nDrop your tips below! Let's help each other out.",
        imageUrl: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800',
        authorId: adminUser.id,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      },
      {
        content: "Fun fact: A group of cats is called a 'clowder', but a group of wild cats is called a 'destruction'. \n\nHonestly? Naming committee knew what they were doing. 💀🐆",
        imageUrl: null,
        authorId: memberUser.id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        content: "This serval just made my entire trip to Kenya. Look at those EARS! 📡 They can hear rodents moving underground. Evolution really said \"what if we gave a cat satellite dishes for ears?\" and honestly, iconic decision.",
        imageUrl: 'https://images.unsplash.com/photo-1557431177-36141475c676?w=800',
        authorId: adminUser.id,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      }
    ];

    const createdPosts = await Promise.all(
      samplePosts.map((post) =>
        prisma.post.create({
          data: post
        })
      )
    );

    // Add some comments
    const sampleComments = [
      { body: "Absolutely stunning shot! The lighting is perfect 😍", postIndex: 0, authorId: memberUser.id },
      { body: "I'm so jealous! Ladakh is on my bucket list. Any tips for acclimatization?", postIndex: 0, authorId: memberUser.id },
      { body: "LOL this made my day 😂", postIndex: 1, authorId: adminUser.id },
      { body: "Dad jokes are the apex predator of humor", postIndex: 1, authorId: adminUser.id },
      { body: "Constellation is such a perfect name! Those rosettes really do look like stars.", postIndex: 2, authorId: memberUser.id },
      { body: "No argument here. Clouded leopards are basically nature's ninjas.", postIndex: 3, authorId: adminUser.id },
      { body: "My void cat does the same thing at 3 AM. Maximum chaos energy.", postIndex: 4, authorId: adminUser.id },
      { body: "Link please! I'd love to read that paper.", postIndex: 5, authorId: memberUser.id },
      { body: "This is SO relatable 😂 My camera roll is 90% 'is this a cat?'", postIndex: 6, authorId: adminUser.id },
      { body: "Great tips! I'd add: bring lots of water and snacks for the long drives.", postIndex: 7, authorId: memberUser.id },
      { body: "Those ears! 😻 Servals are like the elves of the cat world.", postIndex: 9, authorId: memberUser.id }
    ];

    await Promise.all(
      sampleComments.map((comment) =>
        prisma.postComment.create({
          data: {
            body: comment.body,
            postId: createdPosts[comment.postIndex].id,
            authorId: comment.authorId
          }
        })
      )
    );

    // Add some reactions
    const reactions: Array<{ postIndex: number; userId: string; type: ReactionType }> = [
      { postIndex: 0, userId: memberUser.id, type: ReactionType.ROAR },
      { postIndex: 1, userId: adminUser.id, type: ReactionType.PURR },
      { postIndex: 2, userId: memberUser.id, type: ReactionType.ROAR },
      { postIndex: 3, userId: adminUser.id, type: ReactionType.PURR },
      { postIndex: 4, userId: adminUser.id, type: ReactionType.PURR },
      { postIndex: 5, userId: memberUser.id, type: ReactionType.ROAR },
      { postIndex: 6, userId: adminUser.id, type: ReactionType.PURR },
      { postIndex: 7, userId: memberUser.id, type: ReactionType.PURR },
      { postIndex: 8, userId: adminUser.id, type: ReactionType.PURR },
      { postIndex: 9, userId: memberUser.id, type: ReactionType.ROAR }
    ];

    await Promise.all(
      reactions.map((reaction) =>
        prisma.reaction.create({
          data: {
            type: reaction.type,
            postId: createdPosts[reaction.postIndex].id,
            userId: reaction.userId
          }
        })
      )
    );

    console.log(`Created ${createdPosts.length} sample posts with comments and reactions.`);
  }

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
