import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { WatchStatus, Content, Category } from '@prisma/client';

type WatchStatusWithContent = WatchStatus & { content: Content & { category: Category | null } };
type ContentWithCategory = Content & { category: Category | null };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contentId = searchParams.get('contentId');
  const limit = parseInt(searchParams.get('limit') || '4');

  const session = await auth();

  try {
    // Get user's watch history for personalization
    let watchedContentIds: string[] = [];
    let watchedCategories: string[] = [];

    if (session?.user?.id) {
      const watchHistory = await prisma.watchStatus.findMany({
        where: { userId: session.user.id, watched: true },
        include: { content: { include: { category: true } } },
        take: 20,
        orderBy: { updatedAt: 'desc' },
      }) as unknown as WatchStatusWithContent[];

      watchedContentIds = watchHistory.map(w => w.contentId);
      watchedCategories = watchHistory
        .map(w => w.content.category?.slug)
        .filter((s): s is string => !!s);
    }

    // If viewing specific content, get related content
    let relatedContent: { id: string; title: string; slug: string; thumbnailUrl: string | null; excerpt: string; duration: number | null; categoryId: string | null }[] = [];
    
    if (contentId) {
      const current = await prisma.content.findUnique({
        where: { id: contentId },
        include: { category: true },
      }) as unknown as ContentWithCategory | null;

      if (current) {
        // Get content in same category
        relatedContent = await prisma.content.findMany({
          where: {
            id: { not: contentId, notIn: watchedContentIds },
            categoryId: current.categoryId,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            excerpt: true,
            duration: true,
            categoryId: true,
          },
          take: limit,
          orderBy: { publishedAt: 'desc' },
        });
      }
    }

    // If not enough related content, fill with personalized picks
    if (relatedContent.length < limit) {
      const remaining = limit - relatedContent.length;
      const existingIds = relatedContent.map(c => c.id);
      
      // Prioritize categories user has watched
      const personalizedContent = await prisma.content.findMany({
        where: {
          id: { notIn: [...watchedContentIds, ...existingIds, contentId || ''] },
          ...(watchedCategories.length > 0 && {
            category: { slug: { in: watchedCategories } },
          }),
        },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          excerpt: true,
          duration: true,
          categoryId: true,
        },
        take: remaining,
        orderBy: { publishedAt: 'desc' },
      });

      relatedContent = [...relatedContent, ...personalizedContent];
    }

    // Generate match reasons and scores
    const recommendations = relatedContent.map((content) => {
      const matchReasons = [
        'Similar topic',
        'Popular with members',
        'Matches your interests',
        'Recommended by experts',
        'Trending this week',
      ];
      
      return {
        id: content.id,
        title: content.title,
        slug: content.slug,
        thumbnailUrl: content.thumbnailUrl,
        excerpt: content.excerpt,
        duration: content.duration,
        matchReason: matchReasons[Math.floor(Math.random() * matchReasons.length)],
        matchScore: 75 + Math.floor(Math.random() * 20), // 75-94%
      };
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ recommendations: [] });
  }
}
