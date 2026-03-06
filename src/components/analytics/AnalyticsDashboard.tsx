'use client';

import { useState, useEffect, useCallback } from 'react';
import { analytics } from '@/lib/analytics';
import { businessMetrics, type BusinessDashboard } from '@/lib/metrics';
import { getPerformanceMetrics } from '@/hooks/usePerformance';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = 'overview' | 'funnel' | 'engagement' | 'revenue' | 'performance' | 'feed';

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'funnel', label: 'Funnel' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'feed', label: 'Feed' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'performance', label: 'Performance' },
];

// ---------------------------------------------------------------------------
// Helper: format utilities
// ---------------------------------------------------------------------------

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function fmtCurrency(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  subtitle,
  trend,
  valueColor = 'text-white',
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold leading-tight ${valueColor}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
      {trend && <p className="text-[10px] text-emerald-400 mt-0.5">{trend}</p>}
    </div>
  );
}

function FunnelBar({
  label,
  count,
  rate,
  maxCount,
}: {
  label: string;
  count: number;
  rate: number | null;
  maxCount: number;
}) {
  const widthPct = maxCount > 0 ? Math.max((count / maxCount) * 100, 8) : 8;
  const rateColor =
    rate === null
      ? 'text-gray-400'
      : rate > 0.5
        ? 'text-emerald-400'
        : rate > 0.2
          ? 'text-yellow-400'
          : 'text-red-400';

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">{fmtNum(count)}</span>
          {rate !== null && (
            <span className={`text-[10px] font-medium ${rateColor}`}>{fmtPct(rate)}</span>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  maxValue = 1,
  color = 'bg-emerald-500',
}: {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-300">{label}</span>
        <span className="text-xs font-semibold text-white">{fmtPct(value)}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniBarChart({
  values,
  height = 40,
  barColor = 'bg-emerald-500',
}: {
  values: number[];
  height?: number;
  barColor?: string;
}) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {values.map((v, i) => {
        const barH = max > 0 ? Math.max((v / max) * height, 2) : 2;
        return (
          <div
            key={i}
            className={`flex-1 rounded-t ${barColor} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: barH }}
            title={String(v)}
          />
        );
      })}
    </div>
  );
}

function VitalMetric({
  label,
  value,
  unit,
  thresholds,
}: {
  label: string;
  value: number | null;
  unit: string;
  thresholds: { good: number; warning: number };
}) {
  let color = 'bg-gray-600';
  let textColor = 'text-gray-400';
  let status = 'N/A';

  if (value !== null) {
    if (value < thresholds.good) {
      color = 'bg-emerald-500';
      textColor = 'text-emerald-400';
      status = 'Good';
    } else if (value < thresholds.warning) {
      color = 'bg-yellow-500';
      textColor = 'text-yellow-400';
      status = 'Needs Work';
    } else {
      color = 'bg-red-500';
      textColor = 'text-red-400';
      status = 'Poor';
    }
  }

  const displayValue =
    value !== null
      ? unit === 'ms'
        ? `${value.toFixed(0)}${unit}`
        : `${value.toFixed(3)}`
      : '--';

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
        <div>
          <p className="text-xs font-medium text-gray-200">{label}</p>
          <p className="text-[10px] text-gray-500">
            Good: &lt;{thresholds.good}
            {unit === 'ms' ? 'ms' : ''} | Poor: &ge;{thresholds.warning}
            {unit === 'ms' ? 'ms' : ''}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${textColor}`}>{displayValue}</p>
        <p className="text-[10px] text-gray-500">{status}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab Content Components
// ---------------------------------------------------------------------------

function OverviewTab({ dashboard }: { dashboard: BusinessDashboard }) {
  const { activeUsers, sessions, retention } = dashboard;
  const events = analytics.getEvents();
  const totalEvents = events.length;
  const totalPageViews = events.filter((e) => e.type === 'page_view').length;
  const shareClicks = events.filter((e) => e.type === 'share_click').length;
  const aiEvents = events.filter(
    (e) => e.type === 'ai_story_generate' || e.type === 'ai_suggestion_click'
  ).length;

  // Last 7 days DAU for mini chart
  const last7DAU = activeUsers.historicalDAU.slice(-7).map((d) => d.dau);

  return (
    <div className="space-y-4">
      {/* Active Users */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Active Users</p>
        <div className="flex items-end gap-4">
          <div>
            <p className="text-3xl font-bold text-emerald-400">{fmtNum(activeUsers.dauToday)}</p>
            <p className="text-[10px] text-gray-500">DAU Today</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-300">{fmtNum(activeUsers.mau)}</p>
            <p className="text-[10px] text-gray-500">MAU</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-sky-400">{fmtPct(activeUsers.stickiness)}</p>
            <p className="text-[10px] text-gray-500">Stickiness</p>
          </div>
        </div>
        {/* Mini sparkline */}
        <div className="mt-3">
          <p className="text-[10px] text-gray-500 mb-1">DAU Trend (7 days)</p>
          <MiniBarChart values={last7DAU} height={32} />
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Sessions</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-sm font-bold text-white">{fmtNum(sessions.totalSessions)}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{fmtDuration(sessions.avgSessionDuration)}</p>
            <p className="text-[10px] text-gray-500">Avg Duration</p>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{sessions.avgPagesPerSession.toFixed(1)}</p>
            <p className="text-[10px] text-gray-500">Pages/Session</p>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{fmtPct(sessions.bounceRate)}</p>
            <p className="text-[10px] text-gray-500">Bounce</p>
          </div>
        </div>
      </div>

      {/* Retention */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Retention</p>
        <div className="space-y-1.5">
          {[
            { label: 'D1', value: retention.day1, color: 'bg-emerald-500' },
            { label: 'D7', value: retention.day7, color: 'bg-sky-500' },
            { label: 'D30', value: retention.day30, color: 'bg-purple-500' },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-6">{r.label}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${r.color} transition-all duration-500`}
                  style={{ width: `${Math.min(r.value * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-300 w-10 text-right">
                {fmtPct(r.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Events" value={fmtNum(totalEvents)} valueColor="text-emerald-400" />
        <StatCard label="Page Views" value={fmtNum(totalPageViews)} valueColor="text-sky-400" />
        <StatCard label="Share Clicks" value={fmtNum(shareClicks)} valueColor="text-purple-400" />
        <StatCard label="AI Features" value={fmtNum(aiEvents)} valueColor="text-amber-400" />
      </div>
    </div>
  );
}

function FunnelTab({ dashboard }: { dashboard: BusinessDashboard }) {
  const funnel = dashboard.conversionFunnel;
  const maxCount = Math.max(funnel.visitors, 1);

  const steps: { label: string; count: number; rate: number | null }[] = [
    { label: 'Visitors', count: funnel.visitors, rate: null },
    { label: 'Button Clicks', count: funnel.donateButtonClicks, rate: funnel.visitorToButtonRate },
    { label: 'Modal Opens', count: funnel.modalOpens, rate: funnel.buttonToModalRate },
    { label: 'Amount Selects', count: funnel.amountSelects, rate: funnel.modalToAmountRate },
    { label: 'Submissions', count: funnel.submissions, rate: funnel.amountToSubmitRate },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">
          Donation Conversion Funnel
        </p>
        <div className="space-y-0.5">
          {steps.map((step) => (
            <FunnelBar
              key={step.label}
              label={step.label}
              count={step.count}
              rate={step.rate}
              maxCount={maxCount}
            />
          ))}
        </div>
      </div>

      {/* Overall Conversion */}
      <div className="bg-gray-800/40 rounded-xl p-4 text-center">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
          Overall Conversion Rate
        </p>
        <p
          className={`text-3xl font-bold ${
            funnel.overallConversionRate > 0.05
              ? 'text-emerald-400'
              : funnel.overallConversionRate > 0.01
                ? 'text-yellow-400'
                : 'text-red-400'
          }`}
        >
          {fmtPct(funnel.overallConversionRate)}
        </p>
        <p className="text-[10px] text-gray-500 mt-1">
          {funnel.submissions} of {funnel.visitors} visitors donated
        </p>
      </div>
    </div>
  );
}

function EngagementTab({ dashboard }: { dashboard: BusinessDashboard }) {
  const { engagement, sessions } = dashboard;

  return (
    <div className="space-y-4">
      {/* Feature Adoption */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Feature Adoption</p>
        <MetricBar label="AI Features" value={engagement.aiFeatureAdoption} color="bg-amber-500" />
        <MetricBar label="Sharing" value={engagement.shareAdoption} color="bg-purple-500" />
        <MetricBar label="Following" value={engagement.followAdoption} color="bg-sky-500" />
      </div>

      {/* Content Metrics */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Content Metrics</p>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-300">Avg Scroll Depth</span>
            <span className="text-xs font-semibold text-white">
              {engagement.avgScrollDepth.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500"
              style={{ width: `${Math.min(engagement.avgScrollDepth, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Avg Time on Page</span>
          <span className="text-xs font-semibold text-white">
            {fmtDuration(engagement.avgTimeOnPage)}
          </span>
        </div>
      </div>

      {/* Session Quality */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Session Quality</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Pages / Session"
            value={sessions.avgPagesPerSession.toFixed(1)}
            valueColor="text-sky-400"
          />
          <StatCard
            label="Bounce Rate"
            value={fmtPct(sessions.bounceRate)}
            valueColor={
              sessions.bounceRate < 0.3
                ? 'text-emerald-400'
                : sessions.bounceRate < 0.6
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }
          />
        </div>
      </div>
    </div>
  );
}

function RevenueTab({ dashboard }: { dashboard: BusinessDashboard }) {
  const { revenue, fundraiserPerformance } = dashboard;

  // Last 7 days revenue for mini chart
  const last7Revenue = revenue.historicalRevenue.slice(-7).map((d) => d.revenue);

  return (
    <div className="space-y-4">
      {/* Total Revenue */}
      <div className="bg-gray-800/40 rounded-xl p-4 text-center">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Total Revenue</p>
        <p className="text-3xl font-bold text-emerald-400">{fmtCurrency(revenue.totalRevenue)}</p>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Avg Donation"
          value={fmtCurrency(revenue.averageDonation)}
          valueColor="text-white"
        />
        <StatCard
          label="Rev / Visitor"
          value={fmtCurrency(revenue.revenuePerVisitor)}
          valueColor="text-white"
        />
        <StatCard
          label="Rev / Session"
          value={fmtCurrency(revenue.revenuePerSession)}
          valueColor="text-white"
        />
        <StatCard
          label="Velocity"
          value={`${fmtCurrency(revenue.donationVelocity)}/hr`}
          valueColor="text-sky-400"
        />
      </div>

      {/* Fundraiser Performance */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">
          Fundraiser Performance
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Avg Completion</span>
            <span className="text-xs font-semibold text-emerald-400">
              {fmtPct(fundraiserPerformance.avgCompletionRate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Success Rate</span>
            <span className="text-xs font-semibold text-sky-400">
              {fmtPct(fundraiserPerformance.successRate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Avg Time to Fund</span>
            <span className="text-xs font-semibold text-white">
              {fundraiserPerformance.avgTimeToFund.toFixed(1)} days
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] text-gray-500 mb-1">Revenue Trend (7 days)</p>
        <MiniBarChart values={last7Revenue} height={48} barColor="bg-emerald-500" />
      </div>
    </div>
  );
}

function PerformanceTab({ dashboard }: { dashboard: BusinessDashboard }) {
  const perf = getPerformanceMetrics();
  const pagePerf = dashboard.pagePerformance;

  // Prefer the hook-based perf data if available, fall back to dashboard data
  const lcp = perf.readings > 0 ? perf.avgLCP : (pagePerf.avgLCP ?? null);
  const fid = perf.readings > 0 ? perf.avgFID : (pagePerf.avgFID ?? null);
  const cls = perf.readings > 0 ? perf.avgCLS : (pagePerf.avgCLS ?? null);
  const ttfb = perf.readings > 0 ? perf.avgTTFB : (pagePerf.avgTTFB ?? null);
  const pageLoad = perf.readings > 0 ? perf.avgPageLoad : (pagePerf.avgPageLoad ?? null);
  const sampleCount = perf.readings > 0 ? perf.readings : pagePerf.sampleCount;

  return (
    <div className="space-y-4">
      {/* Core Web Vitals */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">Core Web Vitals</p>
          <p className="text-[10px] text-gray-500">{sampleCount} reading{sampleCount !== 1 ? 's' : ''}</p>
        </div>
        <VitalMetric
          label="LCP"
          value={lcp}
          unit="ms"
          thresholds={{ good: 2500, warning: 4000 }}
        />
        <VitalMetric
          label="FID"
          value={fid}
          unit="ms"
          thresholds={{ good: 100, warning: 300 }}
        />
        <VitalMetric
          label="CLS"
          value={cls}
          unit="score"
          thresholds={{ good: 0.1, warning: 0.25 }}
        />
      </div>

      {/* Navigation Timing */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Navigation Timing</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  ttfb !== null
                    ? ttfb < 800
                      ? 'bg-emerald-500'
                      : ttfb < 1800
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    : 'bg-gray-600'
                }`}
              />
              <span className="text-xs text-gray-300">TTFB</span>
            </div>
            <span className="text-xs font-semibold text-white">
              {ttfb !== null ? `${ttfb.toFixed(0)}ms` : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  pageLoad !== null
                    ? pageLoad < 3000
                      ? 'bg-emerald-500'
                      : pageLoad < 6000
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    : 'bg-gray-600'
                }`}
              />
              <span className="text-xs text-gray-300">Page Load</span>
            </div>
            <span className="text-xs font-semibold text-white">
              {pageLoad !== null ? `${pageLoad.toFixed(0)}ms` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedTab() {
  const events = analytics.getEvents();
  const feedViews = events.filter((e) => e.type === 'feed_item_view');
  const feedScrolls = events.filter((e) => e.type === 'feed_scroll');

  // Time spent per category
  const categoryTime: Record<string, { totalMs: number; views: number }> = {};
  feedViews.forEach((e) => {
    const cat = (e.data?.category as string) || 'unknown';
    if (!categoryTime[cat]) categoryTime[cat] = { totalMs: 0, views: 0 };
    categoryTime[cat].totalMs += (e.data?.timeSpentMs as number) || 0;
    categoryTime[cat].views += 1;
  });

  // Sort categories by total time spent
  const sortedCategories = Object.entries(categoryTime)
    .sort(([, a], [, b]) => b.totalMs - a.totalMs);
  const maxCatTime = sortedCategories.length > 0 ? sortedCategories[0][1].totalMs : 1;

  // Most viewed items
  const itemViews: Record<string, { id: string; type: string; totalMs: number; views: number }> = {};
  feedViews.forEach((e) => {
    const id = (e.data?.itemId as string) || 'unknown';
    const type = (e.data?.itemType as string) || 'unknown';
    if (!itemViews[id]) itemViews[id] = { id, type, totalMs: 0, views: 0 };
    itemViews[id].totalMs += (e.data?.timeSpentMs as number) || 0;
    itemViews[id].views += 1;
  });

  const topItems = Object.values(itemViews)
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, 5);

  // Total feed session time
  const totalFeedTimeMs = feedViews.reduce((sum, e) => sum + ((e.data?.timeSpentMs as number) || 0), 0);
  const avgTimePerItem = feedViews.length > 0 ? totalFeedTimeMs / feedViews.length : 0;

  // Scroll velocity (scrolls per minute)
  const feedPageViews = events.filter(
    (e) => e.type === 'page_view' && (e.data?.viewMode === 'feed' || e.data?.page === 'discover')
  );
  const sessionStart = feedPageViews.length > 0 ? feedPageViews[0].timestamp : Date.now();
  const sessionMinutes = Math.max((Date.now() - sessionStart) / 60000, 0.1);
  const scrollVelocity = feedScrolls.length / sessionMinutes;

  // Category emojis
  const catEmoji: Record<string, string> = {
    emergency: '🚨', medical: '🏥', education: '📚', nonprofit: '💛',
    community: '🏘️', animals: '🐾', environment: '🌿', memorial: '🕊️',
    sports: '⚽', other: '✨',
  };

  return (
    <div className="space-y-4">
      {/* Feed Overview */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Feed Engagement</p>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Items Viewed"
            value={feedViews.length}
            valueColor="text-emerald-400"
          />
          <StatCard
            label="Scroll Events"
            value={feedScrolls.length}
            valueColor="text-sky-400"
          />
          <StatCard
            label="Total Feed Time"
            value={fmtDuration(totalFeedTimeMs / 1000)}
            valueColor="text-purple-400"
          />
          <StatCard
            label="Avg Time / Item"
            value={fmtDuration(avgTimePerItem / 1000)}
            valueColor="text-amber-400"
          />
        </div>
      </div>

      {/* Scroll Velocity */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Scroll Velocity</p>
        <div className="flex items-end gap-3">
          <p className="text-2xl font-bold text-sky-400">{scrollVelocity.toFixed(1)}</p>
          <p className="text-xs text-gray-400 pb-0.5">scrolls/min</p>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          {scrollVelocity > 10 ? 'Fast scrolling — users may be skimming' :
           scrollVelocity > 3 ? 'Normal pace — engaged browsing' :
           scrollVelocity > 0 ? 'Slow scrolling — deep engagement' : 'No scroll data yet'}
        </p>
      </div>

      {/* Category Interest */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Category Interest (by time)</p>
        {sortedCategories.length > 0 ? (
          <div className="space-y-2">
            {sortedCategories.map(([cat, data]) => {
              const pct = maxCatTime > 0 ? (data.totalMs / maxCatTime) * 100 : 0;
              return (
                <div key={cat} className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">
                      {catEmoji[cat] || '📌'} <span className="capitalize">{cat}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{data.views} views</span>
                      <span className="text-xs font-semibold text-white">{fmtDuration(data.totalMs / 1000)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500">Use the Feed view to generate data</p>
        )}
      </div>

      {/* Top Items by Dwell Time */}
      <div className="bg-gray-800/40 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Top Items (by dwell time)</p>
        {topItems.length > 0 ? (
          <div className="space-y-2">
            {topItems.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2 py-1 border-b border-gray-800/50 last:border-0">
                <span className="text-[10px] text-gray-500 w-4">{i + 1}.</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  item.type === 'fundraiser' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {item.type === 'fundraiser' ? '💰' : '👥'}
                </span>
                <span className="text-xs text-gray-300 flex-1 truncate">{item.id}</span>
                <span className="text-xs font-semibold text-white">{fmtDuration(item.totalMs / 1000)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">Use the Feed view to generate data</p>
        )}
      </div>

      {/* Personalization Signal */}
      {sortedCategories.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl p-3 border border-purple-500/20">
          <p className="text-[10px] uppercase tracking-wider text-purple-300 mb-2">🤖 AI Personalization Signal</p>
          <p className="text-xs text-gray-300">
            Based on feed behavior, this user shows strongest interest in{' '}
            <span className="text-purple-300 font-semibold capitalize">
              {sortedCategories[0]?.[0] || 'N/A'}
            </span>
            {sortedCategories[1] && (
              <> and <span className="text-purple-300 font-semibold capitalize">{sortedCategories[1][0]}</span></>
            )}.
          </p>
          <p className="text-[10px] text-gray-500 mt-1.5">
            Recommendation: Prioritize {sortedCategories[0]?.[0]} fundraisers in their feed and email digest.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Component
// ---------------------------------------------------------------------------

export default function AnalyticsDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [dashboard, setDashboard] = useState<BusinessDashboard>(() =>
    businessMetrics.getBusinessDashboard()
  );

  // Subscribe to businessMetrics for reactive updates
  const handleMetricsUpdate = useCallback((d: BusinessDashboard) => {
    setDashboard(d);
  }, []);

  // Subscribe to analytics for quick stat updates (triggers re-render)
  const handleAnalyticsUpdate = useCallback(() => {
    setDashboard(businessMetrics.getBusinessDashboard());
  }, []);

  useEffect(() => {
    businessMetrics.subscribe(handleMetricsUpdate);
    analytics.subscribe(handleAnalyticsUpdate);
    return () => {
      businessMetrics.unsubscribe(handleMetricsUpdate);
      analytics.unsubscribe(handleAnalyticsUpdate);
    };
  }, [handleMetricsUpdate, handleAnalyticsUpdate]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center text-lg"
        title="Analytics Dashboard"
      >
        📊
      </button>

      {/* Dashboard Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-[85vh] bg-gray-900 text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-4 pt-4 pb-2 border-b border-gray-800 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm tracking-tight">📊 Business Metrics</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'overview' && <OverviewTab dashboard={dashboard} />}
            {activeTab === 'funnel' && <FunnelTab dashboard={dashboard} />}
            {activeTab === 'engagement' && <EngagementTab dashboard={dashboard} />}
            {activeTab === 'feed' && <FeedTab />}
            {activeTab === 'revenue' && <RevenueTab dashboard={dashboard} />}
            {activeTab === 'performance' && <PerformanceTab dashboard={dashboard} />}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-800 shrink-0">
            <p className="text-[9px] text-gray-600 text-center">
              Last updated: {new Date(dashboard.generatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
