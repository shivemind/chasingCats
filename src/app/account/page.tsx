import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ManageSubscriptionButton } from '@/components/account/manage-subscription-button';

async function getAccountData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      memberships: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      watchStatuses: {
        include: {
          content: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 3
      },
      questions: {
        include: {
          content: true
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  });
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/account');
  }

  const user = await getAccountData(session.user.id);

  if (!user) {
    redirect('/login');
  }

  const membership = user.memberships[0];

  return (
    <div className="bg-white">
      <section className="container-section py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand/70">Your profile</p>
          <h1 className="mt-4 text-4xl font-semibold text-night">Welcome back, {user.name ?? user.profile?.username}</h1>
          <p className="mt-4 text-night/70">
            Track your membership, update your profile, and jump back into the content you love.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-night/10 bg-brand/10 p-6 text-center">
            <p className="text-3xl font-bold text-brand-dark">{user.watchStatuses.filter(w => w.watched).length}</p>
            <p className="mt-1 text-sm font-medium text-night/70">Episodes watched</p>
          </div>
          <div className="rounded-2xl border border-night/10 bg-brand/10 p-6 text-center">
            <p className="text-3xl font-bold text-brand-dark">{user.watchStatuses.filter(w => w.watched && w.content.type === 'COURSE').length}</p>
            <p className="mt-1 text-sm font-medium text-night/70">Completed classes</p>
          </div>
          <div className="rounded-2xl border border-night/10 bg-[#F5F1E3]/60 p-6 text-center">
            <p className="text-3xl font-bold text-night">{user.questions.length}</p>
            <p className="mt-1 text-sm font-medium text-night/70">Questions asked</p>
          </div>
          <div className="rounded-2xl border border-night/10 bg-[#F5F1E3]/60 p-6 text-center">
            <p className="text-3xl font-bold text-night">{user.watchStatuses.length}</p>
            <p className="mt-1 text-sm font-medium text-night/70">In your watchlist</p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-night/10 bg-[#F5F1E3]/50 p-8">
              <h2 className="text-lg font-semibold text-night">Membership</h2>
              <p className="mt-2 text-sm text-night/70">
                Status:{' '}
                <span className="font-semibold text-night">{membership?.status ?? 'INACTIVE'}</span>
              </p>
              <p className="mt-2 text-sm text-night/70">
                Plan:{' '}
                <span className="font-semibold text-night">{membership?.plan ?? 'Not selected'}</span>
              </p>
              <ManageSubscriptionButton />
              <div className="mt-4 text-xs text-night/60">
                Need to switch plans? Cancel anytime via Stripe billing portal.
              </div>
            </div>

            <div className="rounded-3xl border border-night/10 bg-white p-8">
              <h2 className="text-lg font-semibold text-night">Profile details</h2>
              <dl className="mt-4 grid gap-4 text-sm text-night/70">
                <div>
                  <dt className="font-semibold text-night">Name</dt>
                  <dd>{user.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-night">Username</dt>
                  <dd>{user.profile?.username ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-night">Email</dt>
                  <dd>{user.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-night">Favorite cat</dt>
                  <dd>{user.profile?.favoriteCat ?? 'Tell us your favorite cat in your profile!'}</dd>
                </div>
              </dl>
              <Link href="/profile/edit" className="mt-6 inline-flex text-sm font-semibold text-brand hover:text-brand-dark">
                Update profile →
              </Link>
            </div>

            <div className="rounded-3xl border border-night/10 bg-white p-8">
              <h2 className="text-lg font-semibold text-night">Recent AMA questions</h2>
              <div className="mt-4 space-y-4">
                {user.questions.length === 0 ? (
                  <p className="text-sm text-night/60">
                    You haven&apos;t asked a question yet. <Link href="/ask" className="font-semibold text-brand">Submit one now.</Link>
                  </p>
                ) : (
                  user.questions.map((question) => (
                    <div key={question.id} className="rounded-2xl bg-[#F5F1E3]/60 p-4">
                      <p className="text-sm font-medium text-night">{question.question}</p>
                      {question.content ? (
                        <p className="mt-1 text-xs text-night/60">Linked content: {question.content.title}</p>
                      ) : null}
                      <p className="mt-2 text-xs uppercase tracking-wide text-night/50">{question.status}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-night/10 bg-white p-8">
              <h2 className="text-lg font-semibold text-night">Continue watching</h2>
              <ul className="mt-4 space-y-4 text-sm text-night/70">
                {user.watchStatuses.length === 0 ? (
                  <li>
                    Explore the archive and mark sessions as watched.
                    <Link href="/experts" className="ml-1 font-semibold text-brand">
                      Start now
                    </Link>
                  </li>
                ) : (
                  user.watchStatuses.map((watch) => (
                    <li key={watch.id} className="rounded-2xl border border-night/10 bg-[#F5F1E3]/60 p-4">
                      <Link href={`/${watch.content.slug}`} className="font-semibold text-night">
                        {watch.content.title}
                      </Link>
                      <p className="mt-1 text-xs uppercase tracking-wide text-night/50">
                        {watch.content.type.toLowerCase()} • {watch.watched ? 'Watched' : 'In progress'}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-3xl border border-night/10 bg-[#F5F1E3]/50 p-8">
              <h2 className="text-lg font-semibold text-night">Member perks</h2>
              <ul className="mt-4 space-y-3 text-sm text-night/70">
                <li>Invite a friend: share your referral code for a free month.</li>
                <li>Book a 60-minute strategy session if you&apos;re on the annual plan.</li>
                <li>Check the shop for exclusive merch drops and photo critiques.</li>
              </ul>
              <Link href="/shop" className="mt-4 inline-flex text-sm font-semibold text-brand hover:text-brand-dark">
                Visit the shop →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
