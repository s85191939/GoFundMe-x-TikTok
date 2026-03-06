'use client';

import { useEffect, useState } from 'react';
import { abbreviateNumber } from '@/lib/formatters';

interface StatsBarProps {
  totalRaised: number;
  totalDonations: number;
  activeFundraisers: number;
}

function AnimatedNumber({ target, prefix = '' }: { target: number; prefix?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{prefix}{abbreviateNumber(current)}</span>;
}

export default function StatsBar({ totalRaised, totalDonations, activeFundraisers }: StatsBarProps) {
  const stats = [
    { label: 'raised', value: totalRaised, prefix: '$' },
    { label: 'donations', value: totalDonations, prefix: '' },
    { label: 'fundraisers', value: activeFundraisers, prefix: '' },
  ];

  return (
    <div className="flex divide-x divide-gray-200 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {stats.map((stat) => (
        <div key={stat.label} className="flex-1 text-center py-4 px-3">
          <p className="text-xl md:text-2xl font-bold text-gray-900">
            <AnimatedNumber target={stat.value} prefix={stat.prefix} />
          </p>
          <p className="text-xs text-gfm-gray mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
