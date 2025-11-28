'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

type PromoCountdownProps = {
  endDate: Date;
  className?: string;
  compact?: boolean;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateTimeLeft(endDate: Date): TimeLeft | null {
  const difference = endDate.getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function PromoCountdown({ endDate, className = '', compact = false }: PromoCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  // Hydration effect - valid use case for syncing with external timer
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(calculateTimeLeft(endDate));

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endDate);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(newTimeLeft);
      
      if (!newTimeLeft) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  // Don't render on server to avoid hydration mismatch
  if (!mounted || !timeLeft) {
    return null;
  }

  if (compact) {
    // Compact version for product cards
    if (timeLeft.days > 0) {
      return (
        <div className={`flex items-center gap-1 text-xs ${className}`}>
          <Clock className="h-3 w-3" />
          <span>{timeLeft.days}j {timeLeft.hours}h</span>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-1 text-xs ${className}`}>
        <Clock className="h-3 w-3" />
        <span>{timeLeft.hours}h {timeLeft.minutes}m</span>
      </div>
    );
  }

  // Full version for product detail page
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Clock className="h-5 w-5 text-red-500" />
      <div className="flex gap-2">
        {timeLeft.days > 0 && (
          <div className="text-center">
            <div className="bg-red-500 text-white font-bold rounded px-2 py-1 min-w-[2.5rem]">
              {timeLeft.days}
            </div>
            <div className="text-xs text-gray-500 mt-1">jours</div>
          </div>
        )}
        <div className="text-center">
          <div className="bg-red-500 text-white font-bold rounded px-2 py-1 min-w-[2.5rem]">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500 mt-1">heures</div>
        </div>
        <div className="text-center">
          <div className="bg-red-500 text-white font-bold rounded px-2 py-1 min-w-[2.5rem]">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500 mt-1">min</div>
        </div>
        <div className="text-center">
          <div className="bg-red-500 text-white font-bold rounded px-2 py-1 min-w-[2.5rem]">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500 mt-1">sec</div>
        </div>
      </div>
    </div>
  );
}
