'use client';

import { useMemo } from 'react';
import type { Fundraiser } from '@/data/types';
import { aiInsights } from '@/lib/aiInsights';

interface CampaignHealthCardProps {
  fundraiser: Fundraiser;
}

export default function CampaignHealthCard({ fundraiser }: CampaignHealthCardProps) {
  const health = useMemo(
    () => aiInsights.getCampaignHealthScore(fundraiser),
    [fundraiser],
  );

  const trending = useMemo(
    () => aiInsights.getTrendingScore(fundraiser),
    [fundraiser],
  );

  // Convert factors into friendly suggestions (no scores)
  const suggestions = useMemo(() => {
    const tips: { emoji: string; title: string; detail: string; status: 'good' | 'improve' | 'attention' }[] = [];

    for (const factor of health.factors) {
      const pct = factor.score / factor.maxScore;
      const status = pct >= 0.7 ? 'good' : pct >= 0.4 ? 'improve' : 'attention';

      if (factor.name === 'Completion Rate') {
        tips.push({
          emoji: '🎯',
          title: 'Funding Progress',
          detail: pct >= 0.7
            ? 'Great progress toward your goal! Momentum is building.'
            : pct >= 0.4
            ? 'You\'re getting there — share your campaign to pick up speed.'
            : 'Consider sharing on social media to boost visibility.',
          status,
        });
      } else if (factor.name === 'Momentum') {
        tips.push({
          emoji: '🚀',
          title: 'Donation Activity',
          detail: pct >= 0.7
            ? 'Donations are coming in strong. Keep sharing updates!'
            : pct >= 0.4
            ? 'Activity is steady. A fresh update could re-engage donors.'
            : 'Try posting an update or sharing on social media to reignite interest.',
          status,
        });
      } else if (factor.name === 'Story Quality') {
        tips.push({
          emoji: '📝',
          title: 'Story Impact',
          detail: pct >= 0.7
            ? 'Your story is compelling and well-written.'
            : pct >= 0.4
            ? 'Adding more personal details could make your story resonate more.'
            : 'Use the AI Story Enhancement above to make your story more engaging.',
          status,
        });
      } else if (factor.name === 'Recency') {
        tips.push({
          emoji: '🕐',
          title: 'Freshness',
          detail: pct >= 0.7
            ? 'Your campaign feels current and active.'
            : 'Adding a recent update shows donors the campaign is still active.',
          status,
        });
      } else if (factor.name === 'Social Sharing Potential') {
        tips.push({
          emoji: '📣',
          title: 'Shareability',
          detail: pct >= 0.7
            ? 'Your campaign is very shareable — keep it up!'
            : 'A strong headline and hero image make people more likely to share.',
          status,
        });
      }
    }

    return tips;
  }, [health.factors]);

  const trendingEmoji = (() => {
    switch (trending.label) {
      case 'Hot': return '🔥';
      case 'Trending': return '📈';
      case 'Rising': return '🚀';
      case 'Steady': return '⚡';
      case 'Quiet': return '💤';
    }
  })();

  const trendingColors = (() => {
    switch (trending.label) {
      case 'Hot': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
      case 'Trending': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
      case 'Rising': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
      case 'Steady': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
      case 'Quiet': return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' };
    }
  })();

  const statusColors = {
    good: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    improve: 'bg-amber-50 border-amber-200 text-amber-700',
    attention: 'bg-red-50 border-red-200 text-red-700',
  };

  const statusDots = {
    good: 'bg-emerald-400',
    improve: 'bg-amber-400',
    attention: 'bg-red-400',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Campaign Insights</h3>
              <p className="text-xs text-gray-500">AI-powered suggestions to improve your campaign</p>
            </div>
          </div>

          {/* Trending badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${trendingColors.bg} ${trendingColors.text} ${trendingColors.border}`}>
            {trendingEmoji} {trending.label}
          </span>
        </div>

        {trending.reason && (
          <p className="text-xs text-gray-400 mt-2">{trending.reason}</p>
        )}
      </div>

      {/* Suggestions */}
      <div className="px-6 pb-4 space-y-3">
        {suggestions.map((tip) => (
          <div
            key={tip.title}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/50 border border-gray-100"
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusDots[tip.status]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm">{tip.emoji}</span>
                <span className="text-sm font-semibold text-gray-900">{tip.title}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{tip.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top recommendation */}
      <div className="mx-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-2.5">
          <span className="text-base flex-shrink-0">💡</span>
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
              Top Recommendation
            </span>
            <p className="text-sm text-blue-900 mt-1 leading-relaxed">
              {health.topRecommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
