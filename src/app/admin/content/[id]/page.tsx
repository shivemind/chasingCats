import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ContentForm } from '@/components/admin/content-form';

interface EditContentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContentPage({ params }: EditContentPageProps) {
  const { id } = await params;
  
  const [content, categories] = await Promise.all([
    prisma.content.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ]);

  if (!content) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Edit Content</h1>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <ContentForm content={content} categories={categories} />
      </div>
    </div>
  );
}
