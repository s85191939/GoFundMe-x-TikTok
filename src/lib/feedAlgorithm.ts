/**
 * Meta-Style Persuasion Engine
 *
 * A session-aware feed algorithm that progressively narrows content toward
 * what captivates each user. Tracks momentum (how "hot" the user is),
 * exploit ratio (explore vs. rabbit hole), and category adjacency (spillover
 * from engaged categories to related ones).
 *
 * Key concepts:
 * - Momentum: EMA of scroll speed + action density. High = user is engaged.
 * - Exploit ratio: Sigmoid curve from 0 (explore) to 1 (deep rabbit hole).
 * - Category adjacency: Medical engagement spills into Emergency/Nonprofit.
 * - Compounding: Multiple action types on same category compound exponentially.
 * - Adaptive weights: For You signal weights shift based on session state.
 * - Adaptive diversity: Diversity penalty weakens as user reveals preferences.
 */

import type { FundraiserCategory } from '@/data/types';
import type { ScoredItem } from '@/lib/recommendation';
import {
  getRecommendedFeed,
  getCategoryEngagementFromHistory,
} from '@/lib/recommendation';
import { getPreferences } from '@/lib/preferences';
import { getFollowing } from '@/lib/social';

// ─── Types ───────────────────────────────────────────────────

export interface SessionState {
  itemsViewed: number;
  sessionStart: number;
  scrollIntervals: number[];
  lastScrollTime: number;
  sessionCategoryHits: Record<string, number>;
  sessionCategoryActions: Record<string, Set<string>>;
  sessionActionCounts: Record<string, number>;
  momentum: number;
  exploitRatio: number;
  shownIds: Set<string>;
  lastCategory: FundraiserCategory | null;
  compoundedCategoryScores: Record<string, number>;
}

export interface AdaptiveWeights {
  interest: number;
  social: number;
  trending: number;
  diversity: number;
  freshness: number;
}

export interface NextBatchConfig {
  batchSize?: number;
  session: SessionState;
  tab: 'for_you' | 'following' | 'trending';
}

// ─── Category Adjacency Map ─────────────────────────────────

export const CATEGORY_ADJACENCY: Record<string, {
  primary: FundraiserCategory[];
  secondary: FundraiserCategory[];
}> = {
  medical:     { primary: ['emergency', 'nonprofit'],   secondary: ['memorial', 'community'] },
  emergency:   { primary: ['medical', 'community'],     secondary: ['nonprofit', 'environment'] },
  education:   { primary: ['community', 'nonprofit'],   secondary: ['sports', 'other'] },
  nonprofit:   { primary: ['medical', 'education'],     secondary: ['community', 'environment'] },
  community:   { primary: ['education', 'nonprofit'],   secondary: ['emergency', 'environment'] },
  animals:     { primary: ['environment', 'community'], secondary: ['nonprofit', 'other'] },
  environment: { primary: ['animals', 'community'],     secondary: ['emergency', 'nonprofit'] },
  memorial:    { primary: ['medical', 'community'],     secondary: ['emergency', 'nonprofit'] },
  sports:      { primary: ['community', 'education'],   secondary: ['other', 'nonprofit'] },
  other:       { primary: ['community', 'education'],   secondary: ['animals', 'sports'] },
};

// ─── Session Singleton ───────────────────────────────────────

let _session: SessionState | null = null;

export function getSession(): SessionState {
  if (!_session) {
    _session = {
      itemsViewed: 0,
      sessionStart: Date.now(),
      scrollIntervals: [],
      lastScrollTime: Date.now(),
      sessionCategoryHits: {},
      sessionCategoryActions: {},
      sessionActionCounts: {},
      momentum: 0.5,
      exploitRatio: 0,
      shownIds: new Set(),
      lastCategory: null,
      compoundedCategoryScores: {},
    };
  }
  return _session;
}

export function resetSession(): void {
  _session = null;
}

// ─── Utility ─────────────────────────────────────────────────

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ─── Momentum ────────────────────────────────────────────────

/**
 * Update session momentum — how "hot" is the user right now?
 *
 * EMA: momentum = momentum * 0.7 + raw * 0.3
 * raw = 40% scroll speed + 40% action density + 20% dwell bonus
 */
