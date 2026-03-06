'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { getUserById, getAllUsers } from '@/data/users';
import { getFundraisersByOrganizer } from '@/data/fundraisers';
import { getDonationsForFundraiser } from '@/data/donations';
import { getActivitiesForUser } from '@/data/activity';
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
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

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

  // Gather donations for all of the user's fundraisers
  const allDonations = fundraisers.flatMap(f => getDonationsForFundraiser(f.id));

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
          <MyFundraiserMetrics fundraisers={fundraisers} donations={allDonations} />
        )}

        <DiscoverPeople users={suggestedUsers} />
        <HighlightsSection fundraisers={fundraisers} />
        <ProfileActivityFeed activities={activities} />
      </div>

      <AnalyticsDashboard />
    </>
  );
}
