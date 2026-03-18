'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { getCommunityDonationStats } from '@/lib/socialProof';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';

interface CommunityGivingBannerProps {
  fundraiserId: string;
  communityId?: string;
}

export default function CommunityGivingBanner({ fundraiserId, communityId }: CommunityGivingBannerProps) {
  const stats = useMemo(() => getCommunityDonationStats(fundraiserId), [fundraiserId]);

  if (!stats) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/60 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-0.5">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-sm font-bold text-gray-900">Your Community Is Giving</h3>
          {/* Live dot */}
          <span className="flex h-2 w-2 ml-auto">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
      </div>

      {/* Regional stats */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-emerald-700">{stats.regionDonorCount} people</span> in {stats.regionName} have donated
        </p>
        <p className="text-lg font-bold text-emerald-700 mt-0.5">
          {formatCurrency(stats.regionTotalAmount)} raised together
        </p>
      </div>

      {/* Community-specific section */}
      {stats.communityName && stats.communityDonorCount && stats.communityDonorCount > 0 && (
        <div className="mx-4 mb-3 bg-white/60 rounded-lg px-3 py-2 border border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
              {stats.communityName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {stats.communityName}
              </p>
              <p className="text-xs text-gray-500">
                {stats.communityDonorCount} members raised {formatCurrency(stats.communityTotalAmount || 0)}
              </p>
            </div>
          </div>
          {communityId && (
            <Link
              href={`/community/${communityId}`}
              className="text-xs text-emerald-600 hover:underline mt-1 inline-block font-medium"
            >
              View community →
            </Link>
          )}
        </div>
      )}

      {/* Mini activity feed */}
      {stats.recentSimilarDonations.length > 0 && (
        <div className="border-t border-emerald-100 px-4 py-2.5 space-y-2">
          {stats.recentSimilarDonations.slice(0, 3).map((sd, i) => (
            <div
              key={sd.donation.id}
              className="flex items-center gap-2 text-xs animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {sd.donor.avatar ? (
                <img
                  src={sd.donor.avatar}
                  alt={sd.donor.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px]">
                  {sd.donor.name.charAt(0)}
                </div>
              )}
              <span className="text-gray-700 truncate flex-1">
                <span className="font-medium">{sd.donor.name.split(' ')[0]}</span>
                {' '}from {sd.donor.location.split(',')[1]?.trim() || sd.donor.location}
              </span>
              <span className="font-semibold text-emerald-700 shrink-0">
                {formatCurrency(sd.donation.amount)}
              </span>
              <span className="text-gray-400 shrink-0">
                {formatRelativeTime(sd.donation.createdDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
