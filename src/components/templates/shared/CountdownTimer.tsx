"use client";

import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string | Date;
  themeStyle?: {
    containerClass?: string;
    boxClass?: string;
    numberClass?: string;
    labelClass?: string;
  };
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getRemainingTime(targetDate: string | Date): TimeRemaining {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const difference = Math.max(0, target - now);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  themeStyle,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => getRemainingTime(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getRemainingTime(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "Hari", value: timeLeft.days },
    { label: "Jam", value: timeLeft.hours },
    { label: "Menit", value: timeLeft.minutes },
    { label: "Detik", value: timeLeft.seconds },
  ];

  return (
    <div
      suppressHydrationWarning
      className={`flex items-center justify-center gap-1.5 sm:gap-4 my-6 max-w-full overflow-hidden px-1 ${
        themeStyle?.containerClass ?? ""
      }`}
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          suppressHydrationWarning
          className={`flex flex-col items-center justify-center flex-1 min-w-[52px] max-w-[76px] py-2.5 px-1 sm:p-3 rounded-2xl shadow-sm border ${
            themeStyle?.boxClass ?? "bg-white/80 border-stone-200"
          }`}
        >
          <span
            suppressHydrationWarning
            className={`text-lg sm:text-2xl font-bold tracking-tight ${
              themeStyle?.numberClass ?? "text-stone-900 font-bold"
            }`}
          >
            {String(unit.value).padStart(2, "0")}
          </span>
          <span
            className={`text-[9px] sm:text-xs uppercase tracking-wider font-semibold mt-0.5 sm:mt-1 ${
              themeStyle?.labelClass ?? "text-stone-600"
            }`}
          >
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
