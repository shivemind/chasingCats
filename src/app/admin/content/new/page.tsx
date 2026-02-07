import { prisma } from '@/lib/prisma';
import { ContentForm } from '@/components/admin/content-form';

export default async function NewContentPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Add New Content</h1>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <ContentForm categories={categories} />
      </div>
    </div>
  );
}