export function updateMomentum(session: SessionState): number {
  const now = Date.now();
  const timeSinceLast = now - session.lastScrollTime;

  // Rolling window of last 10 scroll intervals
  session.scrollIntervals.push(timeSinceLast);
  if (session.scrollIntervals.length > 10) {
    session.scrollIntervals.shift();
  }
  session.lastScrollTime = now;

  // 1. Scroll speed score
  const medianInterval = median(session.scrollIntervals);
  let scrollScore: number;
  if (medianInterval < 800) {
    scrollScore = 0.2;       // Speed-swiping, barely looking
  } else if (medianInterval < 1500) {
    scrollScore = 0.6;       // Browsing with intent
  } else if (medianInterval < 3000) {
    scrollScore = 0.85;      // Reading, considering
  } else if (medianInterval < 8000) {
    scrollScore = 1.0;       // Deep engagement
  } else {
    scrollScore = 0.3;       // Probably idle
  }

  // 2. Action density = (likes + saves + shares + donates) / itemsViewed
  const totalActions =
    (session.sessionActionCounts['like'] || 0) +
    (session.sessionActionCounts['save'] || 0) +
    (session.sessionActionCounts['share'] || 0) +
    (session.sessionActionCounts['donate_click'] || 0);
  const actionDensity = session.itemsViewed > 0
    ? Math.min(totalActions / session.itemsViewed, 1)
    : 0;

  // 3. Dwell bonus — most recent scroll gap
  const dwellBonus = timeSinceLast > 3000 ? 0.8 : timeSinceLast > 1500 ? 0.5 : 0.2;

  // EMA blend
  const rawMomentum = scrollScore * 0.4 + actionDensity * 0.4 + dwellBonus * 0.2;
  session.momentum = session.momentum * 0.7 + rawMomentum * 0.3;
  session.momentum = Math.max(0, Math.min(1, session.momentum));

  return session.momentum;
}

// ─── Progressive Narrowing (Explore → Exploit) ──────────────

/**
 * Sigmoid-based explore-to-exploit transition.
 *
 * ~5 interactions → 0.08 (exploring)
 * ~15 interactions → 0.50 (balanced)
 * ~25 interactions → 0.92 (deep rabbit hole)
 *
 * Damped by 40% when momentum drops below 0.3 (re-diversify).
 */
export function updateExploitRatio(session: SessionState): number {
  const actionWeights: Record<string, number> = {
    'view': 0.2,
    'dwell': 0.5,
    'like': 1.5,
    'save': 2.0,
    'share': 3.0,
    'donate_click': 4.0,
    'follow_organizer': 3.5,
  };

  let signalStrength = 0;
  const entries = Object.entries(session.sessionActionCounts);
  for (let i = 0; i < entries.length; i++) {
    const [action, count] = entries[i];
    signalStrength += (actionWeights[action] || 0.5) * count;
  }

  // Sigmoid curve
  const midpoint = 15;
  const steepness = 0.25;
  let ratio = 1 / (1 + Math.exp(-steepness * (signalStrength - midpoint)));

  // Momentum damping: if user is cooling, pull back toward explore
  if (session.momentum < 0.3) {
    ratio *= 0.6;
  }

  session.exploitRatio = Math.max(0, Math.min(1, ratio));
  return session.exploitRatio;
}

// ─── Engagement Compounding ──────────────────────────────────

/**
 * Multiple action types on same category compound exponentially:
 * base * 1.3^(distinctActionTypes - 1)
 *
 * 1 type → 1x, 2 → 1.3x, 3 → 1.69x, 4 → 2.2x
 */
export function computeCompoundedCategories(
  session: SessionState,
  historicalEngagement: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = {};

  const categories = Object.keys(historicalEngagement);
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const baseWeight = historicalEngagement[category];
    const distinctTypes = session.sessionCategoryActions[category]?.size || 1;
    const compoundMultiplier = Math.pow(1.3, Math.max(0, distinctTypes - 1));
    result[category] = baseWeight * compoundMultiplier;
  }

  session.compoundedCategoryScores = result;
  return result;
}

// ─── Category Adjacency Boost ────────────────────────────────

/**
 * Spillover boost from adjacent categories.
 * Primary adjacency = 70%, Secondary = 30%.
 * Normalized to 0-30pt boost on interest signal.
 */
