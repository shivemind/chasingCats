'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ManageSubscriptionButton } from './manage-subscription-button';
import { NextTalk } from '@/components/dashboard/next-talk';
import { ContentCarousel } from '@/components/dashboard/content-carousel';
import { AskSection } from '@/components/dashboard/ask-section';
import { ExpeditionPromo } from '@/components/dashboard/expedition-promo';
import { FeedPreview, type FeedPreviewPost } from '@/components/dashboard/feed-preview';
import { ContentImage } from '@/components/shared/content-image';

interface DashboardProps {
  user: {
    name: string | null;
    email: string | null;
    profile: { username: string; favoriteCat: string | null } | null;
    membership: { status: string; plan: string; hasStripeCustomer: boolean } | null;
    stats: {
      watched: number;
      courses: number;
      questions: number;
      watchlist: number;
    };
    questions: Array<{
      id: string;
      question: string;
      answer: string | null;
      status: string;
      answeredAt: Date | null;
      contentTitle: string | null;
      eventTitle: string | null;
    }>;
    watchStatuses: Array<{
      id: string;
      watched: boolean;
      content: { title: string; slug: string; type: string };
    }>;
  };
  nextTalk?: {
    id: string;
    title: string;
    speaker: string;
    speakerTitle?: string;
    description: string;
    scheduledAt: Date;
    slug: string;
  } | null;
  expertsContent?: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    author?: string;
    duration?: string;
  }>;
  fieldContent?: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    author?: string;
    duration?: string;
  }>;
  latestContent?: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    duration?: string;
    type: string;
    category?: string | null;
    publishedAt: Date | null;
  }>;
  feedPosts?: FeedPreviewPost[];
}

// Floating particle component
function Particle({ delay, duration, size, color, left, top }: {
  delay: number; duration: number; size: number; color: string; left: string; top: string;
}) {
  return (
    <div
      className="absolute rounded-full opacity-0 animate-float-particle"
      style={{
        width: size,
        height: size,
        background: color,
        left,
        top,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
    />
  );
}

// Animated counter component
function AnimatedCounter({ value, duration = 2000, color }: { value: number; duration?: number; color: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref} className={`text-2xl sm:text-3xl md:text-4xl font-black ${color}`}>
      {count}
    </span>
  );
}

// Glowing orb background
function GlowingOrbs() {
  const [particles, setParticles] = useState<Array<{
    id: number; delay: number; duration: number; size: number; color: string; left: string; top: string;
  }>>([]);

  // Generate particles only on client after mount to avoid hydration mismatch
  useEffect(() => {
    const colors = ['#00f5d4', '#a855f7', '#facc15', '#22d3ee'];
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * 4)],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main orbs */}
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-neon-cyan/20 to-transparent blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-60 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-neon-purple/20 to-transparent blur-3xl animate-pulse-slow animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-cat-eye/10 to-transparent blur-3xl animate-spin-slow" />
      
      {/* Floating particles - rendered only after mount */}
      {particles.map((p) => (
        <Particle
          key={p.id}
          delay={p.delay}
          duration={p.duration}
          size={p.size}
          color={p.color}
          left={p.left}
          top={p.top}
        />
      ))}
      
      {/* Cat eye decorations */}
      <div className="absolute top-20 left-20 flex gap-4 animate-float">
        <div className="h-6 w-3 rounded-full bg-cat-eye shadow-[0_0_20px_#facc15] animate-blink" />
        <div className="h-6 w-3 rounded-full bg-cat-eye shadow-[0_0_20px_#facc15] animate-blink animation-delay-100" />
      </div>
      <div className="absolute bottom-40 right-20 flex gap-4 animate-float animation-delay-3000">
        <div className="h-8 w-4 rounded-full bg-cat-eye-green shadow-[0_0_25px_#22c55e] animate-blink animation-delay-500" />
        <div className="h-8 w-4 rounded-full bg-cat-eye-green shadow-[0_0_25px_#22c55e] animate-blink animation-delay-600" />
      </div>
      <div className="absolute top-1/3 right-1/4 flex gap-3 animate-float animation-delay-1500 opacity-50">
        <div className="h-4 w-2 rounded-full bg-neon-cyan shadow-[0_0_15px_#00f5d4] animate-blink animation-delay-200" />
        <div className="h-4 w-2 rounded-full bg-neon-cyan shadow-[0_0_15px_#00f5d4] animate-blink animation-delay-300" />
      </div>
    </div>
  );
}

