'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Event } from '@prisma/client';

interface UpcomingExpertSessionProps {
  event: Event;
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export function UpcomingExpertSession({ event }: UpcomingExpertSessionProps) {
  const timeLeft = useCountdown(new Date(event.startTime));

  return (
    <section className="bg-[#F5F1E3]">
      <div className="container-section py-12">
        <div className="rounded-3xl border border-night/10 bg-white p-8 shadow-card md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/70">
                Upcoming Expert Session
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-night md:text-3xl">{event.title}</h2>
              <p className="mt-3 max-w-xl text-sm text-night/70">{event.description}</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/ask"
                  className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-dark"
                >
                  Submit your question
                </Link>
                <Link
                  href={`/events/${event.slug}`}
                  className="text-sm font-semibold text-night hover:text-brand-dark"
                >
                  Event details →
                </Link>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div className="rounded-2xl bg-night px-5 py-4 text-[#F5F1E3]">
                <p className="text-3xl font-bold">{timeLeft.days}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[#F5F1E3]/60">Days</p>
              </div>
              <div className="rounded-2xl bg-night px-5 py-4 text-[#F5F1E3]">
                <p className="text-3xl font-bold">{timeLeft.hours}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[#F5F1E3]/60">Hours</p>
              </div>
              <div className="rounded-2xl bg-night px-5 py-4 text-[#F5F1E3]">
                <p className="text-3xl font-bold">{timeLeft.minutes}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[#F5F1E3]/60">Min</p>
              </div>
              <div className="rounded-2xl bg-night px-5 py-4 text-[#F5F1E3]">
                <p className="text-3xl font-bold">{timeLeft.seconds}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[#F5F1E3]/60">Sec</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
