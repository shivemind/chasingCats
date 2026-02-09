/**
 * Learning Path System
 * 
 * Generates personalized learning paths based on:
 * - User's quiz results (favoriteCat)
 * - Watch history
 * - Skill level preference
 * - Topic interests
 */

import { prisma } from '@/lib/prisma';
import type { SkillLevel, ContentType } from '@prisma/client';

interface PathGenerationOptions {
  userId: string;
  interests?: string[];
  skillLevel?: SkillLevel;
  maxItems?: number;
}

// Generate or get existing learning path
export async function getOrCreateLearningPath(userId: string) {
  // Check for existing path
  let path = await prisma.learningPath.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          content: {
            include: { category: true }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!path) {
    // Generate new path
    path = await generateLearningPath({ userId });
  }

  return path;
}

export async function generateLearningPath(options: PathGenerationOptions) {
  const { userId, maxItems = 20 } = options;

  // Get user profile for interests
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  // Get user's watch history to exclude already watched content
  const watchedContent = await prisma.watchStatus.findMany({
    where: { userId, watched: true },
    select: { contentId: true }
  });
  const watchedIds = watchedContent.map(w => w.contentId);

  // Get user's skill level preference (from profile quiz or default)
  const skillLevel = options.skillLevel || 'ALL_LEVELS';

  // Build content query based on interests
  const interestFilters = [];
  
  if (profile?.favoriteCat) {
    // Map favorite cat to species/topics
    interestFilters.push({ species: { contains: profile.favoriteCat, mode: 'insensitive' as const } });
  }

  if (options.interests?.length) {
    for (const interest of options.interests) {
      interestFilters.push({ topic: { contains: interest, mode: 'insensitive' as const } });
    }
  }

  // Fetch relevant content
  const content = await prisma.content.findMany({
    where: {
      publishedAt: { not: null },
      id: { notIn: watchedIds },
      OR: interestFilters.length > 0 ? interestFilters : undefined,
      level: skillLevel !== 'ALL_LEVELS' ? { in: [skillLevel, 'ALL_LEVELS'] } : undefined
    },
    orderBy: [
      { featured: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: maxItems * 2, // Get more than needed for better selection
    include: { category: true }
  });

  // If not enough content with filters, get any content
  let selectedContent = content;
  if (content.length < maxItems) {
    const additionalContent = await prisma.content.findMany({
      where: {
        publishedAt: { not: null },
        id: { notIn: [...watchedIds, ...content.map(c => c.id)] }
      },
      orderBy: { publishedAt: 'desc' },
      take: maxItems - content.length
    });
    selectedContent = [...content, ...additionalContent];
  }

  // Sort by difficulty progression
  const levelOrder: Record<SkillLevel, number> = {
    'BEGINNER': 1,
    'ALL_LEVELS': 2,
    'INTERMEDIATE': 3,
    'ADVANCED': 4
  };

  selectedContent.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  // Take final selection
  const finalContent = selectedContent.slice(0, maxItems);

  // Create learning path
  const description = profile?.favoriteCat 
    ? `A personalized journey through ${profile.favoriteCat} photography and more`
    : 'Your personalized wildlife photography learning journey';

  const path = await prisma.learningPath.create({
    data: {
      userId,
      title: 'Your Learning Journey',
      description,
      totalItems: finalContent.length,
      items: {
        create: finalContent.map((c, index) => ({
          contentId: c.id,
          order: index + 1
        }))
      }
    },
    include: {
      items: {
        include: {
          content: { include: { category: true } }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  return path;
}

export async function markPathItemComplete(userId: string, contentId: string) {
  const path = await prisma.learningPath.findUnique({
    where: { userId },
    include: { items: true }
  });

  if (!path) return null;

  const item = path.items.find(i => i.contentId === contentId);
  if (!item || item.isCompleted) return path;

  // Update item
  await prisma.learningPathItem.update({
    where: { id: item.id },
    data: {
      isCompleted: true,
      completedAt: new Date()
    }
  });

  // Update path completion count
  const updatedPath = await prisma.learningPath.update({
    where: { userId },
    data: {
      completed: { increment: 1 }
    },
    include: {
      items: {
        include: { content: { include: { category: true } } },
        orderBy: { order: 'asc' }
      }
    }
  });

  return updatedPath;
}

export async function getNextPathItem(userId: string) {
  const path = await prisma.learningPath.findUnique({
    where: { userId },
    include: {
      items: {
        where: { isCompleted: false },
        include: { content: { include: { category: true } } },
        orderBy: { order: 'asc' },
        take: 1
      }
    }
  });

  if (!path || path.items.length === 0) return null;
  
  return path.items[0];
}

export async function regenerateLearningPath(userId: string) {
  // Delete existing path
  await prisma.learningPath.deleteMany({
    where: { userId }
  });

  // Generate new path
  return generateLearningPath({ userId });
}

export async function getLearningPathProgress(userId: string) {
  const path = await prisma.learningPath.findUnique({
    where: { userId },
    include: {
      items: {
        include: { content: { select: { type: true } } }
      }
    }
  });

  if (!path) {
    return {
      exists: false,
      totalItems: 0,
      completed: 0,
      progress: 0,
      byType: {}
    };
  }

  // Calculate progress by content type
  const byType: Record<string, { total: number; completed: number }> = {};
  
  for (const item of path.items) {
    const type = item.content.type;
    if (!byType[type]) {
      byType[type] = { total: 0, completed: 0 };
    }
    byType[type].total++;
    if (item.isCompleted) {
      byType[type].completed++;
    }
  }

  return {
    exists: true,
    totalItems: path.totalItems,
    completed: path.completed,
    progress: path.totalItems > 0 ? (path.completed / path.totalItems) * 100 : 0,
    byType
  };
}
