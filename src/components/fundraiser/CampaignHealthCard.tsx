'use client';

import { useMemo } from 'react';
import type { Fundraiser } from '@/data/types';
import { aiInsights } from '@/lib/aiInsights';
import type { CampaignHealth, TrendingData } from '@/lib/aiInsights';

interface CampaignHealthCardProps {
  fundraiser: Fundraiser;
}

function getScoreColor(score: number): string {
  if (score > 70) return '#22c55e'; // green-500
  if (score > 40) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
}

function getGradeColor(grade: CampaignHealth['grade']): string {
  switch (grade) {
    case 'A':
      return '#16a34a'; // green-600
    case 'B':
      return '#22c55e'; // green-500
    case 'C':
      return '#eab308'; // yellow-500
    case 'D':
      return '#f97316'; // orange-500
    case 'F':
      return '#ef4444'; // red-500
  }
}

function getTrendingEmoji(label: TrendingData['label']): string {
  switch (label) {
    case 'Hot':
      return '\uD83D\uDD25';
    case 'Trending':
      return '\uD83D\uDCC8';
    case 'Rising':
      return '\uD83D\uDE80';
    case 'Steady':
      return '\u26A1';
    case 'Quiet':
      return '\uD83D\uDCA4';
  }
}

function getTrendingBgColor(label: TrendingData['label']): string {
  switch (label) {
    case 'Hot':
      return '#fef2f2';
    case 'Trending':
      return '#f0fdf4';
    case 'Rising':
      return '#eff6ff';
    case 'Steady':
      return '#fefce8';
    case 'Quiet':
      return '#f5f5f4';
  }
}

function getTrendingTextColor(label: TrendingData['label']): string {
  switch (label) {
    case 'Hot':
      return '#dc2626';
    case 'Trending':
      return '#16a34a';
    case 'Rising':
      return '#2563eb';
    case 'Steady':
      return '#ca8a04';
    case 'Quiet':
      return '#78716c';
  }
}

export default function CampaignHealthCard({
  fundraiser,
}: CampaignHealthCardProps) {
  const health = useMemo(
    () => aiInsights.getCampaignHealthScore(fundraiser),
    [fundraiser],
  );

  const trending = useMemo(
    () => aiInsights.getTrendingScore(fundraiser),
    [fundraiser],
  );

  const scoreColor = getScoreColor(health.score);
  const gradeColor = getGradeColor(health.grade);
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeOffset = circumference - (health.score / 100) * circumference;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        padding: '1.5rem',
        width: '100%',
      }}
    >
      {/* Header */}
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {'\uD83E\uDD16'} AI Campaign Analysis
      </h3>

      {/* Score gauge + Grade + Trending badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Circular Score Gauge */}
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            flexShrink: 0,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Score arc */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          {/* Score number in center */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {health.score}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.125rem',
              }}
            >
              / 100
            </span>
          </div>
        </div>

        {/* Grade + Trending */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Letter grade */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: gradeColor,
                lineHeight: 1,
              }}
            >
              {health.grade}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Grade
            </span>
          </div>

          {/* Trending badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: getTrendingBgColor(trending.label),
              color: getTrendingTextColor(trending.label),
              fontSize: '0.8125rem',
              fontWeight: 600,
              width: 'fit-content',
            }}
          >
            <span>{getTrendingEmoji(trending.label)}</span>
            <span>{trending.label}</span>
          </div>

          <p
            style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              margin: 0,
              maxWidth: '200px',
              lineHeight: 1.4,
            }}
          >
            {trending.reason}
          </p>
        </div>
      </div>

      {/* Factor breakdown */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h4
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Score Breakdown
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {health.factors.map((factor) => {
            const pct = Math.round((factor.score / factor.maxScore) * 100);
            const barColor = getScoreColor(pct);
            return (
              <div key={factor.name}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: '#4b5563',
                      fontWeight: 500,
                    }}
                  >
                    {factor.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      fontWeight: 500,
                    }}
                  >
                    {factor.score}/{factor.maxScore}
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: barColor,
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top recommendation */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>{'\uD83D\uDCA1'}</span>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1e40af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Top Recommendation
            </span>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#1e3a5f',
                margin: '0.25rem 0 0 0',
                lineHeight: 1.5,
              }}
            >
              {health.topRecommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
