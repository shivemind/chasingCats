import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DeleteContentButton } from '@/components/admin/delete-content-button';
import type { Content, Category } from '@prisma/client';

type ContentWithCategory = Content & { category: Category | null };

export default async function AdminContentPage() {
  const contents = await prisma.content.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  }) as ContentWithCategory[];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <p className="mt-2 text-white/60">Create and manage videos, articles, talks, and courses</p>
        </div>
        <Link
          href="/admin/content/new"
          className="rounded-xl bg-gradient-to-r from-neon-cyan to-brand px-6 py-3 text-sm font-semibold text-night transition hover:shadow-glow"
        >
          + Add Content
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Published</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-white/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((content) => (
              <tr key={content.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{content.title}</p>
                  <p className="text-xs text-white/50">{content.slug}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    content.type === 'VIDEO' ? 'bg-neon-purple/20 text-neon-purple' :
                    content.type === 'TALK' ? 'bg-neon-cyan/20 text-neon-cyan' :
                    content.type === 'COURSE' ? 'bg-accent/20 text-accent' :
                    content.type === 'ARTICLE' ? 'bg-brand/20 text-brand-light' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {content.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white/70">
                  {content.category?.name ?? '—'}
                </td>
                <td className="px-6 py-4 text-sm text-white/70">
                  {content.publishedAt 
                    ? new Date(content.publishedAt).toLocaleDateString()
                    : <span className="text-accent">Draft</span>
                  }
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/content/${content.id}`}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                    >
                      Edit
                    </Link>
                    <DeleteContentButton contentId={content.id} contentTitle={content.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {contents.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-white/50">No content yet. Create your first piece of content!</p>
          </div>
        )}
      </div>
    </div>
  );
}
