/**
 * Business Metrics Engine
 *
 * A comprehensive KPI computation layer that sits on top of the raw analytics
 * event stream. Provides session tracking, DAU/MAU with simulated historical
 * data, conversion funnels, revenue metrics, engagement scores, retention
 * curves, fundraiser performance, and Core Web Vitals tracking.
 *
 * Usage:
 *   import { businessMetrics } from '@/lib/metrics';
 *   const dashboard = businessMetrics.getBusinessDashboard();
 *
 * The module follows the same singleton + subscribe/unsubscribe pattern used
 * by the existing analytics tracker so that UI components can reactively
 * update when new events arrive.
 */

import { analytics } from '@/lib/analytics';
import { fundraisers } from '@/data/fundraisers';
import type { AnalyticsEvent, AnalyticsEventType } from '@/data/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** A session expires after 30 minutes of inactivity (in milliseconds). */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/** Number of historical days to simulate. */
const HISTORICAL_DAYS = 30;

/** Milliseconds in one day. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Milliseconds in one hour. */
const MS_PER_HOUR = 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Seeded PRNG
// ---------------------------------------------------------------------------

/**
 * Simple seeded pseudo-random number generator (Mulberry32).
 * Deterministic: the same seed always produces the same sequence, so
 * historical data does not change across page refreshes within the same day.
 */
