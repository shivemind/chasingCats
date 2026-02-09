import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  getOrCreateLearningPath, 
  regenerateLearningPath,
  getLearningPathProgress 
} from '@/lib/learning-path';

interface PathWithItems {
  id: string;
  title: string;
  description: string | null;
  totalItems: number;
  completed: number;
  items: Array<{
    id: string;
    order: number;
    isCompleted: boolean;
    completedAt: Date | null;
    content: {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      type: string;
      thumbnailUrl: string | null;
      duration: number | null;
      level: string | null;
      category: { name: string } | null;
    };
  }>;
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const path = await getOrCreateLearningPath(session.user.id) as unknown as PathWithItems;
    const progress = await getLearningPathProgress(session.user.id);
    
    return NextResponse.json({ 
      path: {
        id: path.id,
        title: path.title,
        description: path.description,
        totalItems: path.totalItems,
        completed: path.completed,
        items: path.items.map(item => ({
          id: item.id,
          order: item.order,
          isCompleted: item.isCompleted,
          completedAt: item.completedAt?.toISOString(),
          content: {
            id: item.content.id,
            title: item.content.title,
            slug: item.content.slug,
            excerpt: item.content.excerpt,
            type: item.content.type,
            thumbnailUrl: item.content.thumbnailUrl,
            duration: item.content.duration,
            level: item.content.level,
            category: item.content.category?.name
          }
        }))
      },
      progress 
    });
  } catch (error) {
    console.error('Failed to get learning path:', error);
    return NextResponse.json({ error: 'Failed to get learning path' }, { status: 500 });
  }
}

// Regenerate learning path
export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const path = await regenerateLearningPath(session.user.id);
    
    return NextResponse.json({ 
      message: 'Learning path regenerated',
      path: {
        id: path.id,
        title: path.title,
        totalItems: path.totalItems
      }
    });
  } catch (error) {
    console.error('Failed to regenerate learning path:', error);
    return NextResponse.json({ error: 'Failed to regenerate' }, { status: 500 });
  }
}
