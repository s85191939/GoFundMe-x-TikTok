'use client';

import { useCallback } from 'react';
import { analytics } from '@/lib/analytics';
import type { AnalyticsEventType } from '@/data/types';

export function useAnalytics(page: string) {
  const track = useCallback(
    (type: AnalyticsEventType, data?: Record<string, unknown>) => {
      analytics.track(type, page, data);
    },
    [page]
  );

  return { track, analytics };
}
