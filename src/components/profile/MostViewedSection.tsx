'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { analytics } from '@/lib/analytics';
import { getFundraiserById } from '@/data/fundraisers';
import { getCommunityById } from '@/data/communities';
import { formatCurrency } from '@/lib/formatters';

interface ViewedItem {
  id: string;
  type: 'fundraiser' | 'community';
  totalTimeMs: number;
  views: number;
}

export default function MostViewedSection() {
  const viewData = useMemo(() => {
    const events = analytics.getEvents();
    const feedViews = events.filter((e) => e.type === 'feed_item_view');
    const pageViews = events.filter((e) => e.type === 'page_view');

    // Aggregate feed view data
    const itemMap: Record<string, ViewedItem> = {};

    feedViews.forEach((e) => {
      const id = (e.data?.itemId as string) || '';
      const type = (e.data?.itemType as string) as 'fundraiser' | 'community' || 'fundraiser';
      const timeMs = (e.data?.timeSpentMs as number) || 0;
      if (!id) return;
      if (!itemMap[id]) {
        itemMap[id] = { id, type, totalTimeMs: 0, views: 0 };
      }
      itemMap[id].totalTimeMs += timeMs;
      itemMap[id].views += 1;
    });

    // Also count page views to fundraiser/community pages
    pageViews.forEach((e) => {
      const page = e.page || '';
      const fundraiserMatch = page.match(/\/fundraiser\/(fundraiser-\d+)/);
      const communityMatch = page.match(/\/community\/(community-\d+)/);
      if (fundraiserMatch) {
        const id = fundraiserMatch[1];
        if (!itemMap[id]) {
          itemMap[id] = { id, type: 'fundraiser', totalTimeMs: 0, views: 0 };
        }
        itemMap[id].views += 1;
      }
      if (communityMatch) {
        const id = communityMatch[1];
        if (!itemMap[id]) {
          itemMap[id] = { id, type: 'community', totalTimeMs: 0, views: 0 };
        }
        itemMap[id].views += 1;
      }
    });

    return Object.values(itemMap)
      .sort((a, b) => b.totalTimeMs - a.totalTimeMs || b.views - a.views)
      .slice(0, 6);
  }, []);

  if (viewData.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span>👀</span> Most Viewed
        </h3>
        <p className="text-xs text-gray-400">
          Browse the Discover feed to see your most viewed fundraisers and communities here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        <span>👀</span> Most Viewed
      </h3>
      <p className="text-xs text-gray-500 mb-2">Based on your browsing activity</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {viewData.map((item, i) => {
          if (item.type === 'fundraiser') {
            const fundraiser = getFundraiserById(item.id);
            if (!fundraiser) return null;
            return (
              <Link
                key={item.id}
                href={`/fundraiser/${item.id}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={fundraiser.heroImage}
                    alt={fundraiser.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                  <div className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[9px] font-bold w-4 h-4 rounded flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#00b964] transition-colors">
                    {fundraiser.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(fundraiser.raisedAmount)} raised
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400">
                      {item.views} view{item.views !== 1 ? 's' : ''}
                    </span>
                    {item.totalTimeMs > 0 && (
                      <span className="text-[10px] text-gray-400">
                        • {Math.round(item.totalTimeMs / 1000)}s dwell time
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium flex-shrink-0">
                  💰 Fundraiser
                </span>
              </Link>
            );
          } else {
            const community = getCommunityById(item.id);
            if (!community) return null;
            return (
              <Link
                key={item.id}
                href={`/community/${item.id}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={community.avatarImage}
                    alt={community.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                  <div className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[9px] font-bold w-4 h-4 rounded flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                    {community.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {community.followerCount} members
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400">
                      {item.views} view{item.views !== 1 ? 's' : ''}
                    </span>
                    {item.totalTimeMs > 0 && (
                      <span className="text-[10px] text-gray-400">
                        • {Math.round(item.totalTimeMs / 1000)}s dwell time
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium flex-shrink-0">
                  👥 Community
                </span>
              </Link>
            );
          }
        })}
      </div>
    </div>
  );
}