// Stat card with hover effects
function StatCard({ icon, value, label, color, glowColor, delay }: {
  icon: React.ReactNode; value: number; label: string; color: string; glowColor: string; delay: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border bg-white/5 p-4 sm:p-6 text-center backdrop-blur-xl transition-all duration-500 cursor-pointer
        ${isHovered ? `border-${color}/60 scale-105 shadow-2xl` : `border-${color}/20`}`}
      style={{
        boxShadow: isHovered ? `0 0 40px ${glowColor}40, 0 0 80px ${glowColor}20` : 'none',
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-${color}/20 to-transparent opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : ''}`}
      />
      
      {/* Scanning line effect - hidden on mobile */}
      <div className={`absolute inset-0 overflow-hidden ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity hidden sm:block`}>
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-scan" />
      </div>

      {/* Icon with pulse effect */}
      <div className={`relative mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-${color}/10 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-${color}/20 animate-ping-slow ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        <div className="scale-75 sm:scale-100">{icon}</div>
      </div>

      {/* Animated counter */}
      <AnimatedCounter value={value} color={`text-${color}`} />
      
      <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-white/60 line-clamp-1">{label}</p>

      {/* Corner accents */}
      <div className={`absolute top-0 left-0 h-8 w-px bg-gradient-to-b from-${color} to-transparent transition-opacity ${isHovered ? 'opacity-100' : 'opacity-30'}`} />
      <div className={`absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-${color} to-transparent transition-opacity ${isHovered ? 'opacity-100' : 'opacity-30'}`} />
      <div className={`absolute bottom-0 right-0 h-8 w-px bg-gradient-to-t from-${color} to-transparent transition-opacity ${isHovered ? 'opacity-100' : 'opacity-30'}`} />
      <div className={`absolute bottom-0 right-0 w-8 h-px bg-gradient-to-l from-${color} to-transparent transition-opacity ${isHovered ? 'opacity-100' : 'opacity-30'}`} />
    </div>
  );
}

// Format relative time
function formatRelativeTime(date: Date | null): string {
  if (!date) return '';
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Main dashboard component
export function AnimatedDashboard({ user, nextTalk, expertsContent = [], fieldContent = [], latestContent = [], feedPosts = [] }: DashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0a1a] via-[#0d1025] to-[#0a0a1a]">
      <GlowingOrbs />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <section className={`container-section relative py-8 sm:py-12 md:py-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header with animated gradient text */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-neon-cyan animate-pulse-slow">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-neon-cyan animate-ping" />
            Dashboard Active
          </div>
          
          <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-purple bg-clip-text text-transparent animate-gradient-x">
              Welcome back,
            </span>
            <br />
            <span className="text-white break-words">{user.name ?? user.profile?.username}</span>
          </h1>
          
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/50">
            Your personal command center for wild cat mastery.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8 md:mb-12">
          <StatCard
            icon={<svg className="h-8 w-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            value={user.stats.watched}
            label="Episodes Watched"
            color="neon-cyan"
            glowColor="#00f5d4"
            delay={0}
          />
          <StatCard
            icon={<svg className="h-8 w-8 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
            value={user.stats.courses}
            label="Courses Completed"
            color="neon-purple"
            glowColor="#a855f7"
            delay={100}
          />
          <StatCard
            icon={<svg className="h-8 w-8 text-cat-eye" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            value={user.stats.questions}
            label="Questions Asked"
            color="cat-eye"
            glowColor="#facc15"
            delay={200}
          />
          <StatCard
            icon={<svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>}
            value={user.stats.watchlist}
            label="In Watchlist"
            color="brand"
            glowColor="#22d3ee"
            delay={300}
          />
        </div>

        {/* Pride Feed - Prominent Section */}
        <div className="mb-6 sm:mb-8">
          <FeedPreview posts={feedPosts} />
        </div>

        {/* Next Talk Section */}
        <div className="mb-6 sm:mb-8">
          <NextTalk talk={nextTalk ?? null} />
        </div>

        {/* From the Experts */}
        {expertsContent.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <ContentCarousel
              title="From the Experts"
              description="Tune in for video interviews with our cat nerd friends around the world"
              icon="🎓"
              items={expertsContent}
              viewAllHref="/experts"
              accentColor="cyan"
            />
          </div>
        )}

        {/* Into the Field */}
        {fieldContent.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <ContentCarousel
              title="Into the Field"
              description="Wildlife photography and tracking tips and tricks"
              icon="🌍"
              items={fieldContent}
              viewAllHref="/field"
              accentColor="purple"
            />
          </div>
        )}

        {/* Latest from the Team */}
        {latestContent.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <section className="rounded-2xl border border-cat-eye/30 bg-gradient-to-br from-cat-eye/5 to-transparent p-4 sm:p-6 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-cat-eye/20">
                    <span className="text-xl sm:text-2xl">✨</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Latest from the Team</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Recently uploaded content from our experts</p>
                  </div>
                </div>
                <Link 
                  href="/content" 
                  className="text-sm font-semibold text-cat-eye hover:underline self-start sm:self-auto"
                >
                  View All →
                </Link>
              </div>
              
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {latestContent.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.slug}`}
                    className="group flex gap-3 sm:gap-4 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 transition-all hover:border-cat-eye/40 hover:bg-white/10"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-16 w-24 sm:h-20 sm:w-28 flex-shrink-0 overflow-hidden rounded-lg">
                      <ContentImage
                        src={item.thumbnail}
                        alt={item.title}
                        type={item.type}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.duration && (
                        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white z-10">
                          {item.duration}
                        </span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-white line-clamp-2 group-hover:text-cat-eye transition-colors">
                        {item.title}
                      </p>
                      <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
                          {item.type}
                        </span>
                        {item.publishedAt && (
                          <span className="text-[10px] text-white/40">
                            {formatRelativeTime(item.publishedAt)}
                          </span>
                        )}
                      </div>
                      {item.category && (
                        <p className="mt-1 text-[10px] text-cat-eye/70 truncate">{item.category}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Ask Me Anything */}
        <div className="mb-6 sm:mb-8">
          <AskSection
            recentQuestions={user.questions.slice(0, 5).map(q => ({
              id: q.id,
              question: q.question,
              answer: q.answer,
              status: q.status === 'ANSWERED' ? 'answered' : 'pending',
              answeredAt: q.answeredAt,
              eventTitle: q.eventTitle,
            }))}
          />
        </div>

        {/* Cat Expeditions Promo */}
        <div className="mb-6 sm:mb-8">
          <ExpeditionPromo />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 sm:space-y-8">
            {/* Membership Card - Premium feel */}
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neon-cyan/30 bg-gradient-to-br from-white/10 to-white/5 p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:border-neon-cyan/50 hover:shadow-[0_0_50px_rgba(0,245,212,0.15)]">
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-neon-cyan/20 blur-3xl transition-transform group-hover:scale-150" />
              
              <div className="relative flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple shadow-lg">
                  <svg className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">Membership Status</h2>
                  <p className="text-xs sm:text-sm text-white/50 truncate">Your subscription details</p>
                </div>
              </div>

              <div className="relative mt-6 sm:mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 transition-colors hover:bg-white/10">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">Status</p>
                  <p className="mt-2 text-xl sm:text-2xl font-bold text-neon-cyan break-words">{user.membership?.status ?? 'INACTIVE'}</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 transition-colors hover:bg-white/10">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">Plan</p>
                  <p className="mt-2 text-xl sm:text-2xl font-bold text-white break-words">{user.membership?.plan ?? 'Free'}</p>
                </div>
              </div>

              <div className="relative mt-6">
                <ManageSubscriptionButton hasStripeCustomer={user.membership?.hasStripeCustomer ?? false} />
              </div>
            </div>

            {/* Profile Card */}
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neon-purple/30 bg-gradient-to-br from-white/10 to-white/5 p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:border-neon-purple/50">
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-neon-purple/20 blur-3xl transition-transform group-hover:scale-150" />
              
              <div className="relative flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-neon-purple to-pink-500 shadow-lg">
                  <svg className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">Profile Details</h2>
                  <p className="text-xs sm:text-sm text-white/50 truncate">Your personal information</p>
                </div>
              </div>

              <div className="relative mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                {[
                  { label: 'Name', value: user.name ?? '—' },
                  { label: 'Username', value: `@${user.profile?.username ?? '—'}` },
                  { label: 'Email', value: user.email ?? '—' },
                  { label: 'Favorite Cat', value: user.profile?.favoriteCat ?? 'Tell us!', highlight: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 transition-colors hover:bg-white/10">
                    <span className="text-xs sm:text-sm text-white/50 flex-shrink-0">{item.label}</span>
                    <span className={`text-sm font-medium text-right break-words ${item.highlight ? 'text-cat-eye' : 'text-white'}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <Link href="/profile/edit" className="relative mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-xl bg-neon-purple/20 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-neon-purple transition-all hover:bg-neon-purple/30 hover:shadow-lg">
                Edit Profile
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 sm:space-y-8">
            {/* Continue Watching */}
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand/30 bg-gradient-to-br from-white/10 to-white/5 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-brand to-neon-cyan shadow-lg">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">Continue Watching</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {user.watchStatuses.length === 0 ? (
                  <div className="rounded-xl sm:rounded-2xl border border-dashed border-white/20 p-6 sm:p-8 text-center">
                    <p className="text-sm sm:text-base text-white/50">No content yet</p>
                    <Link href="/experts" className="mt-2 inline-block text-sm text-neon-cyan hover:underline">Start exploring →</Link>
                  </div>
                ) : (
                  user.watchStatuses.map((watch) => (
                    <Link
                      key={watch.id}
                      href={`/${watch.content.slug}`}
                      className="group/item flex items-center gap-3 sm:gap-4 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 transition-all hover:border-neon-cyan/50 hover:bg-white/10"
                    >
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-white/10">
                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-neon-cyan" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-white truncate group-hover/item:text-neon-cyan transition-colors">
                          {watch.content.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-white/40 uppercase">{watch.content.type}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] sm:text-xs font-medium ${watch.watched ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-cat-eye/20 text-cat-eye'}`}>
                        {watch.watched ? '✓' : '···'}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl sm:rounded-3xl border border-cat-eye/30 bg-gradient-to-br from-cat-eye/10 to-transparent p-6 sm:p-8 backdrop-blur-xl">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: '🎥', label: 'Browse Library', href: '/library' },
                  { icon: '❓', label: 'Ask Question', href: '/ask' },
                  { icon: '📅', label: 'View Events', href: '/experts' },
                  { icon: '🛍️', label: 'Visit Shop', href: '/shop' },
                ].map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 transition-all hover:border-cat-eye/50 hover:bg-white/10 hover:scale-105"
                  >
                    <span className="text-xl sm:text-2xl">{action.icon}</span>
                    <span className="text-[10px] sm:text-xs font-medium text-white/70 text-center line-clamp-2">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
