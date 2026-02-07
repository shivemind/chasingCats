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
    <div className="min-h-screen bg-gradient-to-br from-deep-space via-midnight to-night">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 h-64 w-64 rounded-full bg-neon-cyan/5 blur-3xl" />
        <div className="absolute bottom-40 left-1/4 h-64 w-64 rounded-full bg-neon-purple/5 blur-3xl" />
      </div>

      <section className="container-section relative py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neon-cyan">Your profile</p>
          <h1 className="mt-4 text-4xl font-bold text-white">Welcome back, {user.name ?? user.profile?.username}</h1>
          <p className="mt-4 text-white/60">
            Track your membership, update your profile, and jump back into the content you love.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl border border-neon-cyan/20 bg-white/5 p-6 text-center backdrop-blur-sm transition hover:border-neon-cyan/40 hover:shadow-glow">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/10">
              <svg className="h-6 w-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-neon-cyan">{user.watchStatuses.filter(w => w.watched).length}</p>
            <p className="mt-1 text-sm font-medium text-white/50">Episodes watched</p>
          </div>
          <div className="group rounded-2xl border border-neon-purple/20 bg-white/5 p-6 text-center backdrop-blur-sm transition hover:border-neon-purple/40 hover:shadow-glow-purple">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neon-purple/10">
              <svg className="h-6 w-6 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-neon-purple">{user.watchStatuses.filter(w => w.watched && w.content.type === 'COURSE').length}</p>
            <p className="mt-1 text-sm font-medium text-white/50">Completed classes</p>
          </div>
          <div className="group rounded-2xl border border-cat-eye/20 bg-white/5 p-6 text-center backdrop-blur-sm transition hover:border-cat-eye/40 hover:shadow-glow-cat-eye">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cat-eye/10">
              <svg className="h-6 w-6 text-cat-eye" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-cat-eye">{user.questions.length}</p>
            <p className="mt-1 text-sm font-medium text-white/50">Questions asked</p>
          </div>
          <div className="group rounded-2xl border border-brand/20 bg-white/5 p-6 text-center backdrop-blur-sm transition hover:border-brand/40 hover:shadow-glow-accent">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
              <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-brand">{user.watchStatuses.length}</p>
            <p className="mt-1 text-sm font-medium text-white/50">In your watchlist</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            {/* Membership Card */}
            <div className="rounded-3xl border border-neon-cyan/20 bg-white/5 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-cyan/10">
                  <svg className="h-5 w-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Membership</h2>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Status</p>
                  <p className="mt-1 font-semibold text-neon-cyan">{membership?.status ?? 'INACTIVE'}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Plan</p>
                  <p className="mt-1 font-semibold text-white">{membership?.plan ?? 'Not selected'}</p>
                </div>
              </div>
              <ManageSubscriptionButton />
              <p className="mt-4 text-xs text-white/40">
                Need to switch plans? Cancel anytime via Stripe billing portal.
              </p>
            </div>

            {/* Profile Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/10">
                  <svg className="h-5 w-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Profile details</h2>
              </div>
              <dl className="mt-6 grid gap-4 text-sm">
                <div className="rounded-xl bg-white/5 p-4">
                  <dt className="text-xs text-white/50">Name</dt>
                  <dd className="mt-1 font-medium text-white">{user.name ?? '—'}</dd>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <dt className="text-xs text-white/50">Username</dt>
                  <dd className="mt-1 font-medium text-white">@{user.profile?.username ?? '—'}</dd>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <dt className="text-xs text-white/50">Email</dt>
                  <dd className="mt-1 font-medium text-white">{user.email ?? '—'}</dd>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <dt className="text-xs text-white/50">Favorite cat</dt>
                  <dd className="mt-1 font-medium text-cat-eye">{user.profile?.favoriteCat ?? 'Tell us your favorite!'}</dd>
                </div>
              </dl>
              <Link href="/profile/edit" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neon-cyan transition hover:text-white">
                Update profile <span>→</span>
              </Link>
            </div>

            {/* Questions Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cat-eye/10">
                  <svg className="h-5 w-5 text-cat-eye" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Recent AMA questions</h2>
              </div>
              <div className="mt-6 space-y-4">
                {user.questions.length === 0 ? (
                  <p className="text-sm text-white/50">
                    You haven&apos;t asked a question yet. <Link href="/ask" className="font-semibold text-neon-cyan hover:text-white">Submit one now.</Link>
                  </p>
                ) : (
                  user.questions.map((question) => (
                    <div key={question.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-medium text-white">{question.question}</p>
                      {question.content ? (
                        <p className="mt-1 text-xs text-white/40">Linked: {question.content.title}</p>
                      ) : null}
                      <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        question.status === 'ANSWERED' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/10 text-white/50'
                      }`}>
                        {question.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            {/* Continue Watching */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                  <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Continue watching</h2>
              </div>
              <ul className="mt-6 space-y-4">
                {user.watchStatuses.length === 0 ? (
                  <li className="text-sm text-white/50">
                    Explore the archive and mark sessions as watched.
                    <Link href="/experts" className="ml-1 font-semibold text-neon-cyan hover:text-white">
                      Start now
                    </Link>
                  </li>
                ) : (
                  user.watchStatuses.map((watch) => (
                    <li key={watch.id} className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-neon-cyan/30">
                      <Link href={`/${watch.content.slug}`} className="font-semibold text-white hover:text-neon-cyan">
                        {watch.content.title}
                      </Link>
                      <p className="mt-1 flex items-center gap-2 text-xs text-white/40">
                        <span className="uppercase">{watch.content.type.toLowerCase()}</span>
                        <span>•</span>
                        <span className={watch.watched ? 'text-neon-cyan' : 'text-cat-eye'}>
                          {watch.watched ? '✓ Watched' : 'In progress'}
                        </span>
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Member Perks */}
            <div className="rounded-3xl border border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 to-transparent p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/20">
                  <svg className="h-5 w-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Member perks</h2>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple">✓</span>
                  Invite a friend: share your referral code for a free month.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple">✓</span>
                  Book a 60-minute strategy session if you&apos;re on the annual plan.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple">✓</span>
                  Exclusive merch drops and photo critiques.
                </li>
              </ul>
              <Link href="/shop" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neon-purple transition hover:text-white">
                Visit the shop <span>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
