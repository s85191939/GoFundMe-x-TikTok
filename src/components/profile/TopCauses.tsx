'use client';

import type { Fundraiser, Donation } from '@/data/types';

const categoryEmoji: Record<string, string> = {
  emergency: '🚨',
  medical: '🏥',
  education: '📚',
  nonprofit: '💛',
  community: '🏘️',
  animals: '🐾',
  environment: '🌿',
  memorial: '🕊️',
  sports: '⚽',
  other: '✨',
};

interface TopCausesProps {
  fundraisers: Fundraiser[];
  donations: Donation[];
  allFundraisers?: Fundraiser[];
}

export default function TopCauses({ fundraisers, donations, allFundraisers = [] }: TopCausesProps) {
  // Gather categories from fundraisers they organized
  const categoryCounts: Record<string, number> = {};
  fundraisers.forEach(f => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });

  // Also count categories from fundraisers they donated to
  donations.forEach(d => {
    const fundraiser = allFundraisers.find(f => f.id === d.fundraiserId);
    if (fundraiser) {
      categoryCounts[fundraiser.category] = (categoryCounts[fundraiser.category] || 0) + 1;
    }
  });

  const sorted = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) return null;

  const maxCount = sorted[0][1];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Top Causes</h2>
      <div className="space-y-2">
        {sorted.map(([category, count]) => (
          <div key={category} className="flex items-center gap-3">
            <span className="text-lg w-7 text-center">{categoryEmoji[category] || '✨'}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                <span className="text-xs text-gray-500">{count} {count === 1 ? 'campaign' : 'campaigns'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00b964] to-[#00d775] rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
