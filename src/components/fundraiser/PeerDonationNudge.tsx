'use client';

import { useMemo } from 'react';
import { getPeerDonationNudge } from '@/lib/socialProof';

interface PeerDonationNudgeProps {
  fundraiserId: string;
}

export default function PeerDonationNudge({ fundraiserId }: PeerDonationNudgeProps) {
  const nudge = useMemo(() => getPeerDonationNudge(fundraiserId), [fundraiserId]);

  if (!nudge) return null;

  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
      <div className="flex items-center gap-3">
        {/* Overlapping avatars */}
        <div className="flex -space-x-2 shrink-0">
          {nudge.similarDonorAvatars.map((d, i) => (
            <img
              key={i}
              src={d.avatar}
              alt={d.name}
              title={d.name}
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
            />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-blue-600 font-medium">
            Joined by {nudge.similarDonorCount} others like you
          </p>
        </div>
      </div>

      <p className="mt-2 text-base font-bold text-blue-800">
        {nudge.nudgeMessage}
      </p>

      <p className="mt-0.5 text-xs text-blue-500">
        Based on {nudge.similarDonorCount} similar donors in your area
      </p>
    </div>
  );
}
