/**
 * Photo Challenges System
 * 
 * Community photo competitions with voting and prizes
 */

import { prisma } from '@/lib/prisma';
import type { ChallengeStatus } from '@prisma/client';

// Type helpers for Prisma Accelerate extension
interface EntryWithCount {
  id: string;
  createdAt: Date;
  location: string | null;
  title: string | null;
  imageUrl: string;
  userId: string;
  isApproved: boolean;
  challengeId: string;
  caption: string | null;
  cameraInfo: string | null;
  isFeatured: boolean;
  isWinner: boolean;
  winnerPlace: number | null;
  user: { id: string; name: string | null; image: string | null };
  _count: { votes: number };
}

// Get all active and upcoming challenges
export async function getActiveChallenges() {
  const now = new Date();
  
  return prisma.photoChallenge.findMany({
    where: {
      OR: [
        { status: 'ACTIVE' },
        { status: 'VOTING' },
        { 
          status: 'UPCOMING',
          startDate: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } // Starting within 7 days
        }
      ]
    },
    orderBy: { startDate: 'asc' },
    include: {
      _count: { select: { entries: true } }
    }
  });
}

// Get challenge by slug
export async function getChallengeBySlug(slug: string) {
  return prisma.photoChallenge.findUnique({
    where: { slug },
    include: {
      entries: {
        where: { isApproved: true },
        include: {
          user: { select: { id: true, name: true, image: true } },
          _count: { select: { votes: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: { select: { entries: true } }
    }
  });
}

// Submit entry to challenge
export async function submitEntry(
  data: {
    challengeId: string;
    userId: string;
    imageUrl: string;
    title?: string;
    caption?: string;
    location?: string;
    cameraInfo?: string;
  }
) {
  const { challengeId, userId, ...entryData } = data;
  // Check if challenge is active
  const challenge = await prisma.photoChallenge.findUnique({
    where: { id: challengeId }
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  if (challenge.status !== 'ACTIVE') {
    throw new Error('Challenge is not accepting entries');
  }

  // Check if user already has an entry
  const existingEntry = await prisma.challengeEntry.findUnique({
    where: {
      challengeId_userId: { challengeId, userId }
    }
  });

  if (existingEntry) {
    throw new Error('You have already entered this challenge');
  }

  return prisma.challengeEntry.create({
    data: {
      challengeId,
      userId,
      ...entryData
    }
  });
}

// Vote for an entry
export async function voteForEntry(entryId: string, voterId: string) {
  // Get entry and challenge
  const entry = await prisma.challengeEntry.findUnique({
    where: { id: entryId },
    include: { challenge: true }
  });

  if (!entry) {
    throw new Error('Entry not found');
  }

  if (entry.challenge.status !== 'VOTING') {
    throw new Error('Voting is not open for this challenge');
  }

  if (entry.userId === voterId) {
    throw new Error('You cannot vote for your own entry');
  }

  // Check if already voted
  const existingVote = await prisma.challengeVote.findUnique({
    where: {
      entryId_voterId: { entryId, voterId }
    }
  });

  if (existingVote) {
    // Remove vote (toggle)
    await prisma.challengeVote.delete({
      where: { id: existingVote.id }
    });
    return { voted: false };
  }

  // Add vote
  await prisma.challengeVote.create({
    data: { entryId, voterId }
  });

  return { voted: true };
}

// Get user's entry for a challenge
export async function getUserEntry(challengeId: string, userId: string) {
  return prisma.challengeEntry.findUnique({
    where: {
      challengeId_userId: { challengeId, userId }
    },
    include: {
      _count: { select: { votes: true } }
    }
  });
}

// Check if user has voted for an entry
export async function hasUserVoted(entryId: string, userId: string) {
  const vote = await prisma.challengeVote.findUnique({
    where: {
      entryId_voterId: { entryId, voterId: userId }
    }
  });
  return !!vote;
}

// Get challenge leaderboard
export async function getChallengeLeaderboard(challengeId: string, limit = 10) {
  const entries = await prisma.challengeEntry.findMany({
    where: { 
      challengeId,
      isApproved: true 
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true } }
    },
    orderBy: {
      votes: { _count: 'desc' }
    },
    take: limit
  }) as unknown as EntryWithCount[];

  return entries.map((entry, index) => ({
    rank: index + 1,
    entry,
    voteCount: entry._count.votes
  }));
}

// Update challenge status based on dates
export async function updateChallengeStatuses() {
  const now = new Date();

  // Activate challenges that have started
  await prisma.photoChallenge.updateMany({
    where: {
      status: 'UPCOMING',
      startDate: { lte: now }
    },
    data: { status: 'ACTIVE' }
  });

  // Move to voting phase
  await prisma.photoChallenge.updateMany({
    where: {
      status: 'ACTIVE',
      endDate: { lte: now }
    },
    data: { status: 'VOTING' }
  });

  // Complete challenges where voting ended
  await prisma.photoChallenge.updateMany({
    where: {
      status: 'VOTING',
      votingEnd: { lte: now }
    },
    data: { status: 'COMPLETED' }
  });
}

// Admin: Create challenge
export async function createChallenge(data: {
  title: string;
  slug: string;
  description: string;
  theme: string;
  rules?: string;
  prizeInfo?: string;
  startDate: Date;
  endDate: Date;
  votingEnd: Date;
  featured?: boolean;
}) {
  return prisma.photoChallenge.create({
    data: {
      ...data,
      status: data.startDate > new Date() ? 'UPCOMING' : 'ACTIVE'
    }
  });
}

// Admin: Select winners
export async function selectWinners(challengeId: string, winnerIds: { first: string; second?: string; third?: string }) {
  const updates = [];

  if (winnerIds.first) {
    updates.push(
      prisma.challengeEntry.update({
        where: { id: winnerIds.first },
        data: { isWinner: true, winnerPlace: 1, isFeatured: true }
      })
    );
  }

  if (winnerIds.second) {
    updates.push(
      prisma.challengeEntry.update({
        where: { id: winnerIds.second },
        data: { isWinner: true, winnerPlace: 2 }
      })
    );
  }

  if (winnerIds.third) {
    updates.push(
      prisma.challengeEntry.update({
        where: { id: winnerIds.third },
        data: { isWinner: true, winnerPlace: 3 }
      })
    );
  }

  await Promise.all(updates);
}
