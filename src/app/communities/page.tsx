'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllCommunities } from '@/data/communities';
import { formatCurrency } from '@/lib/formatters';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useTimeOnPage } from '@/hooks/useTimeOnPage';
import { usePerformance } from '@/hooks/usePerformance';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function CommunitiesPage() {
  const { track } = useAnalytics('/communities');
  useScrollDepth('/communities');
  useTimeOnPage('/communities');
  usePerformance('/communities');

  const communities = getAllCommunities();

  useEffect(() => {
    track('page_view', { page: 'communities' });
  }, [track]);

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Communities
          </h1>
          <p className="text-lg text-gfm-gray max-w-2xl mx-auto">
            Join communities of people who share your passion for making a difference.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          <div className="text-center">
            <p className="text-2xl font-bold text-gfm-green">{communities.length}</p>
            <p className="text-xs text-gfm-gray mt-0.5">Communities</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gfm-green">
              {communities.reduce((sum, c) => sum + c.followerCount, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gfm-gray mt-0.5">Total Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gfm-green">
              {formatCurrency(communities.reduce((sum, c) => sum + c.totalRaised, 0))}
            </p>
            <p className="text-xs text-gfm-gray mt-0.5">Total Raised</p>
          </div>
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map(community => (
            <Link
              key={community.id}
              href={`/community/${community.id}`}
              className="group block"
            >
              <div className="bg-white rounded-xl overflow-hidden border border-gray-100 card-hover">
                {/* Banner */}
                <div className="relative w-full h-32">
                  <Image
                    src={community.bannerImage}
                    alt={community.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 -mt-8 relative">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-white bg-white shadow-md mb-3">
                    <Image
                      src={community.avatarImage}
                      alt={community.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-gfm-green transition-colors">
                    {community.name}
                  </h3>
                  <p className="text-sm text-gfm-gray mt-1">{community.tagline}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      {community.followerCount} members
                    </span>
                    <span>&bull;</span>
                    <span>{community.activeFundraiserCount} fundraisers</span>
                    <span>&bull;</span>
                    <span className="text-gfm-green font-medium">{formatCurrency(community.totalRaised)} raised</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <AnalyticsDashboard />
    </>
  );
}
