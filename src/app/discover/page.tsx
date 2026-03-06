'use client';

import { useEffect } from 'react';
import { getAllFundraisers } from '@/data/fundraisers';
import { getAllCommunities } from '@/data/communities';
import DiscoverFeed from '@/components/discover/DiscoverFeed';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useTimeOnPage } from '@/hooks/useTimeOnPage';
import { usePerformance } from '@/hooks/usePerformance';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function DiscoverPage() {
  const { track } = useAnalytics('/discover');
  useScrollDepth('/discover');
  useTimeOnPage('/discover');
  usePerformance('/discover');

  const allFundraisers = getAllFundraisers();
  const allCommunities = getAllCommunities();

  useEffect(() => {
    track('page_view', { page: 'discover', viewMode: 'feed' });
  }, [track]);

  return (
    <>
      <DiscoverFeed
        fundraisers={allFundraisers}
        communities={allCommunities}
        onTrack={track}
      />

      <AnalyticsDashboard />
    </>
  );
}
