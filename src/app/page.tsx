'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/useAnalytics';

const DonationMap = dynamic(() => import('@/components/map/DonationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-[#1a1a2e]" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="text-center">
        <div className="animate-pulse text-[#00b964] text-5xl mb-4">$</div>
        <p className="text-gray-400 text-sm">Finding an inspiring story...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const { track } = useAnalytics('/');

  useEffect(() => {
    track('page_view', { page: 'home', viewMode: 'donation_map' });
  }, [track]);

  return <DonationMap onTrack={track} />;
}
