/**
 * TikTok-inspired Recommendation Engine for GoFundMe
 *
 * Uses a multi-signal scoring system inspired by TikTok's recommendation paper:
 * 1. User Interest Signal — categories the user selected + engagement history
 * 2. Social Signal — what people you follow are donating to / creating
 * 3. Trending Signal — donation velocity, recency, goal proximity
 * 4. Diversity Signal — ensures feed isn't monotonous (category rotation)
 * 5. Freshness Signal — newer campaigns get a boost
 *
 * Each fundraiser gets a composite score [0–100] and the feed is ordered by score
 * with controlled randomization to keep re-visits interesting.
 */

import type { Fundraiser, FundraiserCategory } from '@/data/types';
import { getAllFundraisers } from '@/data/fundraisers';
import { getAllCommunities } from '@/data/communities';
import { donations } from '@/data/donations';
import { activities } from '@/data/activity';
import { getPreferences } from '@/lib/preferences';
import { getFollowing } from '@/lib/social';

// ─── Types ───────────────────────────────────────────────────

export interface ScoredItem {
  id: string;
  type: 'fundraiser' | 'community' | 'user_suggestion';
  score: number;
  signals: {
    interest: number;
    social: number;
    trending: number;
    diversity: number;
    freshness: number;
  };
  data: Fundraiser;
}

export interface FeedConfig {
  /** Which tab is active */
  tab: 'for_you' | 'following' | 'trending';
  /** User's selected interest categories */
  interests: FundraiserCategory[];
  /** User IDs the current user follows */
  followingUserIds: string[];
  /** Category engagement time map (ms spent per category) */
  categoryEngagement?: Record<string, number>;
  /** Previously viewed item IDs (for freshness) */
  viewedIds?: string[];
  /** Seed for controlled randomization */
  seed?: number;
}

// ─── Scoring Weights per Tab ─────────────────────────────────

const WEIGHTS = {
  for_you: { interest: 0.35, social: 0.20, trending: 0.20, diversity: 0.10, freshness: 0.15 },
  following: { interest: 0.10, social: 0.60, trending: 0.10, diversity: 0.05, freshness: 0.15 },
  trending: { interest: 0.05, social: 0.05, trending: 0.60, diversity: 0.15, freshness: 0.15 },
};

// ─── Deterministic PRNG (same as metrics.ts) ─────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Score Calculators ───────────────────────────────────────

function interestScore(
  fundraiser: Fundraiser,
  interests: FundraiserCategory[],
  categoryEngagement?: Record<string, number>
): number {
  let score = 0;

  // Direct category match (0–40 pts)
  if (interests.includes(fundraiser.category)) {
    score += 40;
  }

  // Tag overlap with interest categories (0–20 pts)
  const tagOverlap = fundraiser.tags.filter(t =>
    interests.some(i => t.toLowerCase().includes(i.toLowerCase()))
  ).length;
  score += Math.min(tagOverlap * 5, 20);

  // Engagement time bonus (0–40 pts)
  if (categoryEngagement) {
    const totalTime = Object.values(categoryEngagement).reduce((a, b) => a + b, 0);
    if (totalTime > 0) {
      const catTime = categoryEngagement[fundraiser.category] || 0;
      const ratio = catTime / totalTime;
      score += Math.round(ratio * 40);
    }
  }

  return Math.min(score, 100);
}

function socialScore(
  fundraiser: Fundraiser,
  followingUserIds: string[]
): number {
  if (followingUserIds.length === 0) return 0;
  let score = 0;

  // Organized by someone you follow (50 pts)
  if (followingUserIds.includes(fundraiser.organizerId)) {
    score += 50;
  }

  // Donated to by someone you follow (30 pts)
  const fundraiserDonations = donations.filter(d => d.fundraiserId === fundraiser.id);
  const followedDonors = fundraiserDonations.filter(d =>
    d.donorId && followingUserIds.includes(d.donorId)
  );
  if (followedDonors.length > 0) {
    score += Math.min(followedDonors.length * 15, 30);
  }

  // Activity from followed users (20 pts)
  const followedActivity = activities.filter(a =>
    followingUserIds.includes(a.userId) &&
    a.targetId === fundraiser.id
  );
  if (followedActivity.length > 0) {
    score += Math.min(followedActivity.length * 10, 20);
  }

  return Math.min(score, 100);
}

