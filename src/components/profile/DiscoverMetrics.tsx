'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getEngagementHistory, type EngagementEvent } from '@/lib/recommendation';
import { analytics } from '@/lib/analytics';
import { getFundraiserById, getAllFundraisers } from '@/data/fundraisers';
import { formatCurrency } from '@/lib/formatters';
import type { FundraiserCategory } from '@/data/types';
import { CATEGORY_ADJACENCY } from '@/lib/feedAlgorithm';

// ─── Types ───────────────────────────────────────────────────

interface CategoryStat {
  category: string;
  emoji: string;
  dwellMs: number;
  views: number;
  likes: number;
  donateClicks: number;
  shares: number;
  percentage: number;
}

interface FundraiserDwell {
  id: string;
  title: string;
  heroImage: string;
  category: string;
  dwellMs: number;
  views: number;
  raisedAmount: number;
}

type Tab = 'categories' | 'top' | 'algorithm';

const categoryEmoji: Record<string, string> = {
  emergency: '🚨', medical: '🏥', education: '📚', nonprofit: '💛',
  community: '🏘️', animals: '🐾', environment: '🌿', memorial: '🕊️',
  sports: '⚽', other: '✨',
};

const categoryColors: Record<string, string> = {
  emergency: '#ef4444', medical: '#3b82f6', education: '#8b5cf6', nonprofit: '#f59e0b',
  community: '#10b981', animals: '#ec4899', environment: '#22c55e', memorial: '#6b7280',
  sports: '#f97316', other: '#a855f7',
};

// ─── Animated Number ─────────────────────────────────────────

function AnimatedNumber({ value, suffix = '', prefix = '', decimals = 0, duration = 1200 }: {
  value: number; suffix?: string; prefix?: string; decimals?: number; duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * value;
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}{suffix}
    </span>
  );
}

// ─── Ring Chart (SVG) ────────────────────────────────────────

