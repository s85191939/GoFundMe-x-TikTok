'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getRecommendedPeople, toggleFollow, isFollowing as checkFollowing, type UserRecommendation } from '@/lib/social';
import type { AnalyticsEventType } from '@/data/types';

interface PeopleSuggestionsProps {
  /** Render mode: 'inline' for feed card, 'sidebar' for sidebar widget, 'full' for full page */
  mode?: 'inline' | 'sidebar' | 'full';
  limit?: number;
  onTrack?: (event: AnalyticsEventType, data?: Record<string, unknown>) => void;
}

/**
 * "People You May Know" — A rapid follow funnel.
 *
 * Designed to be shown inside the TikTok feed every few cards,
 * making it extremely easy to follow interesting people.
 */
export default function PeopleSuggestions({ mode = 'inline', limit = 6, onTrack }: PeopleSuggestionsProps) {
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [followedCount, setFollowedCount] = useState(0);

  useEffect(() => {
    const recs = getRecommendedPeople(limit);
    setRecommendations(recs);
    // Initialize follow states
    const states: Record<string, boolean> = {};
    for (const r of recs) {
      states[r.user.id] = checkFollowing(r.user.id);
    }
    setFollowStates(states);
  }, [limit]);

  const handleFollow = (userId: string) => {
    const result = toggleFollow(userId);
    setFollowStates(prev => ({ ...prev, [userId]: result.following }));
    if (result.following) {
      setFollowedCount(prev => prev + 1);
    } else {
      setFollowedCount(prev => Math.max(0, prev - 1));
    }
    onTrack?.('follow_click', { targetUserId: userId, source: 'people_suggestions', mode });
  };

  if (recommendations.length === 0) return null;

  if (mode === 'inline') {
    return <InlinePeopleSuggestions recommendations={recommendations} followStates={followStates} onFollow={handleFollow} followedCount={followedCount} />;
  }

  if (mode === 'sidebar') {
    return <SidebarPeopleSuggestions recommendations={recommendations} followStates={followStates} onFollow={handleFollow} />;
  }

  return <FullPeopleSuggestions recommendations={recommendations} followStates={followStates} onFollow={handleFollow} followedCount={followedCount} />;
}

// ─── Inline: Full-screen card in the TikTok feed ─────────────

function InlinePeopleSuggestions({
  recommendations,
  followStates,
  onFollow,
  followedCount,
}: {
  recommendations: UserRecommendation[];
  followStates: Record<string, boolean>;
  onFollow: (id: string) => void;
  followedCount: number;
}) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-gray-950 to-black flex items-center justify-center snap-start snap-always">
      <div className="max-w-md w-full px-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00b964]/20 mb-2">
            <svg className="w-8 h-8 text-[#00b964]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">People making a difference</h3>
          <p className="text-white/50 text-sm">Follow them to see their campaigns in your feed</p>
        </div>

        {/* People grid */}
        <div className="space-y-3">
          {recommendations.slice(0, 4).map(rec => (
            <PersonCard
              key={rec.user.id}
              rec={rec}
              isFollowing={followStates[rec.user.id] || false}
              onFollow={() => onFollow(rec.user.id)}
              variant="dark"
            />
          ))}
        </div>

        {/* Follow all CTA */}
        {followedCount < recommendations.length && (
          <div className="text-center pt-2">
            <button
              onClick={() => {
                for (const rec of recommendations) {
                  if (!followStates[rec.user.id]) {
                    onFollow(rec.user.id);
                  }
                }
              }}
              className="text-[#00b964] text-sm font-semibold hover:text-[#00b964]/80 transition-colors"
            >
              Follow all ({recommendations.length - followedCount} remaining)
            </button>
          </div>
        )}

        {/* Success state */}
        {followedCount > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#00b964]/10 text-[#00b964] text-sm font-medium px-4 py-2 rounded-full border border-[#00b964]/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Following {followedCount} new {followedCount === 1 ? 'person' : 'people'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar: Compact widget for navbar dropdown ─────────────

function SidebarPeopleSuggestions({
  recommendations,
  followStates,
  onFollow,
}: {
  recommendations: UserRecommendation[];
  followStates: Record<string, boolean>;
  onFollow: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Suggested for you</h4>
      {recommendations.slice(0, 3).map(rec => (
        <PersonCard
          key={rec.user.id}
          rec={rec}
          isFollowing={followStates[rec.user.id] || false}
          onFollow={() => onFollow(rec.user.id)}
          variant="light"
          compact
        />
      ))}
    </div>
  );
}

// ─── Full: Standalone people discovery section ───────────────

function FullPeopleSuggestions({
  recommendations,
  followStates,
  onFollow,
  followedCount,
}: {
  recommendations: UserRecommendation[];
  followStates: Record<string, boolean>;
  onFollow: (id: string) => void;
  followedCount: number;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discover People</h2>
          <p className="text-sm text-gray-500 mt-1">People you may want to follow based on your interests</p>
        </div>
        {followedCount > 0 && (
          <span className="text-sm text-[#00b964] font-medium">
            +{followedCount} new following
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(rec => (
          <PersonCard
            key={rec.user.id}
            rec={rec}
            isFollowing={followStates[rec.user.id] || false}
            onFollow={() => onFollow(rec.user.id)}
            variant="card"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Shared Person Card ──────────────────────────────────────

function PersonCard({
  rec,
  isFollowing,
  onFollow,
  variant = 'dark',
  compact = false,
}: {
  rec: UserRecommendation;
  isFollowing: boolean;
  onFollow: () => void;
  variant?: 'dark' | 'light' | 'card';
  compact?: boolean;
}) {
  const user = rec.user;

  if (variant === 'card') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <Link href={`/profile/${user.id}`}>
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-gray-100">
              <Image src={user.avatar} alt={user.name} width={56} height={56} className="object-cover w-full h-full" />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${user.id}`}>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-gray-900 text-sm truncate">{user.name}</h4>
                {user.isVerified && (
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </Link>
            <p className="text-xs text-gray-500 mt-0.5">{user.location}</p>
            <p className="text-xs text-[#00b964] font-medium mt-1">{rec.reason}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>{user.followerCount} followers</span>
              {rec.mutualConnections > 0 && (
                <span>{rec.mutualConnections} mutual</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onFollow}
          className={`w-full mt-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            isFollowing
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-[#00b964] text-white hover:bg-[#009e54] shadow-sm'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-1' : 'py-2'} ${
      variant === 'dark' ? 'bg-white/5 rounded-xl px-4 border border-white/10' : ''
    }`}>
      <Link href={`/profile/${user.id}`} className="flex-shrink-0">
        <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full overflow-hidden ${
          variant === 'dark' ? 'border-2 border-white/20' : 'border-2 border-gray-200'
        }`}>
          <Image src={user.avatar} alt={user.name} width={48} height={48} className="object-cover w-full h-full" />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <Link href={`/profile/${user.id}`}>
            <span className={`font-semibold text-sm truncate ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {user.name}
            </span>
          </Link>
          {user.isVerified && (
            <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className={`text-xs truncate ${variant === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
          {rec.reason}
        </p>
      </div>
      <button
        onClick={onFollow}
        className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
          isFollowing
            ? variant === 'dark'
              ? 'bg-white/10 text-white/60 border border-white/20'
              : 'bg-gray-100 text-gray-500'
            : variant === 'dark'
              ? 'bg-[#00b964] text-white shadow-sm'
              : 'bg-[#00b964] text-white shadow-sm'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
