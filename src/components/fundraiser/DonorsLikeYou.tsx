'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { getSimilarDonors } from '@/lib/socialProof';
import { formatCurrency } from '@/lib/formatters';

interface DonorsLikeYouProps {
  fundraiserId: string;
  onDonateClick?: () => void;
}

export default function DonorsLikeYou({ fundraiserId, onDonateClick }: DonorsLikeYouProps) {
  const similarDonors = useMemo(() => getSimilarDonors(fundraiserId, 4), [fundraiserId]);

  if (similarDonors.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200/60">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-gfm-green uppercase tracking-wide">
          Donors like you
        </span>
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        People similar to you have supported this cause
      </p>

      {/* Donor cards */}
      <div className="space-y-3">
        {similarDonors.map((sd) => (
          <div
            key={sd.donation.id}
            className="flex items-center gap-3 bg-white/70 rounded-lg px-3 py-2.5 border border-green-100"
          >
            {/* Avatar */}
            <Link href={`/profile/${sd.donor.id}`} className="shrink-0">
              {sd.donor.avatar ? (
                <img
                  src={sd.donor.avatar}
                  alt={sd.donor.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-green-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm ring-2 ring-green-200">
                  {sd.donor.name.charAt(0)}
                </div>
              )}
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${sd.donor.id}`}
                  className="text-sm font-semibold text-gray-900 hover:text-gfm-green truncate"
                >
                  {sd.donor.name}
                </Link>
                {sd.donor.isVerified && (
                  <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{sd.donor.location}</p>
            </div>

            {/* Amount */}
            <span className="text-sm font-bold text-gfm-green shrink-0">
              {formatCurrency(sd.donation.amount)}
            </span>

            {/* Similarity badge */}
            <span className="hidden sm:inline-flex text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
              {sd.similarityReason}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {onDonateClick && (
        <button
          onClick={onDonateClick}
          className="mt-4 w-full py-2.5 bg-gfm-green text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Join them — donate now
        </button>
      )}
    </div>
  );
}
