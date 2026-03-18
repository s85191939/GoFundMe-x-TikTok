'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useTimeOnPage } from '@/hooks/useTimeOnPage';
import { usePerformance } from '@/hooks/usePerformance';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const TikTokFeed = dynamic(() => import('@/components/discover/TikTokFeed'), { ssr: false });

export default function DiscoverPage() {
  const { track } = useAnalytics('/discover');
  useScrollDepth('/discover');
  useTimeOnPage('/discover');
  usePerformance('/discover');

  useEffect(() => {
    track('page_view', { page: 'discover', viewMode: 'tiktok_feed' });
  }, [track]);

  return (
    <>
      <TikTokFeed onTrack={track} />
      <AnalyticsDashboard />
    </>
  );
}
