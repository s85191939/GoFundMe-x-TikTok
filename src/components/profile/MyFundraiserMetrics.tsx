'use client';

import { useState, useMemo } from 'react';
import type { Fundraiser, Donation } from '@/data/types';
import { formatCurrency } from '@/lib/formatters';
import { aiInsights } from '@/lib/aiInsights';

interface MyFundraiserMetricsProps {
  fundraisers: Fundraiser[];
  donations: Donation[];
}

type Tab = 'overview' | 'campaigns' | 'donors' | 'ai';

export default function MyFundraiserMetrics({ fundraisers, donations }: MyFundraiserMetricsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const stats = useMemo(() => {
    const totalRaised = fundraisers.reduce((sum, f) => sum + f.raisedAmount, 0);
    const totalGoal = fundraisers.reduce((sum, f) => sum + f.goalAmount, 0);
    const totalDonations = donations.length;
    const avgDonation = totalDonations > 0 ? totalRaised / totalDonations : 0;
    const completionRate = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0;
    const activeCampaigns = fundraisers.filter(f => f.isActive).length;

    return { totalRaised, totalGoal, totalDonations, avgDonation, completionRate, activeCampaigns };
  }, [fundraisers, donations]);

  const donorInsights = useMemo(() => {
    return aiInsights.getDonorInsights(donations);
  }, [donations]);

  const campaignHealthScores = useMemo(() => {
    return fundraisers.map(f => ({
      fundraiser: f,
      health: aiInsights.getCampaignHealthScore(f),
      trending: aiInsights.getTrendingScore(f),
    }));
  }, [fundraisers]);

  const platformInsights = useMemo(() => {
    return aiInsights.getPlatformInsights();
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'donors', label: 'Donors' },
    { id: 'ai', label: 'AI Insights' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">📊 My Fundraiser Metrics</h2>
        <span className="text-xs text-gfm-gray bg-gray-100 px-2 py-1 rounded-full">Only visible to you</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="border border-gray-200 rounded-xl p-5">
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Total Raised" value={formatCurrency(stats.totalRaised)} accent />
              <StatBox label="Donations" value={stats.totalDonations.toString()} />
              <StatBox label="Avg Donation" value={formatCurrency(stats.avgDonation)} />
              <StatBox label="Active Campaigns" value={stats.activeCampaigns.toString()} />
            </div>

            {/* Goal progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Overall Goal Progress</span>
                <span className="font-semibold text-gray-900">{stats.completionRate.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gfm-green rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gfm-gray">
                {formatCurrency(stats.totalRaised)} of {formatCurrency(stats.totalGoal)} goal
              </p>
            </div>

            {/* Quick metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gfm-gray uppercase tracking-wide">Top Donor</p>
                <p className="font-semibold text-sm text-gray-900 mt-1">{donorInsights.topDonorName}</p>
                <p className="text-xs text-gfm-green">{formatCurrency(donorInsights.topDonorAmount)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gfm-gray uppercase tracking-wide">Peak Activity</p>
                <p className="font-semibold text-sm text-gray-900 mt-1">{donorInsights.peakDonationHour}</p>
                <p className="text-xs text-gfm-gray">Most donations</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            {campaignHealthScores.map(({ fundraiser: f, health, trending }) => (
              <div key={f.id} className="border border-gray-100 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{f.title}</p>
                    <p className="text-xs text-gfm-gray mt-0.5">
                      {formatCurrency(f.raisedAmount)} of {formatCurrency(f.goalAmount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <TrendingBadge label={trending.label} />
                    <HealthGrade grade={health.grade} score={health.score} />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gfm-green rounded-full"
                    style={{ width: `${Math.min((f.raisedAmount / f.goalAmount) * 100, 100)}%` }}
                  />
                </div>

                {/* Factor bars */}
                <div className="grid grid-cols-5 gap-1">
                  {health.factors.map(factor => (
                    <div key={factor.name} className="text-center">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            factor.score / factor.maxScore > 0.7 ? 'bg-green-500' :
                            factor.score / factor.maxScore > 0.4 ? 'bg-yellow-500' : 'bg-red-400'
                          }`}
                          style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gfm-gray mt-0.5 truncate">{factor.name.split(' ')[0]}</p>
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-3 py-2">
                  💡 {health.topRecommendation}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'donors' && (
          <div className="space-y-5">
            {/* Donation distribution */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Donation Distribution</p>
              <div className="space-y-2">
                {donorInsights.donationDistribution.map(d => (
                  <div key={d.range} className="flex items-center gap-3">
                    <span className="text-xs text-gfm-gray w-16 text-right flex-shrink-0">{d.range}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gfm-green/70 rounded-full"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-16 flex-shrink-0">{d.count} ({d.percentage.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donor stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Avg Donation" value={formatCurrency(donorInsights.avgDonation)} />
              <StatBox label="Median Donation" value={formatCurrency(donorInsights.medianDonation)} />
              <StatBox label="Anonymous Rate" value={`${(donorInsights.anonymousRate * 100).toFixed(0)}%`} />
              <StatBox label="Peak Hour" value={donorInsights.peakDonationHour} />
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-5">
            <div className="bg-purple-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                <span>🤖</span> AI Platform Insights
              </p>
              <div className="grid grid-cols-2 gap-3">
                <InsightCard label="Most Popular Category" value={platformInsights.mostPopularCategory} />
                <InsightCard label="Avg Campaign Duration" value={`${platformInsights.avgCampaignDuration.toFixed(0)} days`} />
                <InsightCard label="Best Day for Donations" value={platformInsights.bestPerformingDay} />
                <InsightCard label="Avg Donations/Campaign" value={platformInsights.avgDonationsPerCampaign.toFixed(1)} />
              </div>
              <div className="bg-white rounded-md p-3 mt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Success Prediction</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${platformInsights.successPrediction * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-purple-700">
                    {(platformInsights.successPrediction * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gfm-gray mt-1">
                  Likelihood your campaigns reach their goal based on current trajectory
                </p>
              </div>
            </div>

            {/* Per-campaign AI scores */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Campaign Health Scores</p>
              <div className="space-y-2">
                {campaignHealthScores.map(({ fundraiser: f, health, trending }) => (
                  <div key={f.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <p className="text-sm text-gray-700 truncate flex-1 min-w-0 mr-3">{f.title}</p>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <TrendingBadge label={trending.label} />
                      <HealthGrade grade={health.grade} score={health.score} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Helper Components ----

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className={`text-lg font-bold ${accent ? 'text-gfm-green' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gfm-gray mt-0.5">{label}</p>
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-md p-2.5">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{value}</p>
    </div>
  );
}

function HealthGrade({ grade, score }: { grade: string; score: number }) {
  const color = score > 70 ? 'bg-green-100 text-green-800' : score > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${color}`}>
      {grade}
    </span>
  );
}

function TrendingBadge({ label }: { label: string }) {
  const config: Record<string, { emoji: string; bg: string }> = {
    'Hot': { emoji: '🔥', bg: 'bg-red-50 text-red-700' },
    'Trending': { emoji: '📈', bg: 'bg-orange-50 text-orange-700' },
    'Rising': { emoji: '🚀', bg: 'bg-blue-50 text-blue-700' },
    'Steady': { emoji: '⚡', bg: 'bg-gray-50 text-gray-600' },
    'Quiet': { emoji: '😴', bg: 'bg-gray-50 text-gray-500' },
  };
  const c = config[label] ?? config['Steady'];
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${c.bg}`}>
      {c.emoji} {label}
    </span>
  );
}
