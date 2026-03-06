'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Donation } from '@/data/types';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';

interface DonationsListProps {
  donations: Donation[];
}

export default function DonationsList({ donations }: DonationsListProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? donations : donations.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Donations ({donations.length})</h2>
        {donations.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-gfm-green font-semibold hover:underline"
          >
            {showAll ? 'Show less' : 'See all'}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {visible.map((donation) => (
          <div key={donation.id} className="flex items-start gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gfm-green-light flex items-center justify-center text-gfm-green font-bold text-sm flex-shrink-0">
              {donation.isAnonymous ? '?' : donation.donorName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                {donation.donorId && !donation.isAnonymous ? (
                  <Link href={`/profile/${donation.donorId}`} className="font-semibold text-sm text-gray-900 hover:text-gfm-green">
                    {donation.donorName}
                  </Link>
                ) : (
                  <span className="font-semibold text-sm text-gray-900">{donation.donorName}</span>
                )}
                <span className="text-xs text-gfm-gray">{formatRelativeTime(donation.createdDate)}</span>
              </div>
              <p className="text-sm font-bold text-gfm-green">{formatCurrency(donation.amount)}</p>
              {donation.message && (
                <p className="text-sm text-gray-600 mt-1">{donation.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