function trendingScore(fundraiser: Fundraiser): number {
  let score = 0;

  // Donation velocity: donations per day (0–30 pts)
  const ageInDays = Math.max(1,
    (Date.now() - new Date(fundraiser.createdDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const velocity = fundraiser.donationCount / ageInDays;
  score += Math.min(Math.round(velocity * 30), 30);

  // Goal proximity bonus (0–25 pts)
  const completion = fundraiser.raisedAmount / fundraiser.goalAmount;
  if (completion >= 0.5 && completion < 0.75) score += 15;
  else if (completion >= 0.75 && completion < 1.0) score += 25; // Almost there!
  else if (completion >= 1.0) score += 10; // Already funded, less urgency

  // Amount raised relative to goal (0–20 pts)
  const amountScore = Math.min(completion * 20, 20);
  score += Math.round(amountScore);

  // Recency of last donation (0–25 pts)
  const lastDonationAge = (Date.now() - new Date(fundraiser.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24);
  if (lastDonationAge < 1) score += 25;
  else if (lastDonationAge < 3) score += 20;
  else if (lastDonationAge < 7) score += 15;
  else if (lastDonationAge < 14) score += 10;
  else score += 5;

  return Math.min(score, 100);
}

function freshnessScore(fundraiser: Fundraiser, viewedIds?: string[]): number {
  let score = 0;

  // Campaign age (0–50 pts, newer = better)
  const ageInDays = (Date.now() - new Date(fundraiser.createdDate).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays < 7) score += 50;
  else if (ageInDays < 14) score += 40;
  else if (ageInDays < 30) score += 30;
  else if (ageInDays < 60) score += 20;
  else if (ageInDays < 90) score += 10;

  // Not yet viewed bonus (50 pts)
  if (!viewedIds || !viewedIds.includes(fundraiser.id)) {
    score += 50;
  }

  return Math.min(score, 100);
}

// ─── Diversity: penalize back-to-back same category ──────────

export function applyDiversity(items: ScoredItem[]): ScoredItem[] {
  if (items.length <= 1) return items;

  const result: ScoredItem[] = [];
  const categoryCount: Record<string, number> = {};

  // Sort by raw score first
  const sorted = [...items].sort((a, b) => b.score - a.score);

  for (const item of sorted) {
    const cat = item.data.category;
    const count = categoryCount[cat] || 0;

    // Penalize repeated categories (diminishing returns)
    const diversityPenalty = count * 8;
    const diversityBonus = count === 0 ? 10 : 0;

    item.signals.diversity = Math.max(0, 100 - diversityPenalty * 10);
    item.score = Math.max(0, item.score - diversityPenalty + diversityBonus);

    categoryCount[cat] = count + 1;
    result.push(item);
  }

  return result.sort((a, b) => b.score - a.score);
}

// ─── Main Recommendation Function ────────────────────────────

export function getRecommendedFeed(config: FeedConfig & { customWeights?: Record<string, number> }): ScoredItem[] {
  const allFundraisers = getAllFundraisers().filter(f => f.isActive);
  const weights = config.customWeights || WEIGHTS[config.tab];
  const rand = seededRandom(config.seed || Date.now());

  let scored: ScoredItem[] = allFundraisers.map(f => {
    const signals = {
      interest: interestScore(f, config.interests, config.categoryEngagement),
      social: socialScore(f, config.followingUserIds),
      trending: trendingScore(f),
      diversity: 50, // Will be recalculated
      freshness: freshnessScore(f, config.viewedIds),
    };

    const rawScore =
      signals.interest * weights.interest +
      signals.social * weights.social +
      signals.trending * weights.trending +
      signals.diversity * weights.diversity +
      signals.freshness * weights.freshness;

    // Add controlled randomization (±10%) to keep feeds interesting
    const jitter = (rand() - 0.5) * 20;

    return {
      id: f.id,
      type: 'fundraiser' as const,
      score: Math.max(0, Math.min(100, rawScore + jitter)),
      signals,
      data: f,
    };
  });

  // Apply diversity reranking
  scored = applyDiversity(scored);

  // For "following" tab, filter to only items with social signal > 0
  if (config.tab === 'following') {
    const socialItems = scored.filter(s => s.signals.social > 0);
    // If nothing from following, show a "follow people to see their campaigns" empty state
    // but still return some items with a flag
    if (socialItems.length > 0) {
      return socialItems;
    }
    // Return all with low scores so the UI can show empty state
    return scored.map(s => ({ ...s, score: s.score * 0.5 }));
  }

  return scored;
}

// ─── Quick access helpers ────────────────────────────────────

export function getForYouFeed(categoryEngagement?: Record<string, number>): ScoredItem[] {
  const prefs = getPreferences();
  const following = getFollowing();

  return getRecommendedFeed({
    tab: 'for_you',
    interests: prefs.interests,
    followingUserIds: following,
    categoryEngagement,
  });
}

export function getTrendingFeed(): ScoredItem[] {
  return getRecommendedFeed({
    tab: 'trending',
    interests: [],
    followingUserIds: [],
  });
}

export function getFollowingFeed(): ScoredItem[] {
  const following = getFollowing();
  return getRecommendedFeed({
    tab: 'following',
    interests: [],
    followingUserIds: following,
  });
}

// ─── Engagement tracking for real-time personalization ───────

export interface EngagementEvent {
  itemId: string;
  category: FundraiserCategory;
  action: 'view' | 'dwell' | 'donate_click' | 'share' | 'follow_organizer' | 'like' | 'save';
  durationMs?: number;
  timestamp: number;
}

const STORAGE_KEY = 'gfm_engagement_history';

function loadPersistedHistory(): EngagementEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistHistory(history: EngagementEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch { /* quota exceeded — ignore */ }
}

const engagementHistory: EngagementEvent[] = loadPersistedHistory();

export function trackEngagement(event: EngagementEvent): void {
  engagementHistory.push(event);

  // Keep last 200 events
  if (engagementHistory.length > 200) {
    engagementHistory.splice(0, engagementHistory.length - 200);
  }
  persistHistory(engagementHistory);
}

export function getEngagementHistory(): EngagementEvent[] {
  // If module-level array is empty (fresh page load), reload from storage
  if (engagementHistory.length === 0) {
    const persisted = loadPersistedHistory();
    engagementHistory.push(...persisted);
  }
  return [...engagementHistory];
}

export function getCategoryEngagementFromHistory(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const e of engagementHistory) {
    const weight =
      e.action === 'donate_click' ? 5000 :
      e.action === 'follow_organizer' ? 4000 :
      e.action === 'share' ? 3000 :
      e.action === 'save' ? 2500 :
      e.action === 'like' ? 2000 :
      e.action === 'dwell' ? (e.durationMs || 1000) :
      1000;
    map[e.category] = (map[e.category] || 0) + weight;
  }
  return map;
}
