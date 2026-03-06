'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCommunityById } from '@/data/communities';
import { getFundraiserById } from '@/data/fundraisers';
import { getUserById } from '@/data/users';
import { getActivitiesForCommunity } from '@/data/activity';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useTimeOnPage } from '@/hooks/useTimeOnPage';
import { usePerformance } from '@/hooks/usePerformance';
import CommunityBanner from '@/components/community/CommunityBanner';
import FollowButton from '@/components/community/FollowButton';
import MissionStatement from '@/components/community/MissionStatement';
import StatsBar from '@/components/community/StatsBar';
import Leaderboard from '@/components/community/Leaderboard';
import ActivityFeed from '@/components/community/ActivityFeed';
import FundraiserGrid from '@/components/community/FundraiserGrid';
import CommunityGuidelines from '@/components/community/CommunityGuidelines';
import TabGroup from '@/components/shared/TabGroup';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const tabs = [
  { id: 'activity', label: 'Activity' },
  { id: 'fundraisers', label: 'Fundraisers' },
  { id: 'about', label: 'About' },
];

export default function CommunityPage() {
  const params = useParams();
  const id = params.id as string;
  const { track } = useAnalytics(`/community/${id}`);
  useScrollDepth(`/community/${id}`);
  useTimeOnPage(`/community/${id}`);
  usePerformance(`/community/${id}`);

  const [activeTab, setActiveTab] = useState('activity');

  const community = getCommunityById(id);
  const fundraisers = community
    ? community.fundraiserIds.map(fid => getFundraiserById(fid)).filter(Boolean) as NonNullable<ReturnType<typeof getFundraiserById>>[]
    : [];
  const leaderboardEntries = fundraisers
    .sort((a, b) => b.raisedAmount - a.raisedAmount)
    .map(f => {
      const user = getUserById(f.organizerId);
      return user ? { user, fundraiser: f } : null;
    })
    .filter(Boolean) as { user: NonNullable<ReturnType<typeof getUserById>>; fundraiser: NonNullable<ReturnType<typeof getFundraiserById>> }[];
  const activities = community ? getActivitiesForCommunity(community.id) : [];

  useEffect(() => {
    if (community) {
      track('page_view', { communityId: id, name: community.name });
    }
  }, [community, id, track]);

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Community not found</h1>
          <p className="text-gfm-gray">The community you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <CommunityBanner community={community} />

        <div className="px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <MissionStatement tagline={community.tagline} description={community.description} />
            <FollowButton onToggle={(isFollowing) => track('follow_click', { isFollowing })} />
          </div>

          <StatsBar
            totalRaised={community.totalRaised}
            totalDonations={community.totalDonations}
            activeFundraisers={community.activeFundraiserCount}
          />

          <TabGroup
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              track('tab_switch', { tab });
            }}
          />

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <Leaderboard entries={leaderboardEntries} />
                <ActivityFeed items={activities} />
              </div>
            )}

            {activeTab === 'fundraisers' && (
              <FundraiserGrid fundraisers={fundraisers} />
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">About {community.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{community.description}</p>
                </div>
                <CommunityGuidelines guidelines={community.guidelines} />
              </div>
            )}
          </div>
        </div>
      </div>

      <AnalyticsDashboard />
    </>
  );
}
