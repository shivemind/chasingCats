import { prisma } from '@/lib/prisma';
import { ContentCard } from '@/components/shared/content-card';
import { QuestionForm } from '@/components/ask/question-form';

export const metadata = {
  title: 'Ask Me Anything | Chasing Cats Club',
  description: 'Submit your questions for Rachel, Sebastian, and their network of wild cat experts.'
};

export default async function AskPage() {
  const [content, questions] = await Promise.all([
    prisma.content.findMany({
      where: { category: { slug: 'ask-me-anything' } },
      orderBy: { publishedAt: 'desc' }
    }),
    prisma.question.findMany({
      include: {
        author: true
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  ]);

  return (
    <div className="bg-white">
      <section className="container-section py-12 sm:py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-brand/70">Ask Me Anything</p>
          <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl font-semibold text-night">Your direct line to cat experts.</h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-night/70">
            Submit questions ahead of upcoming talks, browse the archive, and follow along as the community taps into Sebastian and Rachel&apos;s network.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 sm:space-y-8">
            <div className="rounded-2xl sm:rounded-3xl border border-night/10 bg-white p-5 sm:p-8">
              <QuestionForm />
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {content.map((item) => (
                <ContentCard key={item.id} content={item} eyebrow="AMA" />
              ))}
            </div>
          </div>
          <aside className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-night/10 bg-[#F5F1E3]/60 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-night">Latest community questions</h2>
            <div className="space-y-3 sm:space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 text-xs sm:text-sm text-night/80">
                  <p className="font-semibold text-night">{question.author?.name ?? 'Member'} asks:</p>
                  <p className="mt-2 line-clamp-3">{question.question}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