export function computeAdjacencyBoost(
  targetCategory: FundraiserCategory,
  compoundedScores: Record<string, number>
): number {
  let boost = 0;

  const sourceCategories = Object.keys(compoundedScores);
  for (let i = 0; i < sourceCategories.length; i++) {
    const sourceCategory = sourceCategories[i];
    const sourceScore = compoundedScores[sourceCategory];
    if (sourceCategory === targetCategory) continue;

    const adjacency = CATEGORY_ADJACENCY[sourceCategory];
    if (!adjacency) continue;

    if (adjacency.primary.includes(targetCategory)) {
      boost += sourceScore * 0.70;
    } else if (adjacency.secondary.includes(targetCategory)) {
      boost += sourceScore * 0.30;
    }
  }

  return boost;
}

// ─── Adaptive Weights ────────────────────────────────────────

/**
 * Dynamically rebalance For You weights based on session state.
 *
 * - As exploitRatio ↑: interest ↑, diversity ↓
 * - Low momentum: trending ↑, diversity ↑, interest ↓ (re-hook)
 * - High momentum: interest ↑, social ↑ (double down)
 */
export function computeAdaptiveWeights(session: SessionState): AdaptiveWeights {
  const w = {
    interest: 0.35,
    social: 0.20,
    trending: 0.20,
    diversity: 0.10,
    freshness: 0.15,
  };

  const { exploitRatio, momentum } = session;

  // Exploit adjustments
  w.interest  += exploitRatio * 0.20;
  w.diversity -= exploitRatio * 0.08;
  w.freshness -= exploitRatio * 0.05;

  // Momentum adjustments
  if (momentum < 0.3) {
    w.trending  += 0.10;
    w.diversity += 0.08;
    w.interest  -= 0.12;
  } else if (momentum > 0.7) {
    w.interest += 0.05;
    w.social   += 0.05;
    w.trending -= 0.05;
    w.diversity -= 0.05;
  }

  // Normalize to sum = 1.0 with minimums
  const total = w.interest + w.social + w.trending + w.diversity + w.freshness;
  w.interest  = Math.max(0.05, w.interest / total);
  w.social    = Math.max(0.05, w.social / total);
  w.trending  = Math.max(0.05, w.trending / total);
  w.diversity = Math.max(0.02, w.diversity / total);
  w.freshness = Math.max(0.02, w.freshness / total);

  // Re-normalize after clamping
  const total2 = w.interest + w.social + w.trending + w.diversity + w.freshness;
  w.interest  /= total2;
  w.social    /= total2;
  w.trending  /= total2;
  w.diversity /= total2;
  w.freshness /= total2;

  return w;
}

// ─── Adaptive Diversity ──────────────────────────────────────

/**
 * Exploit-aware diversity reranking.
 *
 * Penalty per same-category repeat: 8 * (1.5 - exploitRatio)
 *   exploitRatio=0 → 12pt penalty (aggressive variety)
 *   exploitRatio=0.5 → 8pt (same as current)
 *   exploitRatio=1.0 → 4pt (let rabbit holes form)
 */
function applyAdaptiveDiversity(items: ScoredItem[], session: SessionState): ScoredItem[] {
  if (items.length <= 1) return items;

  const penaltyMultiplier = 1.5 - session.exploitRatio;
  const basePenalty = 8;
  const adjustedPenalty = basePenalty * penaltyMultiplier;

  const result: ScoredItem[] = [];
  const categoryCount: Record<string, number> = {};

  const sorted = [...items].sort((a, b) => b.score - a.score);

  for (const item of sorted) {
    const cat = item.data.category;
    const count = categoryCount[cat] || 0;

    const penalty = count * adjustedPenalty;
    const bonus = count === 0 ? 10 : 0;

    const updated = {
      ...item,
      signals: { ...item.signals, diversity: Math.max(0, 100 - penalty * 10) },
      score: Math.max(0, item.score - penalty + bonus),
    };

    categoryCount[cat] = count + 1;
    result.push(updated);
  }

  return result.sort((a, b) => b.score - a.score);
}

// ─── Record Signal ───────────────────────────────────────────

/**
 * Record a user action and update all session-derived metrics.
 * Single entry point for all user actions from TikTokFeed.
 */
