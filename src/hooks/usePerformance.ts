'use client';

import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PerformanceData {
  lcp: number | null;   // ms
  fid: number | null;   // ms
  cls: number | null;   // score
  ttfb: number | null;  // ms
  pageLoad: number | null; // ms
}

export interface AggregatePerformance {
  avgLCP: number;
  avgFID: number;
  avgCLS: number;
  avgTTFB: number;
  avgPageLoad: number;
  readings: number;
}

// ---------------------------------------------------------------------------
// Module-level metric store – accumulates readings across hook instances
// ---------------------------------------------------------------------------

interface MetricAccumulator {
  lcp: number[];
  fid: number[];
  cls: number[];
  ttfb: number[];
  pageLoad: number[];
}

const store: MetricAccumulator = {
  lcp: [],
  fid: [],
  cls: [],
  ttfb: [],
  pageLoad: [],
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Returns aggregate averages of all performance readings captured so far.
 */
export function getPerformanceMetrics(): AggregatePerformance {
  return {
    avgLCP: average(store.lcp),
    avgFID: average(store.fid),
    avgCLS: average(store.cls),
    avgTTFB: average(store.ttfb),
    avgPageLoad: average(store.pageLoad),
    readings: Math.max(
      store.lcp.length,
      store.fid.length,
      store.cls.length,
      store.ttfb.length,
      store.pageLoad.length,
    ),
  };
}

// ---------------------------------------------------------------------------
// SSR guard helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function hasPerformanceObserver(): boolean {
  return isBrowser() && typeof PerformanceObserver !== 'undefined';
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Captures Core Web Vitals and navigation timing metrics for the given page.
 *
 * @param page - An identifier for the page being measured (e.g. route path).
 * @returns The most recent `PerformanceData` snapshot for the current mount.
 */
export function usePerformance(page: string): PerformanceData {
  const [metrics, setMetrics] = useState<PerformanceData>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    pageLoad: null,
  });

  // Track cumulative CLS across multiple layout-shift entries.
  const clsValue = useRef<number>(0);

  useEffect(() => {
    if (!isBrowser()) return;

    const observers: PerformanceObserver[] = [];

    // ------------------------------------------------------------------
    // 1. Largest Contentful Paint (LCP)
    // ------------------------------------------------------------------
    if (hasPerformanceObserver()) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            const value = lastEntry.startTime;
            store.lcp.push(value);
            setMetrics((prev) => ({ ...prev, lcp: value }));
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        observers.push(lcpObserver);
      } catch {
        // Observer type not supported in this browser – silently skip.
      }
    }

    // ------------------------------------------------------------------
    // 2. First Input Delay (FID)
    // ------------------------------------------------------------------
    if (hasPerformanceObserver()) {
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const firstEntry = entries[0] as PerformanceEventTiming | undefined;
          if (firstEntry) {
            const value = firstEntry.processingStart - firstEntry.startTime;
            store.fid.push(value);
            setMetrics((prev) => ({ ...prev, fid: value }));
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        observers.push(fidObserver);
      } catch {
        // Observer type not supported – silently skip.
      }
    }

    // ------------------------------------------------------------------
    // 3. Cumulative Layout Shift (CLS)
    // ------------------------------------------------------------------
    if (hasPerformanceObserver()) {
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // Only count shifts that were not triggered by user input.
            if (!(entry as LayoutShiftEntry).hadRecentInput) {
              clsValue.current += (entry as LayoutShiftEntry).value;
              const currentCLS = clsValue.current;
              // Update the store with the latest cumulative value.
              // We replace the last entry for this mount so we don't
              // over-count incremental updates.
              if (store.cls.length > 0 && store.cls[store.cls.length - 1] !== currentCLS) {
                store.cls[store.cls.length - 1] = currentCLS;
              } else if (store.cls.length === 0) {
                store.cls.push(currentCLS);
              }
              setMetrics((prev) => ({ ...prev, cls: currentCLS }));
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        observers.push(clsObserver);
      } catch {
        // Observer type not supported – silently skip.
      }
    }

    // ------------------------------------------------------------------
    // 4. TTFB & 5. Page Load from Navigation Timing
    // ------------------------------------------------------------------
    function captureNavigationTiming() {
      if (!isBrowser() || typeof performance === 'undefined') return;

      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0] as PerformanceNavigationTiming;

        const ttfb = nav.responseStart - nav.requestStart;
        if (ttfb >= 0) {
          store.ttfb.push(ttfb);
          setMetrics((prev) => ({ ...prev, ttfb }));
        }

        const pageLoad = nav.loadEventEnd - nav.startTime;
        if (pageLoad > 0) {
          store.pageLoad.push(pageLoad);
          setMetrics((prev) => ({ ...prev, pageLoad }));
        }
      }
    }

    // Navigation timing entries may not be available immediately; wait for
    // the load event if `loadEventEnd` is 0.
    if (document.readyState === 'complete') {
      captureNavigationTiming();
    } else {
      const onLoad = () => {
        // Small delay so loadEventEnd is populated.
        setTimeout(captureNavigationTiming, 0);
      };
      window.addEventListener('load', onLoad);
      // Store removal so we can clean up.
      const cleanup = () => window.removeEventListener('load', onLoad);
      observers.push({ disconnect: cleanup } as unknown as PerformanceObserver);
    }

    // ------------------------------------------------------------------
    // Cleanup
    // ------------------------------------------------------------------
    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [page]);

  return metrics;
}

// ---------------------------------------------------------------------------
// Supplementary type declarations for entries not yet in all TS libs
// ---------------------------------------------------------------------------

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}
