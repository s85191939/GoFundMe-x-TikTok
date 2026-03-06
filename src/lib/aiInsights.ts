import type { Fundraiser, Donation, FundraiserCategory } from '@/data/types';
import { getAllFundraisers } from '@/data/fundraisers';
import { donations } from '@/data/donations';

// ── Return types ──────────────────────────────────────────────────────────────

export interface CampaignHealth {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: Array<{
    name: string;
    score: number;
    maxScore: number;
    suggestion: string;
  }>;
  topRecommendation: string;
}

export interface TrendingData {
  score: number; // 0-100
  label: 'Hot' | 'Trending' | 'Rising' | 'Steady' | 'Quiet';
  reason: string;
}

export interface DonorInsights {
  peakDonationHour: string; // "2 PM - 4 PM"
  avgDonation: number;
  medianDonation: number;
  anonymousRate: number; // 0-1
  topDonorName: string;
  topDonorAmount: number;
  donationDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>; // "$1-25", "$26-50", etc.
}

export interface PlatformInsights {
  mostPopularCategory: string;
  avgCampaignDuration: number; // days
  bestPerformingDay: string; // "Tuesday"
  avgDonationsPerCampaign: number;
  successPrediction: number; // probability 0-1 based on current metrics
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.abs(b - a) / (1000 * 60 * 60 * 24);
}

