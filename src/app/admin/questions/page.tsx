import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DeleteQuestionButton } from '@/components/admin/delete-question-button';
import { QuestionStatusBadge } from '@/components/admin/question-status-badge';
import type { Question } from '@prisma/client';

type QuestionWithRelations = Question & {
  author: { name: string | null; email: string | null } | null;
  event: { id: string; title: string; slug: string } | null;
  content: { id: string; title: string; slug: string } | null;
};

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { name: true, email: true }
      },
      event: {
        select: { id: true, title: true, slug: true }
      },
      content: {
        select: { id: true, title: true, slug: true }
      }
    }
  }) as QuestionWithRelations[];

  const pendingCount = questions.filter(q => q.status === 'PENDING').length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Questions</h1>
          <p className="mt-1 text-sm text-white/60 sm:mt-2 sm:text-base">
            {pendingCount} pending question{pendingCount !== 1 ? 's' : ''} • {questions.length} total
          </p>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 lg:hidden">
        {questions.map((question) => (
          <div key={question.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white line-clamp-2">{question.question}</p>
                <p className="mt-2 text-xs text-white/50">
                  by {question.author?.name ?? question.author?.email ?? 'Unknown'}
                </p>
              </div>
              <QuestionStatusBadge status={question.status} />
            </div>
            {question.event && (
              <p className="mt-2 text-xs text-neon-cyan">
                For: {question.event.title}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/50">
                {new Date(question.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/questions/${question.id}`}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                >
                  {question.status === 'PENDING' ? 'Answer' : 'View'}
                </Link>
                <DeleteQuestionButton questionId={question.id} />
              </div>
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/50">No questions submitted yet.</p>
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden rounded-2xl border border-white/10 bg-white/5 overflow-hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Question</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Author</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Related To</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">Date</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-white/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 max-w-md">
                  <p className="text-sm text-white line-clamp-2">{question.question}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-white">{question.author?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-white/50">{question.author?.email}</p>
                </td>
                <td className="px-6 py-4">
                  {question.event ? (
                    <Link 
                      href={`/admin/events/${question.event.id}`}
                      className="text-sm text-neon-cyan hover:text-white"
                    >
                      📅 {question.event.title}
                    </Link>
                  ) : question.content ? (
                    <Link 
                      href={`/admin/content/${question.content.id}`}
                      className="text-sm text-neon-purple hover:text-white"
                    >
                      📝 {question.content.title}
                    </Link>
                  ) : (
                    <span className="text-sm text-white/50">General AMA</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <QuestionStatusBadge status={question.status} />
                </td>
                <td className="px-6 py-4 text-sm text-white/70">
                  {new Date(question.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/questions/${question.id}`}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                    >
                      {question.status === 'PENDING' ? 'Answer' : 'View'}
                    </Link>
                    <DeleteQuestionButton questionId={question.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {questions.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-white/50">No questions submitted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
