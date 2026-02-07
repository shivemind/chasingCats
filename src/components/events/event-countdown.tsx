'use client';

import { useEffect, useState } from 'react';

interface EventCountdownProps {
  targetDate: string;
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

export function EventCountdown({ targetDate }: EventCountdownProps) {
  const timeLeft = useCountdown(new Date(targetDate));

  return (
    <div className="mt-4 flex justify-center gap-4">
      <div className="rounded-2xl bg-night px-6 py-4 text-center text-[#F5F1E3]">
        <p className="text-4xl font-bold">{timeLeft.days}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-[#F5F1E3]/60">Days</p>
      </div>
      <div className="rounded-2xl bg-night px-6 py-4 text-center text-[#F5F1E3]">
        <p className="text-4xl font-bold">{timeLeft.hours}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-[#F5F1E3]/60">Hours</p>
      </div>
      <div className="rounded-2xl bg-night px-6 py-4 text-center text-[#F5F1E3]">
        <p className="text-4xl font-bold">{timeLeft.minutes}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-[#F5F1E3]/60">Min</p>
      </div>
      <div className="rounded-2xl bg-night px-6 py-4 text-center text-[#F5F1E3]">
        <p className="text-4xl font-bold">{timeLeft.seconds}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-[#F5F1E3]/60">Sec</p>
      </div>
    </div>
  );
}
