import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DeleteContentButton } from '@/components/admin/delete-content-button';
import type { Content, Category } from '@prisma/client';

type ContentWithCategory = Content & { category: Category | null };

export default async function AdminContentPage() {
  const contents = await prisma.content.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  }) as unknown as ContentWithCategory[];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Content Management</h1>
          <p className="mt-1 text-sm text-white/60 sm:mt-2 sm:text-base">Create and manage videos, articles, talks, and courses</p>
        </div>
        <Link
          href="/admin/content/new"
          className="rounded-xl bg-gradient-to-r from-neon-cyan to-brand px-4 py-2.5 text-center text-sm font-semibold text-night transition hover:shadow-glow sm:px-6 sm:py-3"
        >
          + Add Content
        </Link>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 lg:hidden">
        {contents.map((content) => (
          <div key={content.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white truncate">{content.title}</p>
                <p className="text-xs text-white/50 truncate">{content.slug}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                content.type === 'VIDEO' ? 'bg-neon-purple/20 text-neon-purple' :
                content.type === 'TALK' ? 'bg-neon-cyan/20 text-neon-cyan' :
                content.type === 'COURSE' ? 'bg-accent/20 text-accent' :
                content.type === 'ARTICLE' ? 'bg-brand/20 text-brand-light' :
                'bg-white/10 text-white/70'
              }`}>
                {content.type}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/50">
                {content.publishedAt 
                  ? new Date(content.publishedAt).toLocaleDateString()
                  : <span className="text-accent">Draft</span>
                }
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/content/${content.id}`}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                >
                  Edit
                </Link>
                <DeleteContentButton contentId={content.id} contentTitle={content.title} />
              </div>
            </div>
          </div>
        ))}
        {contents.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/50">No content yet. Create your first piece of content!</p>
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden rounded-2xl border border-white/10 bg-white/5 overflow-hidden lg:block">
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
