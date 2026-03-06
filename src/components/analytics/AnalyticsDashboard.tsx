'use client';

import { useState, useEffect, useCallback } from 'react';
import { analytics } from '@/lib/analytics';

export default function AnalyticsDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState(analytics.getMetrics());

  const updateMetrics = useCallback(() => {
    setMetrics(analytics.getMetrics());
  }, []);

  useEffect(() => {
    analytics.subscribe(updateMetrics);
    return () => analytics.unsubscribe(updateMetrics);
  }, [updateMetrics]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center text-lg"
        title="Analytics Dashboard"
      >
        📊
      </button>

      {/* Dashboard panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-sm">📊 Live Analytics</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            <MetricRow label="Page Views" value={metrics.totalPageViews} />
            <MetricRow label="Max Scroll Depth" value={`${metrics.maxScrollDepth}%`} />
            <MetricRow label="CTA Clicks" value={metrics.ctaClicks} />
            <MetricRow label="Share Clicks" value={metrics.shareClicks} />

            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Donation Funnel</p>
              <FunnelStep label="Button Clicks" value={metrics.donationFunnel.buttonClicks} />
              <FunnelStep label="Modal Opens" value={metrics.donationFunnel.modalOpens} />
              <FunnelStep label="Amount Selected" value={metrics.donationFunnel.amountSelects} />
              <FunnelStep label="Submitted" value={metrics.donationFunnel.submissions} />
            </div>

            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">AI Features</p>
              <MetricRow label="Story Generates" value={analytics.getEvents().filter(e => e.type === 'ai_story_generate').length} />
              <MetricRow label="Suggestion Clicks" value={analytics.getEvents().filter(e => e.type === 'ai_suggestion_click').length} />
            </div>

            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Events</p>
              <p className="text-2xl font-bold text-gfm-green">{analytics.getEvents().length}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <span className="font-bold text-gfm-green">{value}</span>
    </div>
  );
}

function FunnelStep({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-200">{value}</span>
    </div>
  );
}
