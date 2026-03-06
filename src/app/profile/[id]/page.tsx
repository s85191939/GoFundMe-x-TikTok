'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { getUserById, getAllUsers } from '@/data/users';
import { getFundraisersByOrganizer, getAllFundraisers } from '@/data/fundraisers';
import { getDonationsForFundraiser, getDonationsByUser } from '@/data/donations';
import { getActivitiesForUser } from '@/data/activity';
import { getCommunityById } from '@/data/communities';
import { isCurrentUser } from '@/lib/auth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useTimeOnPage } from '@/hooks/useTimeOnPage';
import { usePerformance } from '@/hooks/usePerformance';
import ProfileHeader from '@/components/profile/ProfileHeader';
import FollowerStats from '@/components/profile/FollowerStats';
import HighlightsSection from '@/components/profile/HighlightsSection';
import ProfileActivityFeed from '@/components/profile/ProfileActivityFeed';
import DiscoverPeople from '@/components/profile/DiscoverPeople';
import MyFundraiserMetrics from '@/components/profile/MyFundraiserMetrics';
import InterestsEditor from '@/components/profile/InterestsEditor';
import MostViewedSection from '@/components/profile/MostViewedSection';
import TopCauses from '@/components/profile/TopCauses';
import UserCommunities from '@/components/profile/UserCommunities';
import DonationsMade from '@/components/profile/DonationsMade';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import type { Fundraiser } from '@/data/types';

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { track } = useAnalytics(`/profile/${id}`);
  useScrollDepth(`/profile/${id}`);
  useTimeOnPage(`/profile/${id}`);
  usePerformance(`/profile/${id}`);

  const isOwner = isCurrentUser(id);
  const user = getUserById(id);
  const fundraisers = user ? getFundraisersByOrganizer(user.id) : [];
  const activities = user ? getActivitiesForUser(user.id) : [];
  const suggestedUsers = getAllUsers().filter(u => u.id !== id).slice(0, 6);
  const allFundraisers = getAllFundraisers();

  // Donations received on this user's fundraisers
  const donationsReceived = fundraisers.flatMap(f => getDonationsForFundraiser(f.id));

  // Donations this user has made to others
  const donationsMade = user ? getDonationsByUser(user.id) : [];

  // Build a lookup map for fundraisers the user donated to
  const fundraiserLookup = useMemo(() => {
    const map: Record<string, Fundraiser> = {};
    donationsMade.forEach(d => {
      const f = allFundraisers.find(fr => fr.id === d.fundraiserId);
      if (f) map[f.id] = f;
    });
    return map;
  }, [donationsMade, allFundraisers]);

  // Communities this user belongs to
  const communities = useMemo(() => {
    if (!user) return [];
    return user.communityIds
      .map(cid => getCommunityById(cid))
      .filter(Boolean) as NonNullable<ReturnType<typeof getCommunityById>>[];
  }, [user]);

  useEffect(() => {
    if (user) {
      track('page_view', { userId: id, name: user.name });
    }
  }, [user, id, track]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h1>
          <p className="text-gfm-gray">The user you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <ProfileHeader user={user} />
        <FollowerStats
          followerCount={user.followerCount}
          followingCount={user.followingCount}
          onFollow={(isFollowing) => track('follow_click', { isFollowing })}
        />

        {/* Show metrics dashboard only for the logged-in user's own profile */}
        {isOwner && fundraisers.length > 0 && (
          <MyFundraiserMetrics fundraisers={fundraisers} donations={donationsReceived} />
        )}

        {/* User interests - only on own profile */}
        {isOwner && (
          <InterestsEditor />
        )}

        {/* Most viewed fundraisers/communities from feed - only own profile */}
        {isOwner && (
          <MostViewedSection />
        )}

        {/* Top Causes - visible on ALL profiles */}
        <TopCauses
          fundraisers={fundraisers}
          donations={donationsMade}
          allFundraisers={allFundraisers}
        />

        {/* Highlights - fundraisers this user organized */}
        <HighlightsSection fundraisers={fundraisers} />

        {/* Donations this user has made to others */}
        <DonationsMade donations={donationsMade} fundraiserLookup={fundraiserLookup} />

        {/* Communities this user belongs to */}
        <UserCommunities communities={communities} />

        {/* Activity feed */}
        <ProfileActivityFeed activities={activities} />

        {/* Discover other people */}
        <DiscoverPeople users={suggestedUsers} />
      </div>

      <AnalyticsDashboard />
    </>
  );
}