export function recordSignal(
  session: SessionState,
  action: string,
  category: FundraiserCategory,
): void {
  // Update category hits
  session.sessionCategoryHits[category] = (session.sessionCategoryHits[category] || 0) + 1;

  // Update action counts
  session.sessionActionCounts[action] = (session.sessionActionCounts[action] || 0) + 1;

  // Update distinct action types per category
  if (!session.sessionCategoryActions[category]) {
    session.sessionCategoryActions[category] = new Set();
  }
  session.sessionCategoryActions[category].add(action);

  // Update last category
  session.lastCategory = category;

  // Recompute derived metrics
  if (action === 'view') {
    session.itemsViewed++;
    updateMomentum(session);
  }

  updateExploitRatio(session);
}

// ─── Main Entry: getNextBatch ────────────────────────────────

/**
 * Session-aware batch loader. Replaces static feed cycling.
 *
 * 1. Compute compounded category scores from engagement history + session
 * 2. Compute adaptive weights based on momentum/exploit ratio
 * 3. Get base scored feed from existing recommendation engine
 * 4. Apply adjacency boosts to interest scores
 * 5. Re-score with adaptive weights
 * 6. Apply adaptive diversity
 * 7. Filter already-shown items
 * 8. Return top N
 */
export function getNextBatch(config: NextBatchConfig): ScoredItem[] {
  const session = config.session;
  const batchSize = config.batchSize || 12;

  // 1. Compounded category engagement
  const historicalEngagement = getCategoryEngagementFromHistory();
  const compounded = computeCompoundedCategories(session, historicalEngagement);

  // 2. Adaptive weights (only for for_you)
  const adaptiveWeights = config.tab === 'for_you'
    ? computeAdaptiveWeights(session)
    : null;

  // 3. Get base feed from existing engine
  const prefs = getPreferences();
  const following = getFollowing();
  const baseFeed = getRecommendedFeed({
    tab: config.tab,
    interests: prefs.interests,
    followingUserIds: following,
    categoryEngagement: compounded,
    seed: Date.now() + session.itemsViewed,
  });

  // 4 & 5. Apply adjacency boosts + re-score with adaptive weights
  let rescored: ScoredItem[];
  if (config.tab === 'for_you' && adaptiveWeights) {
    // Find max compounded score for normalization
    const compoundedValues = Object.values(compounded);
    const maxCompounded = compoundedValues.length > 0 ? Math.max(...compoundedValues) : 1;

    rescored = baseFeed.map(item => {
      const adjacencyBoost = computeAdjacencyBoost(
        item.data.category as FundraiserCategory,
        compounded
      );

      // Normalize adjacency boost to 0-30 range
      const maxPossibleBoost = maxCompounded * 0.7;
      const normalizedBoost = maxPossibleBoost > 0
        ? (adjacencyBoost / maxPossibleBoost) * 30
        : 0;

      const boostedInterest = Math.min(100, item.signals.interest + normalizedBoost);

      // Re-compute score with adaptive weights
      const newScore =
        boostedInterest * adaptiveWeights.interest +
        item.signals.social * adaptiveWeights.social +
        item.signals.trending * adaptiveWeights.trending +
        item.signals.diversity * adaptiveWeights.diversity +
        item.signals.freshness * adaptiveWeights.freshness;

      return {
        ...item,
        signals: { ...item.signals, interest: boostedInterest },
        score: Math.max(0, Math.min(100, newScore)),
      };
    });
  } else {
    rescored = baseFeed;
  }

  // 6. Adaptive diversity
  rescored = applyAdaptiveDiversity(rescored, session);

  // 7. Filter already-shown items
  const fresh = rescored.filter(item => !session.shownIds.has(item.data.id));

  // If we've exhausted the pool, allow reshowing with a penalty
  let result: ScoredItem[];
  if (fresh.length >= batchSize) {
    result = fresh.slice(0, batchSize);
  } else {
    const stale = rescored
      .filter(item => session.shownIds.has(item.data.id))
      .map(item => ({ ...item, score: item.score * 0.7 }));
    result = [...fresh, ...stale].slice(0, batchSize);
  }

  // Mark as shown
  for (const item of result) {
    session.shownIds.add(item.data.id);
  }

  return result;
}
