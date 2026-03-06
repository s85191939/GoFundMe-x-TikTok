'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/formatters';

interface DonationProgressBarProps {
  raised: number;
  goal: number;
  donationCount: number;
}

export default function DonationProgressBar({ raised, goal, donationCount }: DonationProgressBarProps) {
  const [width, setWidth] = useState(0);
  const percentage = Math.min(Math.round((raised / goal) * 100), 100);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="space-y-3">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gfm-green rounded-full progress-bar-fill"
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{formatCurrency(raised)}</span>
        <span className="text-gfm-gray text-sm">raised of {formatCurrency(goal)} goal</span>
      </div>
      <p className="text-gfm-gray text-sm">
        <span className="font-medium text-gray-700">{donationCount.toLocaleString()}</span> donations
      </p>
    </div>
  );
}
