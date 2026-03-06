'use client';

import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

export function useScrollDepth(page: string) {
  const maxDepth = useRef(0);
  const milestones = useRef(new Set<number>());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const depth = Math.round((scrollTop / docHeight) * 100);
      if (depth > maxDepth.current) {
        maxDepth.current = depth;
      }

      [25, 50, 75, 100].forEach((milestone) => {
        if (depth >= milestone && !milestones.current.has(milestone)) {
          milestones.current.add(milestone);
          analytics.track('scroll_depth', page, { depth: milestone });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page]);

  return maxDepth;
}
