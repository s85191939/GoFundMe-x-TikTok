import { AnalyticsEvent, AnalyticsEventType } from '@/data/types';

type AnalyticsListener = (events: AnalyticsEvent[]) => void;

export interface AnalyticsMetrics {
  totalPageViews: number;
  avgTimeOnPage: number;
  maxScrollDepth: number;
  ctaClicks: number;
  donationFunnel: {
    buttonClicks: number;
    modalOpens: number;
    amountSelects: number;
    submissions: number;
  };
  shareClicks: number;
}

class AnalyticsTracker {
  private static instance: AnalyticsTracker | null = null;
  private events: AnalyticsEvent[] = [];
  private listeners: Set<AnalyticsListener> = new Set();

  constructor() {
    if (AnalyticsTracker.instance) {
      return AnalyticsTracker.instance;
    }
    AnalyticsTracker.instance = this;
  }

  /**
   * Track an analytics event.
   */
  track(type: AnalyticsEventType, page: string, data?: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      type,
      page,
      timestamp: Date.now(),
      data,
    };

    this.events.push(event);

    if (typeof console !== 'undefined') {
      console.log(`[Analytics] ${type} on ${page}`, data ?? '');
    }

    this.notifyListeners();
  }

  /**
   * Return all tracked events.
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Compute aggregate metrics from tracked events.
   */
  getMetrics(): AnalyticsMetrics {
    const pageViews = this.events.filter((e) => e.type === 'page_view');
    const timeOnPageEvents = this.events.filter((e) => e.type === 'time_on_page');
    const scrollEvents = this.events.filter((e) => e.type === 'scroll_depth');
    const ctaEvents = this.events.filter((e) => e.type === 'cta_click');
    const shareEvents = this.events.filter((e) => e.type === 'share_click');

    const donateButtonClicks = this.events.filter((e) => e.type === 'donate_button_click').length;
    const donateModalOpens = this.events.filter((e) => e.type === 'donate_modal_open').length;
    const donateAmountSelects = this.events.filter((e) => e.type === 'donate_amount_select').length;
    const donateSubmissions = this.events.filter((e) => e.type === 'donate_submit').length;

    const avgTime =
      timeOnPageEvents.length > 0
        ? timeOnPageEvents.reduce((sum, e) => sum + ((e.data?.seconds as number) ?? 0), 0) /
          timeOnPageEvents.length
        : 0;

    const maxScroll =
      scrollEvents.length > 0
        ? Math.max(...scrollEvents.map((e) => (e.data?.depth as number) ?? 0))
        : 0;

    return {
      totalPageViews: pageViews.length,
      avgTimeOnPage: Math.round(avgTime),
      maxScrollDepth: maxScroll,
      ctaClicks: ctaEvents.length,
      donationFunnel: {
        buttonClicks: donateButtonClicks,
        modalOpens: donateModalOpens,
        amountSelects: donateAmountSelects,
        submissions: donateSubmissions,
      },
      shareClicks: shareEvents.length,
    };
  }

  /**
   * Subscribe to analytics updates for real-time dashboard.
   */
  subscribe(listener: AnalyticsListener): void {
    this.listeners.add(listener);
  }

  /**
   * Unsubscribe from analytics updates.
   */
  unsubscribe(listener: AnalyticsListener): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const snapshot = this.getEvents();
    this.listeners.forEach((listener) => {
      listener(snapshot);
    });
  }
}

export const analytics = new AnalyticsTracker();