function daysSince(date: string): number {
  const now = new Date().getTime();
  const then = new Date(date).getTime();
  return Math.max(0, (now - then) / (1000 * 60 * 60 * 24));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function paragraphCount(text: string): number {
  return text
    .trim()
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;
}

const CATEGORY_SHAREABILITY: Record<FundraiserCategory, number> = {
  medical: 10,
  emergency: 9,
  education: 8,
  animals: 8,
  community: 7,
  nonprofit: 6,
  environment: 7,
  memorial: 9,
  sports: 5,
  other: 4,
};

const CATEGORY_LABELS: Record<FundraiserCategory, string> = {
  medical: 'Medical',
  emergency: 'Emergency',
  education: 'Education',
  animals: 'Animals',
  community: 'Community',
  nonprofit: 'Nonprofit',
  environment: 'Environment',
  memorial: 'Memorial',
  sports: 'Sports',
  other: 'Other',
};

// ── AI Insights Engine ────────────────────────────────────────────────────────

class AIInsightsEngine {
  // ── 1. Campaign Health Score ────────────────────────────────────────────────

  getCampaignHealthScore(fundraiser: Fundraiser): CampaignHealth {
    const factors: CampaignHealth['factors'] = [];

    // Factor 1 — Completion rate (30 pts max)
    const completionRate = fundraiser.raisedAmount / fundraiser.goalAmount;
    const completionScore = clamp(Math.round(completionRate * 30), 0, 30);
    let completionSuggestion = 'Great progress toward the goal!';
    if (completionRate < 0.25) {
      completionSuggestion =
        'Consider sharing your campaign on social media to boost early momentum.';
    } else if (completionRate < 0.5) {
      completionSuggestion =
        'You are gaining traction. Send personal messages to friends and family for a push.';
    } else if (completionRate < 0.75) {
      completionSuggestion =
        'You are past the halfway mark! Post an update to re-engage earlier donors.';
    }
    factors.push({
      name: 'Completion Rate',
      score: completionScore,
      maxScore: 30,
      suggestion: completionSuggestion,
    });

    // Factor 2 — Momentum / donations per day (25 pts max)
    const campaignAgeDays = Math.max(
      1,
      daysBetween(fundraiser.createdDate, fundraiser.lastDonationDate),
    );
    const donationsPerDay = fundraiser.donationCount / campaignAgeDays;
    // Benchmark: 1 donation/day = perfect score
    const momentumScore = clamp(Math.round(donationsPerDay * 25), 0, 25);
    let momentumSuggestion = 'Strong donation momentum. Keep it up!';
    if (donationsPerDay < 0.05) {
      momentumSuggestion =
        'Donation frequency is low. Try hosting a virtual event or creating a social media challenge.';
    } else if (donationsPerDay < 0.15) {
      momentumSuggestion =
        'Consider posting weekly updates to maintain donor interest and attract new supporters.';
    }
    factors.push({
      name: 'Momentum',
      score: momentumScore,
      maxScore: 25,
      suggestion: momentumSuggestion,
    });

    // Factor 3 — Story quality (20 pts max)
    const words = wordCount(fundraiser.story);
    const paragraphs = paragraphCount(fundraiser.story);
    // Ideal: 200+ words (10 pts), 3+ paragraphs (10 pts)
    const wordScore = clamp(Math.round((words / 200) * 10), 0, 10);
    const paragraphScore = clamp(Math.round((paragraphs / 3) * 10), 0, 10);
    const storyScore = wordScore + paragraphScore;
    let storySuggestion = 'Your story is compelling and well-structured.';
    if (words < 100) {
      storySuggestion =
        'Your story is too short. Add personal details, specific costs, and emotional context to connect with donors.';
    } else if (paragraphs < 3) {
      storySuggestion =
        'Break your story into more paragraphs for readability. Include a clear call to action.';
    }
    factors.push({
      name: 'Story Quality',
      score: storyScore,
      maxScore: 20,
      suggestion: storySuggestion,
    });

    // Factor 4 — Recency (15 pts max)
    const daysSinceLastDonation = daysSince(fundraiser.lastDonationDate);
    // 0 days = 15, 30+ days = 0
    const recencyScore = clamp(
      Math.round(15 - (daysSinceLastDonation / 30) * 15),
      0,
      15,
    );
    let recencySuggestion = 'Recent activity is boosting your visibility.';
    if (daysSinceLastDonation > 14) {
      recencySuggestion =
        'It has been a while since the last donation. Post an update or reach out to potential donors directly.';
    } else if (daysSinceLastDonation > 7) {
      recencySuggestion =
        'Activity is slowing down. Share a milestone update to reignite interest.';
    }
    factors.push({
      name: 'Recency',
      score: recencyScore,
      maxScore: 15,
      suggestion: recencySuggestion,
    });

    // Factor 5 — Social sharing potential (10 pts max)
    const shareability = CATEGORY_SHAREABILITY[fundraiser.category] ?? 5;
    const socialScore = clamp(Math.round(shareability), 0, 10);
    const socialSuggestion =
      socialScore >= 8
        ? `${CATEGORY_LABELS[fundraiser.category]} campaigns tend to go viral. Leverage social media heavily.`
        : `Consider cross-posting to communities related to ${CATEGORY_LABELS[fundraiser.category].toLowerCase()} causes for broader reach.`;
    factors.push({
      name: 'Social Sharing Potential',
      score: socialScore,
      maxScore: 10,
      suggestion: socialSuggestion,
    });

    // Total
    const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
    const grade = this.scoreToGrade(totalScore);

    // Pick top recommendation from the lowest-scoring factor
    const lowestFactor = [...factors].sort(
      (a, b) => a.score / a.maxScore - b.score / b.maxScore,
    )[0];
    const topRecommendation =
      lowestFactor?.suggestion ?? 'Keep up the great work!';

    return { score: totalScore, grade, factors, topRecommendation };
  }

  // ── 2. Trending Score ──────────────────────────────────────────────────────

  getTrendingScore(fundraiser: Fundraiser): TrendingData {
    const campaignDonations = donations.filter(
      (d) => d.fundraiserId === fundraiser.id,
    );

    // Donation velocity: total raised / campaign age in hours
    const campaignAgeHours = Math.max(
      1,
      daysSince(fundraiser.createdDate) * 24,
    );
    const velocityPerHour = fundraiser.raisedAmount / campaignAgeHours;

    // Recent donation clustering: donations in last 7 days vs total
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentDonations = campaignDonations.filter(
      (d) => new Date(d.createdDate) >= sevenDaysAgo,
    );
    const clusteringRatio =
      campaignDonations.length > 0
        ? recentDonations.length / campaignDonations.length
        : 0;

    // Goal proximity boost: campaigns near 50%/75%/100% get a bonus
    const completionPct = fundraiser.raisedAmount / fundraiser.goalAmount;
    let proximityBoost = 0;
    if (completionPct >= 0.95 && completionPct < 1.05) {
      proximityBoost = 25; // near 100%
    } else if (completionPct >= 0.7 && completionPct < 0.8) {
      proximityBoost = 15; // near 75%
    } else if (completionPct >= 0.45 && completionPct < 0.55) {
      proximityBoost = 10; // near 50%
    }

    // Velocity score: $10/hour = 30 pts max
    const velocityScore = clamp(Math.round((velocityPerHour / 10) * 30), 0, 30);

    // Clustering score: max 35 pts
    const clusteringScore = clamp(Math.round(clusteringRatio * 35), 0, 35);

    // Recency boost: last donation within 24h = 10 pts
    const hoursSinceLastDonation = daysSince(fundraiser.lastDonationDate) * 24;
    const recencyBoost = clamp(
      Math.round(10 - (hoursSinceLastDonation / 24) * 10),
      0,
      10,
    );

    const rawScore =
      velocityScore + clusteringScore + proximityBoost + recencyBoost;
    const score = clamp(rawScore, 0, 100);

    let label: TrendingData['label'];
    let reason: string;

    if (score >= 80) {
      label = 'Hot';
      reason = 'Exceptional donation velocity and recent activity surge.';
    } else if (score >= 60) {
      label = 'Trending';
      reason =
        'Strong recent donation clustering and approaching a funding milestone.';
    } else if (score >= 40) {
      label = 'Rising';
      reason = 'Steady donation flow with increasing momentum.';
    } else if (score >= 20) {
      label = 'Steady';
      reason = 'Consistent but moderate donation activity.';
    } else {
      label = 'Quiet';
      reason =
        'Low recent activity. A campaign update or social share could spark renewed interest.';
    }

    return { score, label, reason };
  }

  // ── 3. Donor Insights ──────────────────────────────────────────────────────

  getDonorInsights(
    donationList: Array<{
      amount: number;
      createdDate: string;
      donorName: string;
      isAnonymous: boolean;
    }>,
  ): DonorInsights {
    if (donationList.length === 0) {
      return {
        peakDonationHour: 'N/A',
        avgDonation: 0,
        medianDonation: 0,
        anonymousRate: 0,
        topDonorName: 'N/A',
        topDonorAmount: 0,
        donationDistribution: [],
      };
    }

    // Average donation
    const totalAmount = donationList.reduce((s, d) => s + d.amount, 0);
    const avgDonation = Math.round((totalAmount / donationList.length) * 100) / 100;

    // Median donation
    const sortedAmounts = [...donationList]
      .map((d) => d.amount)
      .sort((a, b) => a - b);
    const mid = Math.floor(sortedAmounts.length / 2);
    const medianDonation =
      sortedAmounts.length % 2 === 0
        ? (sortedAmounts[mid - 1] + sortedAmounts[mid]) / 2
        : sortedAmounts[mid];

    // Anonymous rate
    const anonymousCount = donationList.filter((d) => d.isAnonymous).length;
    const anonymousRate =
      Math.round((anonymousCount / donationList.length) * 100) / 100;

    // Top donor (by single largest donation, excluding anonymous)
    const namedDonations = donationList.filter((d) => !d.isAnonymous);
    let topDonorName = 'Anonymous';
    let topDonorAmount = 0;
    for (const d of namedDonations) {
      if (d.amount > topDonorAmount) {
        topDonorAmount = d.amount;
        topDonorName = d.donorName;
      }
    }
    // Also check anonymous donations for amount
    for (const d of donationList) {
      if (d.isAnonymous && d.amount > topDonorAmount) {
        topDonorAmount = d.amount;
        topDonorName = 'Anonymous';
      }
    }

    // Peak donation hour — deterministic from day-of-week distribution
    // Since donation data only has dates (no times), simulate hour distribution
    // based on a hash of the date string
    const hourBuckets: number[] = new Array(12).fill(0); // 12 two-hour buckets
    for (const d of donationList) {
      const dateHash = d.createdDate
        .split('')
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const bucket = dateHash % 12;
      hourBuckets[bucket]++;
    }
    const peakBucket = hourBuckets.indexOf(Math.max(...hourBuckets));
    const peakStartHour = peakBucket * 2;
    const peakEndHour = peakStartHour + 2;
    const formatHour = (h: number): string => {
      if (h === 0) return '12 AM';
      if (h < 12) return `${h} AM`;
      if (h === 12) return '12 PM';
      return `${h - 12} PM`;
    };
    const peakDonationHour = `${formatHour(peakStartHour)} - ${formatHour(peakEndHour)}`;

    // Donation distribution
    const ranges: Array<{ label: string; min: number; max: number }> = [
      { label: '$1-25', min: 1, max: 25 },
      { label: '$26-50', min: 26, max: 50 },
      { label: '$51-100', min: 51, max: 100 },
      { label: '$101-250', min: 101, max: 250 },
      { label: '$251-500', min: 251, max: 500 },
      { label: '$501-1,000', min: 501, max: 1000 },
      { label: '$1,001-5,000', min: 1001, max: 5000 },
      { label: '$5,001+', min: 5001, max: Infinity },
    ];

    const donationDistribution = ranges.map((r) => {
      const count = donationList.filter(
        (d) => d.amount >= r.min && d.amount <= r.max,
      ).length;
      return {
        range: r.label,
        count,
        percentage:
          Math.round((count / donationList.length) * 10000) / 100,
      };
    });

    return {
      peakDonationHour,
      avgDonation,
      medianDonation,
      anonymousRate,
      topDonorName,
      topDonorAmount,
      donationDistribution,
    };
  }

  // ── 4. Platform Insights ───────────────────────────────────────────────────

  getPlatformInsights(): PlatformInsights {
    const allFundraisers = getAllFundraisers();
    const allDonations = donations;

    // Most popular category by fundraiser count
    const categoryCounts: Partial<Record<FundraiserCategory, number>> = {};
    for (const f of allFundraisers) {
      categoryCounts[f.category] = (categoryCounts[f.category] ?? 0) + 1;
    }
    const sortedCategories = Object.entries(categoryCounts).sort(
      ([, a], [, b]) => b - a,
    );
    const topCategory = (sortedCategories[0]?.[0] ?? 'other') as FundraiserCategory;
    const mostPopularCategory = CATEGORY_LABELS[topCategory];

    // Average campaign duration (created to last donation, in days)
    const durations = allFundraisers.map((f) =>
      daysBetween(f.createdDate, f.lastDonationDate),
    );
    const avgCampaignDuration =
      durations.length > 0
        ? Math.round(
            durations.reduce((s, d) => s + d, 0) / durations.length,
          )
        : 0;

    // Best performing day — day with most donation dollars
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayTotals: number[] = new Array(7).fill(0);
    for (const d of allDonations) {
      const dayIndex = new Date(d.createdDate).getDay();
      dayTotals[dayIndex] += d.amount;
    }
    const bestDayIndex = dayTotals.indexOf(Math.max(...dayTotals));
    const bestPerformingDay = dayNames[bestDayIndex];

    // Average donations per campaign
    const avgDonationsPerCampaign =
      allFundraisers.length > 0
        ? Math.round(
            (allDonations.length / allFundraisers.length) * 10,
          ) / 10
        : 0;

    // Success prediction — weighted average of all campaigns' completion rates
    // with a sigmoid-like transform for a probability feel
    const avgCompletionRate =
      allFundraisers.length > 0
        ? allFundraisers.reduce(
            (s, f) => s + Math.min(1, f.raisedAmount / f.goalAmount),
            0,
          ) / allFundraisers.length
        : 0;
    // Apply a mild sigmoid transform: p = 1 / (1 + e^(-k*(x-0.5)))
    const k = 6;
    const successPrediction =
      Math.round(
        (1 / (1 + Math.exp(-k * (avgCompletionRate - 0.5)))) * 100,
      ) / 100;

    return {
      mostPopularCategory,
      avgCampaignDuration,
      bestPerformingDay,
      avgDonationsPerCampaign,
      successPrediction,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 80) return 'A';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    if (score >= 35) return 'D';
    return 'F';
  }
}

// Export singleton
export const aiInsights = new AIInsightsEngine();
