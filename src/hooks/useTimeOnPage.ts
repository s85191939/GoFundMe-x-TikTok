'use client';

import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

export function useTimeOnPage(page: string) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
    const thresholds = [30, 60, 120];
    const timers: NodeJS.Timeout[] = [];

    thresholds.forEach((seconds) => {
      const timer = setTimeout(() => {
        analytics.track('time_on_page', page, { seconds });
      }, seconds * 1000);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
      const totalSeconds = Math.round((Date.now() - startTime.current) / 1000);
      analytics.track('time_on_page', page, { seconds: totalSeconds, final: true });
    };
  }, [page]);
}
