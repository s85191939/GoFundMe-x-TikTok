'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Donation, Fundraiser } from '@/data/types';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';

interface DonationsMadeProps {
  donations: Donation[];
  fundraiserLookup: Record<string, Fundraiser>;
}

export default function DonationsMade({ donations, fundraiserLookup }: DonationsMadeProps) {
  const [showAll, setShowAll] = useState(false);

  if (donations.length === 0) return null;

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const visible = showAll ? donations : donations.slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Donations Made</h2>
        <div className="text-sm">
          <span className="font-bold text-[#00b964]">{formatCurrency(totalDonated)}</span>
          <span className="text-gray-500 ml-1">total given</span>
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((donation) => {
          const fundraiser = fundraiserLookup[donation.fundraiserId];
          return (
            <div
              key={donation.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {fundraiser ? (
                <Link
                  href={`/fundraiser/${fundraiser.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0 group"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={fundraiser.heroImage}
                      alt={fundraiser.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#00b964] transition-colors">
                      {fundraiser.title}
                    </p>
                    {donation.message && (
                      <p className="text-xs text-gray-500 truncate">&ldquo;{donation.message}&rdquo;</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatRelativeTime(donation.createdDate)}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">Fundraiser</p>
                </div>
              )}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-[#00b964]">{formatCurrency(donation.amount)}</p>
                {donation.isAnonymous && (
                  <p className="text-[10px] text-gray-400">Anonymous</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {donations.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-[#00b964] font-semibold hover:underline"
        >
          {showAll ? 'Show less' : `Show all ${donations.length} donations`}
        </button>
      )}
    </div>
  );
}
