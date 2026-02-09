import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AnswerQuestionForm } from '@/components/admin/answer-question-form';

interface QuestionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminQuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { id } = await params;
  
  const question = await prisma.question.findUnique({
    where: { id },
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
  });

  if (!question) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/admin/questions" 
          className="text-sm text-neon-cyan hover:text-white"
        >
          ← Back to Questions
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Question Details */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-bold text-white mb-4">Question Details</h1>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">From</p>
              <p className="mt-1 text-white">{question.author?.name ?? 'Unknown'}</p>
              <p className="text-sm text-white/60">{question.author?.email}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Question</p>
              <p className="mt-1 text-white whitespace-pre-wrap">{question.question}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Related To</p>
              <p className="mt-1">
                {question.event ? (
                  <Link 
                    href={`/admin/events/${question.event.id}`}
                    className="text-neon-cyan hover:text-white"
                  >
                    📅 {question.event.title}
                  </Link>
                ) : question.content ? (
                  <Link 
                    href={`/admin/content/${question.content.id}`}
                    className="text-neon-purple hover:text-white"
                  >
                    📝 {question.content.title}
                  </Link>
                ) : (
                  <span className="text-white/50">General AMA</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Submitted</p>
              <p className="mt-1 text-white">
                {new Date(question.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Status</p>
              <p className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                question.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                question.status === 'ANSWERED' ? 'bg-green-500/20 text-green-400' :
                'bg-white/10 text-white/50'
              }`}>
                {question.status}
              </p>
            </div>
          </div>
        </div>

        {/* Answer Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Answer</h2>
          <AnswerQuestionForm 
            questionId={question.id} 
            currentAnswer={question.answer}
            currentStatus={question.status}
          />
          
          {question.answeredAt && (
            <p className="mt-4 text-xs text-white/50">
              Last answered: {new Date(question.answeredAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