function createSeededRandom(seed: number): () => number {
  let s = seed | 0;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a seed from today's UTC date so simulated data is stable for the
 * entire calendar day regardless of the hour the page is loaded.
 */
function todaySeed(): number {
  const now = new Date();
  return now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
}

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

/** A single user session derived from raw analytics events. */
export interface Session {
  /** Unique session identifier. */
  id: string;
  /** Timestamp (ms) when the session started. */
  startTime: number;
  /** Timestamp (ms) of the most recent event in the session. */
  endTime: number;
  /** Ordered list of pages visited during this session. */
  pages: string[];
  /** All events that belong to this session. */
  events: AnalyticsEvent[];
}

/** One day of simulated historical data. */
export interface HistoricalDayData {
  /** Calendar date string in YYYY-MM-DD format. */
  date: string;
  /** Simulated daily active users. */
  dau: number;
  /** Simulated daily revenue (total donation value). */
  revenue: number;
  /** Simulated number of sessions for the day. */
  sessions: number;
  /** Simulated number of donations for the day. */
  donations: number;
}

/** Conversion funnel snapshot. */
export interface ConversionFunnel {
  /** Total unique visitors (page_view events). */
  visitors: number;
  /** Users who clicked the donate button. */
  donateButtonClicks: number;
  /** Users who opened the donate modal. */
  modalOpens: number;
  /** Users who selected a donation amount. */
  amountSelects: number;
  /** Users who submitted a donation. */
  submissions: number;
  /** Visitor -> Donate Button Click rate (0-1). */
  visitorToButtonRate: number;
  /** Donate Button -> Modal Open rate (0-1). */
  buttonToModalRate: number;
  /** Modal Open -> Amount Select rate (0-1). */
  modalToAmountRate: number;
  /** Amount Select -> Submit rate (0-1). */
  amountToSubmitRate: number;
  /** Overall visitor -> donor conversion rate (0-1). */
  overallConversionRate: number;
}

/** Revenue KPIs. */
export interface RevenueMetrics {
  /** Total donation revenue tracked in the current session. */
  totalRevenue: number;
  /** Average donation amount. */
  averageDonation: number;
  /** Revenue per unique visitor. */
  revenuePerVisitor: number;
  /** Revenue per session. */
  revenuePerSession: number;
  /** Donation velocity: projected $/hour based on current session pace. */
  donationVelocity: number;
  /** Simulated historical daily revenue for the past 30 days. */
  historicalRevenue: { date: string; revenue: number }[];
}

/** Engagement KPIs. */
export interface EngagementMetrics {
  /** Fraction of sessions that included an AI feature event (0-1). */
  aiFeatureAdoption: number;
  /** Fraction of sessions that included a share event (0-1). */
  shareAdoption: number;
  /** Fraction of sessions that included a follow event (0-1). */
  followAdoption: number;
  /** Average scroll depth across all scroll_depth events (0-100). */
  avgScrollDepth: number;
  /** Average time on page in seconds. */
  avgTimeOnPage: number;
}

/** Simulated retention rates. */
export interface RetentionMetrics {
  /** Day-1 retention rate (0-1). */
  day1: number;
  /** Day-7 retention rate (0-1). */
  day7: number;
  /** Day-30 retention rate (0-1). */
  day30: number;
}

/** Fundraiser performance KPIs computed from static fundraiser data. */
export interface FundraiserPerformance {
  /** Average raisedAmount / goalAmount across all fundraisers (0-1). */
  avgCompletionRate: number;
  /** Average number of days from creation to most recent donation. */
  avgTimeToFund: number;
  /** Fraction of fundraisers that have met or exceeded their goal (0-1). */
  successRate: number;
}

/** Core Web Vitals and navigation timing record. */
export interface WebVitalsRecord {
  /** Largest Contentful Paint (ms). */
  lcp?: number;
  /** First Input Delay (ms). */
  fid?: number;
  /** Cumulative Layout Shift (unitless). */
  cls?: number;
  /** DOM Content Loaded time (ms). */
  domContentLoaded?: number;
  /** Full page load time (ms). */
  pageLoad?: number;
  /** Time to First Byte (ms). */
  ttfb?: number;
  /** Timestamp when the record was captured (ms). */
  timestamp: number;
}

/** Averaged page performance metrics. */
export interface PagePerformanceMetrics {
  /** Average LCP in ms (or null if no data). */
  avgLCP: number | null;
  /** Average FID in ms (or null if no data). */
  avgFID: number | null;
  /** Average CLS (or null if no data). */
  avgCLS: number | null;
  /** Average DOM Content Loaded in ms (or null if no data). */
  avgDomContentLoaded: number | null;
  /** Average full page load in ms (or null if no data). */
  avgPageLoad: number | null;
  /** Average TTFB in ms (or null if no data). */
  avgTTFB: number | null;
  /** Total number of performance records captured. */
  sampleCount: number;
}

/** DAU/MAU metrics including simulated history. */
export interface ActiveUserMetrics {
  /** Daily active users for today (simulated base + live). */
  dauToday: number;
  /** Monthly active users (rolling 30-day unique user approximation). */
  mau: number;
  /** DAU/MAU ratio -- a measure of stickiness (0-1). */
  stickiness: number;
  /** Historical daily active user counts for the past 30 days. */
  historicalDAU: { date: string; dau: number }[];
}

/** Session-level KPIs. */
export interface SessionMetrics {
  /** Total number of sessions tracked. */
  totalSessions: number;
  /** Average session duration in seconds. */
  avgSessionDuration: number;
  /** Average number of pages viewed per session. */
  avgPagesPerSession: number;
  /** Bounce rate: fraction of sessions with only a single page (0-1). */
  bounceRate: number;
}

/** The complete business dashboard object returned by getBusinessDashboard(). */
export interface BusinessDashboard {
  activeUsers: ActiveUserMetrics;
  sessions: SessionMetrics;
  conversionFunnel: ConversionFunnel;
  revenue: RevenueMetrics;
  engagement: EngagementMetrics;
  retention: RetentionMetrics;
  fundraiserPerformance: FundraiserPerformance;
  pagePerformance: PagePerformanceMetrics;
  /** ISO timestamp of when this snapshot was computed. */
  generatedAt: string;
}

/** Callback shape for metrics subscribers. */
export type MetricsListener = (dashboard: BusinessDashboard) => void;

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/** Safe division that returns 0 when the denominator is 0. */
function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

/** Compute the arithmetic mean of an array of numbers. Returns 0 for empty arrays. */
function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

/** Format a Date as YYYY-MM-DD. */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ---------------------------------------------------------------------------
// BusinessMetrics Singleton
// ---------------------------------------------------------------------------

class BusinessMetrics {
  private static instance: BusinessMetrics | null = null;

  // ---- Internal state ----

  /** Web Vitals records collected via recordWebVitals(). */
  private vitalsRecords: WebVitalsRecord[] = [];

  /** Pre-computed historical data generated once on construction. */
  private historicalData: HistoricalDayData[] = [];

  /** Subscriber set for reactive updates. */
  private listeners: Set<MetricsListener> = new Set();

  /**
   * Counter of live unique visitors observed in the current page session.
   * Incremented each time a page_view event arrives from a previously-unseen
   * page, which is the best proxy we have for "unique user" in a static
   * demo environment.
   */
  private liveVisitorCount = 0;

  /**
   * Set of page paths already counted toward liveVisitorCount. Used to
   * avoid double-counting repeat views of the same page as new users.
   */
  private seenPages: Set<string> = new Set();

  /** Reference to the analytics listener so we can unsubscribe if needed. */
  private analyticsUnsubscribe: (() => void) | null = null;

  // ---- Construction ----

  constructor() {
    if (BusinessMetrics.instance) {
      return BusinessMetrics.instance;
    }
    BusinessMetrics.instance = this;

    // Generate deterministic historical data for the past 30 days.
    this.historicalData = this.generateHistoricalData();

    // Wire up to the underlying analytics tracker so we can push reactive
    // updates to our own subscribers whenever a new event is tracked.
    const listener = (_events: AnalyticsEvent[]) => {
      this.handleNewEvents(_events);
      this.notifyListeners();
    };
    analytics.subscribe(listener);
    this.analyticsUnsubscribe = () => analytics.unsubscribe(listener);
  }

  // -----------------------------------------------------------------------
  // Public API -- Subscription
  // -----------------------------------------------------------------------

  /** Subscribe to real-time dashboard updates. */
  subscribe(listener: MetricsListener): void {
    this.listeners.add(listener);
  }

  /** Unsubscribe from real-time dashboard updates. */
  unsubscribe(listener: MetricsListener): void {
    this.listeners.delete(listener);
  }

  // -----------------------------------------------------------------------
  // Public API -- Data recording
  // -----------------------------------------------------------------------

  /**
   * Record a Core Web Vitals / navigation timing measurement.
   *
   * Call this from your performance observer or after window.onload:
   * ```ts
   * businessMetrics.recordWebVitals({
   *   lcp: 1200,
   *   fid: 8,
   *   cls: 0.05,
   *   ttfb: 180,
   *   domContentLoaded: 450,
   *   pageLoad: 1800,
   *   timestamp: Date.now(),
   * });
   * ```
   */
  recordWebVitals(record: WebVitalsRecord): void {
    this.vitalsRecords.push(record);
    this.notifyListeners();
  }

  // -----------------------------------------------------------------------
  // Public API -- Computed KPIs
  // -----------------------------------------------------------------------

  /** Build and return a complete business dashboard snapshot. */
  getBusinessDashboard(): BusinessDashboard {
    return {
      activeUsers: this.getActiveUserMetrics(),
      sessions: this.getSessionMetrics(),
      conversionFunnel: this.getConversionFunnel(),
      revenue: this.getRevenueMetrics(),
      engagement: this.getEngagementMetrics(),
      retention: this.getRetentionMetrics(),
      fundraiserPerformance: this.getFundraiserPerformance(),
      pagePerformance: this.getPagePerformanceMetrics(),
      generatedAt: new Date().toISOString(),
    };
  }

  // -----------------------------------------------------------------------
  // 1. Session Tracking
  // -----------------------------------------------------------------------

  /**
   * Derive sessions from the raw analytics event stream.
   *
   * Algorithm: events are sorted by timestamp. A new session begins when
   * either (a) this is the first event, or (b) the gap since the previous
   * event exceeds SESSION_TIMEOUT_MS. Each session accumulates the list of
   * distinct pages visited.
   */
  getSessions(): Session[] {
    const events = analytics.getEvents();
    if (events.length === 0) return [];

    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const sessions: Session[] = [];
    let current: Session = {
      id: 'session-1',
      startTime: sorted[0].timestamp,
      endTime: sorted[0].timestamp,
      pages: [sorted[0].page],
      events: [sorted[0]],
    };

    for (let i = 1; i < sorted.length; i++) {
      const event = sorted[i];
      const gap = event.timestamp - current.endTime;

      if (gap > SESSION_TIMEOUT_MS) {
        // Finalize previous session and start a new one.
        sessions.push(current);
        current = {
          id: `session-${sessions.length + 1}`,
          startTime: event.timestamp,
          endTime: event.timestamp,
          pages: [event.page],
          events: [event],
        };
      } else {
        // Extend the current session.
        current.endTime = event.timestamp;
        if (!current.pages.includes(event.page)) {
          current.pages.push(event.page);
        }
        current.events.push(event);
      }
    }

    // Push the last in-progress session.
    sessions.push(current);
    return sessions;
  }

  /** Compute session-level KPIs. */
  getSessionMetrics(): SessionMetrics {
    const sessions = this.getSessions();
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgSessionDuration: 0,
        avgPagesPerSession: 0,
        bounceRate: 0,
      };
    }

    const durations = sessions.map((s) => (s.endTime - s.startTime) / 1000);
    const pagesPerSession = sessions.map((s) => s.pages.length);
    const bouncedSessions = sessions.filter((s) => s.pages.length <= 1).length;

    return {
      totalSessions: sessions.length,
      avgSessionDuration: Math.round(mean(durations)),
      avgPagesPerSession: parseFloat(mean(pagesPerSession).toFixed(2)),
      bounceRate: parseFloat(safeDivide(bouncedSessions, sessions.length).toFixed(4)),
    };
  }

  // -----------------------------------------------------------------------
  // 2. DAU / MAU with Historical Simulation
  // -----------------------------------------------------------------------

  /** Compute active user metrics combining historical simulation and live data. */
  getActiveUserMetrics(): ActiveUserMetrics {
    const historical = this.historicalData;

    // Today's simulated base + live unique page views.
    const todayBase = historical[historical.length - 1]?.dau ?? 0;
    const dauToday = todayBase + this.liveVisitorCount;

    // Build the historical DAU series (replace the last entry with live total).
    const historicalDAU = historical.map((d, i) => ({
      date: d.date,
      dau: i === historical.length - 1 ? dauToday : d.dau,
    }));

    // MAU: sum of unique users over the 30-day window. In reality this would
    // be a set union; here we approximate by summing DAU values and applying
    // a deduplication factor (~60% unique across days on average).
    const totalDauSum = historicalDAU.reduce((sum, d) => sum + d.dau, 0);
    const mau = Math.round(totalDauSum * 0.6);

    const stickiness = parseFloat(safeDivide(dauToday, mau).toFixed(4));

    return { dauToday, mau, stickiness, historicalDAU };
  }

  // -----------------------------------------------------------------------
  // 3. Conversion Funnel
  // -----------------------------------------------------------------------

  /** Compute the donation conversion funnel from live event data. */
  getConversionFunnel(): ConversionFunnel {
    const events = analytics.getEvents();

    const visitors = events.filter((e) => e.type === 'page_view').length;
    const donateButtonClicks = events.filter((e) => e.type === 'donate_button_click').length;
    const modalOpens = events.filter((e) => e.type === 'donate_modal_open').length;
    const amountSelects = events.filter((e) => e.type === 'donate_amount_select').length;
    const submissions = events.filter((e) => e.type === 'donate_submit').length;

    return {
      visitors,
      donateButtonClicks,
      modalOpens,
      amountSelects,
      submissions,
      visitorToButtonRate: parseFloat(safeDivide(donateButtonClicks, visitors).toFixed(4)),
      buttonToModalRate: parseFloat(safeDivide(modalOpens, donateButtonClicks).toFixed(4)),
      modalToAmountRate: parseFloat(safeDivide(amountSelects, modalOpens).toFixed(4)),
      amountToSubmitRate: parseFloat(safeDivide(submissions, amountSelects).toFixed(4)),
      overallConversionRate: parseFloat(safeDivide(submissions, visitors).toFixed(4)),
    };
  }

  // -----------------------------------------------------------------------
  // 4. Revenue Metrics
  // -----------------------------------------------------------------------

  /** Compute revenue KPIs from live events and simulated history. */
  getRevenueMetrics(): RevenueMetrics {
    const events = analytics.getEvents();
    const sessions = this.getSessions();

    // Extract donation amounts from donate_submit events.
    const donationAmounts = events
      .filter((e) => e.type === 'donate_submit' && e.data?.amount != null)
      .map((e) => e.data!.amount as number);

    const totalRevenue = donationAmounts.reduce((sum, a) => sum + a, 0);
    const averageDonation = mean(donationAmounts);

    const visitors = events.filter((e) => e.type === 'page_view').length;
    const revenuePerVisitor = safeDivide(totalRevenue, visitors);
    const revenuePerSession = safeDivide(totalRevenue, sessions.length);

    // Donation velocity: project current session revenue to an hourly rate.
    let donationVelocity = 0;
    if (events.length >= 2) {
      const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
      const elapsedMs = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
      if (elapsedMs > 0) {
        donationVelocity = (totalRevenue / elapsedMs) * MS_PER_HOUR;
      }
    }

    // Simulated historical daily revenue.
    const historicalRevenue = this.historicalData.map((d) => ({
      date: d.date,
      revenue: d.revenue,
    }));

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageDonation: parseFloat(averageDonation.toFixed(2)),
      revenuePerVisitor: parseFloat(revenuePerVisitor.toFixed(2)),
      revenuePerSession: parseFloat(revenuePerSession.toFixed(2)),
      donationVelocity: parseFloat(donationVelocity.toFixed(2)),
      historicalRevenue,
    };
  }

  // -----------------------------------------------------------------------
  // 5. Engagement Metrics
  // -----------------------------------------------------------------------

  /** Compute engagement KPIs from live session data. */
  getEngagementMetrics(): EngagementMetrics {
    const events = analytics.getEvents();
    const sessions = this.getSessions();

    const aiEventTypes: AnalyticsEventType[] = ['ai_story_generate', 'ai_suggestion_click'];
    const shareEventTypes: AnalyticsEventType[] = ['share_click'];
    const followEventTypes: AnalyticsEventType[] = ['follow_click'];

    const sessionCount = sessions.length;

    const sessionsWithAI = sessions.filter((s) =>
      s.events.some((e) => aiEventTypes.includes(e.type))
    ).length;
    const sessionsWithShare = sessions.filter((s) =>
      s.events.some((e) => shareEventTypes.includes(e.type))
    ).length;
    const sessionsWithFollow = sessions.filter((s) =>
      s.events.some((e) => followEventTypes.includes(e.type))
    ).length;

    // Average scroll depth.
    const scrollDepths = events
      .filter((e) => e.type === 'scroll_depth' && e.data?.depth != null)
      .map((e) => e.data!.depth as number);

    // Average time on page.
    const timeOnPageValues = events
      .filter((e) => e.type === 'time_on_page' && e.data?.seconds != null)
      .map((e) => e.data!.seconds as number);

    return {
      aiFeatureAdoption: parseFloat(safeDivide(sessionsWithAI, sessionCount).toFixed(4)),
      shareAdoption: parseFloat(safeDivide(sessionsWithShare, sessionCount).toFixed(4)),
      followAdoption: parseFloat(safeDivide(sessionsWithFollow, sessionCount).toFixed(4)),
      avgScrollDepth: parseFloat(mean(scrollDepths).toFixed(2)),
      avgTimeOnPage: parseFloat(mean(timeOnPageValues).toFixed(2)),
    };
  }

  // -----------------------------------------------------------------------
  // 6. Retention (simulated)
  // -----------------------------------------------------------------------

  /**
   * Return simulated retention rates.
   *
   * In a real product these would be computed from cohort analysis. Here we
   * use target baselines with small deterministic jitter so the values feel
   * alive but remain stable within a given day.
   */
  getRetentionMetrics(): RetentionMetrics {
    const rng = createSeededRandom(todaySeed() + 7777);

    // Jitter: +/- 3 percentage points around the baseline.
    const jitter = () => (rng() - 0.5) * 0.06;

    return {
      day1: parseFloat(Math.max(0, Math.min(1, 0.40 + jitter())).toFixed(4)),
      day7: parseFloat(Math.max(0, Math.min(1, 0.18 + jitter())).toFixed(4)),
      day30: parseFloat(Math.max(0, Math.min(1, 0.08 + jitter())).toFixed(4)),
    };
  }

  // -----------------------------------------------------------------------
  // 7. Fundraiser Performance
  // -----------------------------------------------------------------------

  /** Compute fundraiser performance KPIs from static fundraiser data. */
  getFundraiserPerformance(): FundraiserPerformance {
    if (fundraisers.length === 0) {
      return { avgCompletionRate: 0, avgTimeToFund: 0, successRate: 0 };
    }

    const completionRates = fundraisers.map((f) =>
      Math.min(safeDivide(f.raisedAmount, f.goalAmount), 1)
    );

    // Average time to fund: days between createdDate and lastDonationDate.
    const timesToFund = fundraisers.map((f) => {
      const created = new Date(f.createdDate).getTime();
      const lastDonation = new Date(f.lastDonationDate).getTime();
      return Math.max(0, (lastDonation - created) / MS_PER_DAY);
    });

    const successCount = fundraisers.filter((f) => f.raisedAmount >= f.goalAmount).length;

    return {
      avgCompletionRate: parseFloat(mean(completionRates).toFixed(4)),
      avgTimeToFund: parseFloat(mean(timesToFund).toFixed(1)),
      successRate: parseFloat(safeDivide(successCount, fundraisers.length).toFixed(4)),
    };
  }

  // -----------------------------------------------------------------------
  // 8. Page Performance (Core Web Vitals)
  // -----------------------------------------------------------------------

  /** Return averaged page performance metrics from recorded Web Vitals. */
  getPagePerformanceMetrics(): PagePerformanceMetrics {
    const records = this.vitalsRecords;

    if (records.length === 0) {
      return {
        avgLCP: null,
        avgFID: null,
        avgCLS: null,
        avgDomContentLoaded: null,
        avgPageLoad: null,
        avgTTFB: null,
        sampleCount: 0,
      };
    }

    const avg = (extractor: (r: WebVitalsRecord) => number | undefined): number | null => {
      const values = records.map(extractor).filter((v): v is number => v != null);
      return values.length > 0 ? parseFloat(mean(values).toFixed(2)) : null;
    };

    return {
      avgLCP: avg((r) => r.lcp),
      avgFID: avg((r) => r.fid),
      avgCLS: avg((r) => r.cls),
      avgDomContentLoaded: avg((r) => r.domContentLoaded),
      avgPageLoad: avg((r) => r.pageLoad),
      avgTTFB: avg((r) => r.ttfb),
      sampleCount: records.length,
    };
  }

  // -----------------------------------------------------------------------
  // Internal: historical data generation
  // -----------------------------------------------------------------------

  /**
   * Generate 30 days of realistic simulated historical data.
   *
   * The data is deterministic (seeded from today's date) so it does not
   * change across page refreshes.
   *
   * DAU ranges from ~150 to ~400 with a weekday/weekend pattern:
   *   - Weekdays (Mon-Fri): baseline ~280, +/- 80
   *   - Weekends (Sat-Sun): baseline ~190, +/- 40
   *
   * Revenue per day correlates loosely with DAU, averaging ~$45 per user
   * with high variance to simulate real donation patterns.
   */
  private generateHistoricalData(): HistoricalDayData[] {
    const rng = createSeededRandom(todaySeed());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data: HistoricalDayData[] = [];

    for (let i = HISTORICAL_DAYS - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * MS_PER_DAY);
      const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // DAU with weekday/weekend pattern.
      const dauBase = isWeekend ? 190 : 280;
      const dauVariance = isWeekend ? 40 : 80;
      const dau = Math.round(dauBase + (rng() - 0.5) * 2 * dauVariance);

      // Sessions: typically ~1.3 sessions per user.
      const sessions = Math.round(dau * (1.2 + rng() * 0.2));

      // Donations: ~2-5% of users donate on any given day.
      const donationRate = 0.02 + rng() * 0.03;
      const donationCount = Math.max(1, Math.round(dau * donationRate));

      // Revenue: average donation ~$45, with log-normal-ish variation.
      const avgDonation = 30 + rng() * 40; // $30-$70
      const revenue = parseFloat((donationCount * avgDonation).toFixed(2));

      data.push({
        date: formatDate(date),
        dau: Math.max(100, dau), // Floor at 100
        revenue,
        sessions,
        donations: donationCount,
      });
    }

    return data;
  }

  // -----------------------------------------------------------------------
  // Internal: event handling
  // -----------------------------------------------------------------------

  /**
   * Handle incoming events from the analytics tracker.
   *
   * We inspect the latest event(s) to update the live visitor counter. In a
   * real system each user would have a unique ID; here we use the page path
   * as a rough proxy -- each newly-seen page increments the counter by 1.
   */
  private handleNewEvents(allEvents: AnalyticsEvent[]): void {
    if (allEvents.length === 0) return;

    // Look at the most recent event.
    const latest = allEvents[allEvents.length - 1];
    if (latest.type === 'page_view' && !this.seenPages.has(latest.page)) {
      this.seenPages.add(latest.page);
      this.liveVisitorCount += 1;
    }
  }

  /** Push an updated dashboard snapshot to all subscribers. */
  private notifyListeners(): void {
    if (this.listeners.size === 0) return;
    const dashboard = this.getBusinessDashboard();
    this.listeners.forEach((listener) => {
      try {
        listener(dashboard);
      } catch {
        // Swallow subscriber errors to avoid breaking the pipeline.
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const businessMetrics = new BusinessMetrics();