function RingChart({ segments, size = 120, strokeWidth = 14 }: {
  segments: { color: string; percentage: number; label: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // Build segments with cumulative offsets
  const rendered: { seg: typeof segments[0]; dashLength: number; gapLength: number; offset: number; index: number }[] = [];
  let cumulativePercent = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const dashLength = (seg.percentage / 100) * circumference;
    const gapLength = circumference - dashLength;
    const offset = -(cumulativePercent / 100) * circumference;
    rendered.push({ seg, dashLength, gapLength, offset, index: i });
    cumulativePercent += seg.percentage;
  }

  // Render in reverse so largest segment paints last (on top) — no overlap issues
  const reversed = [...rendered].reverse();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1f2937" strokeWidth={strokeWidth} />
      {/* Segments — rendered smallest-first so larger ones paint on top */}
      {reversed.map(({ seg, dashLength, gapLength, offset, index }) => (
        <circle
          key={index}
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashLength} ${gapLength}`}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: `${cx}px ${cy}px`,
            transition: `stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`,
          }}
        />
      ))}
    </svg>
  );
}

// ─── Funnel Bar ──────────────────────────────────────────────

function FunnelBar({ label, value, maxValue, color, icon, delay = 0 }: {
  label: string; value: number; maxValue: number; color: string; icon: string; delay?: number;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
          <span>{icon}</span> {label}
        </span>
        <span className="text-xs font-bold text-white">{value}</span>
      </div>
      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Swipe Speed Visualization ───────────────────────────────

function SwipeSpeedChart({ dwellTimes }: { dwellTimes: number[] }) {
  if (dwellTimes.length === 0) return null;

  const max = Math.max(...dwellTimes);
  const avg = dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length;

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-[2px] h-16">
        {dwellTimes.slice(-30).map((ms, i) => {
          const height = max > 0 ? (ms / max) * 100 : 0;
          const isAboveAvg = ms > avg;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-500"
              style={{
                height: `${Math.max(height, 4)}%`,
                backgroundColor: isAboveAvg ? '#00b964' : '#374151',
                opacity: 0.5 + (i / dwellTimes.slice(-30).length) * 0.5,
                transitionDelay: `${i * 30}ms`,
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span>Oldest</span>
        <span>Most recent</span>
      </div>
    </div>
  );
}

// ─── Simulated seed data (demo mode) ─────────────────────────

function generateSeedData(): EngagementEvent[] {
  const fundraisers = getAllFundraisers();
  const events: EngagementEvent[] = [];
  const now = Date.now();

  // Deterministic PRNG
  let seed = 42;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };

  // Simulate scrolling through ~35 fundraisers across multiple sessions
  const shuffled = [...fundraisers].sort(() => rand() - 0.5);

  for (let i = 0; i < Math.min(35, shuffled.length * 3); i++) {
    const f = shuffled[i % shuffled.length];
    const timeOffset = Math.round(rand() * 600000); // within 10 min window

    // View event
    events.push({
      itemId: f.id,
      category: f.category as FundraiserCategory,
      action: 'view',
      timestamp: now - timeOffset,
    });

    // Dwell event — most get 1-4s, a few get 6-15s (high attention)
    const isHighAttention = rand() < 0.25;
    const dwellMs = isHighAttention
      ? Math.round(6000 + rand() * 9000)
      : Math.round(800 + rand() * 3200);

    events.push({
      itemId: f.id,
      category: f.category as FundraiserCategory,
      action: 'dwell',
      durationMs: dwellMs,
      timestamp: now - timeOffset + dwellMs,
    });

    // Some get engagement actions
    if (rand() < 0.25) {
      events.push({
        itemId: f.id,
        category: f.category as FundraiserCategory,
        action: 'like',
        timestamp: now - timeOffset + dwellMs + 200,
      });
    }
    if (rand() < 0.15) {
      events.push({
        itemId: f.id,
        category: f.category as FundraiserCategory,
        action: 'save',
        timestamp: now - timeOffset + dwellMs + 350,
      });
    }
    if (rand() < 0.15) {
      events.push({
        itemId: f.id,
        category: f.category as FundraiserCategory,
        action: 'donate_click',
        timestamp: now - timeOffset + dwellMs + 500,
      });
    }
    if (rand() < 0.1) {
      events.push({
        itemId: f.id,
        category: f.category as FundraiserCategory,
        action: 'share',
        timestamp: now - timeOffset + dwellMs + 800,
      });
    }
    if (rand() < 0.12) {
      events.push({
        itemId: f.id,
        category: f.category as FundraiserCategory,
        action: 'follow_organizer',
        timestamp: now - timeOffset + dwellMs + 300,
      });
    }
  }

  return events;
}

// ─── Compute metrics (extracted so it only runs client-side) ─

function computeMetrics() {
  const realHistory = getEngagementHistory();
  const history = realHistory.length > 0 ? realHistory : generateSeedData();

  const fundraiserDwells: Record<string, { totalMs: number; views: number }> = {};
  const categoryDwells: Record<string, {
    dwellMs: number; views: number; likes: number; donateClicks: number; shares: number;
  }> = {};
  const allDwellTimes: number[] = [];

  for (const event of history) {
    const cat = event.category;
    if (!categoryDwells[cat]) {
      categoryDwells[cat] = { dwellMs: 0, views: 0, likes: 0, donateClicks: 0, shares: 0 };
    }
    if (event.action === 'dwell' && event.durationMs) {
      const baseId = event.itemId.replace(/-cycle-\d+$/, '');
      if (!fundraiserDwells[baseId]) fundraiserDwells[baseId] = { totalMs: 0, views: 0 };
      fundraiserDwells[baseId].totalMs += event.durationMs;
      fundraiserDwells[baseId].views += 1;
      categoryDwells[cat].dwellMs += event.durationMs;
      allDwellTimes.push(event.durationMs);
    }
    if (event.action === 'view') {
      const baseId = event.itemId.replace(/-cycle-\d+$/, '');
      if (!fundraiserDwells[baseId]) fundraiserDwells[baseId] = { totalMs: 0, views: 0 };
      fundraiserDwells[baseId].views += 1;
      categoryDwells[cat].views += 1;
    }
    if (event.action === 'donate_click') categoryDwells[cat].donateClicks += 1;
    if (event.action === 'share') categoryDwells[cat].shares += 1;
    if (event.action === 'follow_organizer') categoryDwells[cat].likes += 1;
  }

  const totalDwellMs = allDwellTimes.reduce((a, b) => a + b, 0);
  const totalViews = history.filter(e => e.action === 'view').length;
  const totalDonateClicks = history.filter(e => e.action === 'donate_click').length;
  const totalShares = history.filter(e => e.action === 'share').length;
  const totalFollows = history.filter(e => e.action === 'follow_organizer').length;
  const totalLikes = history.filter(e => e.action === 'like').length;
  const totalSaves = history.filter(e => e.action === 'save').length;
  const avgDwellMs = allDwellTimes.length > 0 ? allDwellTimes.reduce((a, b) => a + b, 0) / allDwellTimes.length : 0;

  const totalCategoryDwell = Object.values(categoryDwells).reduce((s, c) => s + c.dwellMs, 0);
  const categoryStats: CategoryStat[] = Object.entries(categoryDwells)
    .map(([cat, stats]) => ({
      category: cat, emoji: categoryEmoji[cat] || '✨',
      dwellMs: stats.dwellMs, views: stats.views, likes: stats.likes,
      donateClicks: stats.donateClicks, shares: stats.shares,
      percentage: totalCategoryDwell > 0 ? (stats.dwellMs / totalCategoryDwell) * 100 : 0,
    }))
    .sort((a, b) => b.dwellMs - a.dwellMs);

  const topFundraisers: FundraiserDwell[] = Object.entries(fundraiserDwells)
    .map(([id, stats]) => {
      const f = getFundraiserById(id);
      if (!f) return null;
      return { id, title: f.title, heroImage: f.heroImage, category: f.category, dwellMs: stats.totalMs, views: stats.views, raisedAmount: f.raisedAmount };
    })
    .filter(Boolean)
    .sort((a, b) => (b as FundraiserDwell).dwellMs - (a as FundraiserDwell).dwellMs)
    .slice(0, 8) as FundraiserDwell[];

  const totalCatEngagement = Object.values(categoryDwells).reduce((s, c) => s + c.dwellMs, 0);
  const categoryInfluence = categoryStats.map(c => {
    const baseWeight = totalCatEngagement > 0 ? c.dwellMs / totalCatEngagement : 0;
    const actionTypes = new Set<string>();
    for (const e of history) { if (e.category === c.category) actionTypes.add(e.action); }
    const compoundMultiplier = Math.pow(1.3, Math.max(0, actionTypes.size - 1));
    const boostedWeight = baseWeight * compoundMultiplier;
    const adj = CATEGORY_ADJACENCY[c.category as FundraiserCategory];
    return {
      category: c.category, emoji: c.emoji,
      baseWeight: baseWeight * 100, boostedWeight: boostedWeight * 100,
      actions: actionTypes.size, adjacentBoost: adj ? adj.primary : [],
    };
  }).filter(c => c.baseWeight > 0).sort((a, b) => b.boostedWeight - a.boostedWeight);

  return {
    totalViews, totalDonateClicks, totalShares, totalFollows, totalLikes, totalSaves,
    avgDwellMs, allDwellTimes, categoryStats, topFundraisers, categoryInfluence,
  };
}

type MetricsData = ReturnType<typeof computeMetrics>;

// ─── Main Component ──────────────────────────────────────────

export default function DiscoverMetrics() {
  const [activeTab, setActiveTab] = useState<Tab>('categories');
  const [data, setData] = useState<MetricsData | null>(null);

  // Compute metrics only on client to avoid hydration mismatch
  useEffect(() => {
    setData(computeMetrics());
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'categories', label: 'Categories', icon: '🎯' },
    { id: 'top', label: 'Top Viewed', icon: '🏆' },
    { id: 'algorithm', label: 'Algorithm', icon: '🧠' },
  ];

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📊</span> Discover Metrics
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Only visible to you</span>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">📊</span> Discover Metrics
        </h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Only visible to you</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-xs font-medium py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-gray-700 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Card — Dark theme */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl overflow-hidden">

        {/* ─── CATEGORIES TAB ─── */}
        {activeTab === 'categories' && (
          <div className="p-5 space-y-6">
            {/* Ring Chart + Legend */}
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <RingChart
                  segments={data.categoryStats.slice(0, 6).map(c => ({
                    color: categoryColors[c.category] || '#6b7280',
                    percentage: c.percentage,
                    label: c.category,
                  }))}
                  size={120}
                  strokeWidth={14}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                {data.categoryStats.slice(0, 5).map(c => (
                  <div key={c.category} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categoryColors[c.category] || '#6b7280' }}
                    />
                    <span className="text-xs text-gray-300 capitalize flex-1">{c.emoji} {c.category}</span>
                    <span className="text-xs text-gray-500 font-mono">{c.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 text-center">Time distribution across categories</p>

            {/* Category Deep Dive */}
            <div className="space-y-2">
              {data.categoryStats.map((c, i) => (
                <div
                  key={c.category}
                  className="bg-gray-800/50 rounded-xl p-3 flex items-center gap-3"
                >
                  {/* Rank */}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: `${categoryColors[c.category]}20`, color: categoryColors[c.category] }}
                  >
                    {c.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white capitalize">{c.category}</p>
                      <p className="text-xs text-gray-400 font-mono">{formatDuration(c.dwellMs)}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-500">{c.views} views</span>
                      {c.donateClicks > 0 && (
                        <span className="text-[10px] text-[#00b964]">{c.donateClicks} donate {c.donateClicks === 1 ? 'tap' : 'taps'}</span>
                      )}
                      {c.shares > 0 && (
                        <span className="text-[10px] text-purple-400">{c.shares} {c.shares === 1 ? 'share' : 'shares'}</span>
                      )}
                    </div>
                    {/* Mini bar */}
                    <div className="h-1 bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${c.percentage}%`,
                          backgroundColor: categoryColors[c.category] || '#6b7280',
                          transitionDelay: `${i * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TOP VIEWED TAB ─── */}
        {activeTab === 'top' && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-gray-500 mb-1">Ranked by total dwell time — the causes that captured your attention most.</p>

            {data.topFundraisers.map((f, i) => (
              <Link
                key={f.id}
                href={`/fundraiser/${f.id}`}
                className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl p-3 transition-all group"
              >
                {/* Rank badge */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i === 0 ? 'bg-amber-500/20 text-amber-400' :
                  i === 1 ? 'bg-gray-400/20 text-gray-300' :
                  i === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-gray-700/50 text-gray-500'
                }`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>

                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={f.heroImage} alt={f.title} fill className="object-cover" sizes="48px" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-[#00b964] transition-colors">
                    {f.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500 capitalize">
                      {categoryEmoji[f.category]} {f.category}
                    </span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-[#00b964]">{formatCurrency(f.raisedAmount)}</span>
                  </div>
                </div>

                {/* Dwell time */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">{(f.dwellMs / 1000).toFixed(1)}s</p>
                  <p className="text-[10px] text-gray-500">{f.views} view{f.views !== 1 ? 's' : ''}</p>
                </div>
              </Link>
            ))}

            {data.topFundraisers.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm text-gray-500">Scroll through the feed to see which fundraisers grab your attention.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── ALGORITHM TAB ─── */}
        {activeTab === 'algorithm' && (
          <div className="p-5 space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <span>🧠</span> How Your Feed Adapts
              </h3>
              <p className="text-xs text-gray-400">
                The algorithm learns from every scroll, like, and pause. More attention on a category = more of it in your feed.
              </p>
            </div>

            {/* Action signal breakdown */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>📡</span> Signal Strength by Action
              </h3>
              <div className="space-y-2">
                {[
                  { icon: '👁️', label: 'Views', count: data.totalViews, weight: 1000, color: '#6b7280' },
                  { icon: '❤️', label: 'Likes', count: data.totalLikes, weight: 2000, color: '#ef4444' },
                  { icon: '🔖', label: 'Saves', count: data.totalSaves, weight: 2500, color: '#f59e0b' },
                  { icon: '🔗', label: 'Shares', count: data.totalShares, weight: 3000, color: '#8b5cf6' },
                  { icon: '👤', label: 'Follows', count: data.totalFollows, weight: 4000, color: '#3b82f6' },
                  { icon: '💰', label: 'Donate Taps', count: data.totalDonateClicks, weight: 5000, color: '#00b964' },
                ].map(s => {
                  const influence = s.count * s.weight;
                  const maxInfluence = Math.max(1,
                    data.totalViews * 1000,
                    data.totalLikes * 2000,
                    data.totalSaves * 2500,
                    data.totalShares * 3000,
                    data.totalFollows * 4000,
                    data.totalDonateClicks * 5000
                  );
                  const pct = (influence / maxInfluence) * 100;
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="text-sm w-5 text-center">{s.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-gray-400">{s.label} <span className="text-gray-600">×{s.weight/1000}k</span></span>
                          <span className="text-xs text-white font-mono">{s.count} → {(influence/1000).toFixed(0)}k</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category influence — base vs boosted */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <span>🔥</span> Category Feed Influence
              </h3>
              <p className="text-xs text-gray-500 mb-3">Compounding: multiple action types on the same category amplify its weight.</p>

              <div className="space-y-3">
                {data.categoryInfluence.slice(0, 6).map((c, i) => {
                  const boostPct = c.baseWeight > 0 ? ((c.boostedWeight / c.baseWeight - 1) * 100) : 0;
                  return (
                    <div key={c.category} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{c.emoji}</span>
                          <span className="text-sm font-semibold text-white capitalize">{c.category}</span>
                          {c.actions > 1 && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-bold">
                              {c.actions} signals → {c.actions > 1 ? `${boostPct.toFixed(0)}% boost` : 'base'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{c.boostedWeight.toFixed(1)}%</span>
                      </div>

                      {/* Base vs Boosted bar */}
                      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full rounded-full bg-gray-500 transition-all duration-500"
                          style={{ width: `${Math.min(c.baseWeight, 100)}%` }}
                        />
                        <div
                          className="absolute h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(c.boostedWeight, 100)}%`,
                            backgroundColor: categoryColors[c.category] || '#6b7280',
                            transitionDelay: `${i * 80}ms`,
                          }}
                        />
                      </div>

                      {/* Adjacent spillover */}
                      {c.adjacentBoost.length > 0 && c.boostedWeight > 5 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-[9px] text-gray-500">Spills into:</span>
                          {c.adjacentBoost.map(adj => (
                            <span key={adj} className="text-[9px] text-gray-400 bg-gray-700/50 px-1.5 py-0.5 rounded capitalize">
                              {categoryEmoji[adj]} {adj}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How it works explainer */}
            <div className="bg-gray-800/30 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">How the algorithm works</h4>
              <div className="space-y-1.5 text-[11px] text-gray-500">
                <p>📊 <span className="text-gray-400">Dwell longer</span> on a fundraiser → that category gets more weight</p>
                <p>❤️ <span className="text-gray-400">Like + Save + Donate</span> same category → weight compounds by 1.3× per signal type</p>
                <p>🔗 <span className="text-gray-400">Categories spill</span> into adjacent ones (medical → emergency, animals → environment)</p>
                <p>⚡ <span className="text-gray-400">Fast swiping</span> triggers diversity mode — the algorithm shows trending content to re-hook you</p>
                <p>🕳️ <span className="text-gray-400">Deep engagement</span> reduces diversity — the feed narrows into a rabbit hole</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper Components ───────────────────────────────────────

function StatCard({ icon, label, value, sublabel }: {
  icon: string; label: string; value: string; sublabel: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{sublabel}</p>
    </div>
  );
}

function ActionStat({ icon, count, label }: { icon: string; count: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <p className="text-sm font-bold text-white">{count}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

// ─── Utilities ───────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours}h ${remainMinutes}m`;
}
