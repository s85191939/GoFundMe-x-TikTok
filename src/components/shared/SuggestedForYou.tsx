'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  getRecommendedPeople,
  toggleFollow,
  followMultipleUsers,
  isFollowing as checkFollowing,
  dismissSuggestion,
  type UserRecommendation,
} from '@/lib/social';
import { generateUsers } from '@/lib/userGenerator';
import { registerUsers } from '@/data/users';
import { analytics } from '@/lib/analytics';

interface SuggestedForYouProps {
  /** Max people to show */
  limit?: number;
  /** Compact mode for sidebar */
  compact?: boolean;
}

/**
 * "Suggested for you" — GoFundMe-style follow funnel.
 *
 * NEVER returns null — always shows people to follow.
 * When pool runs low, generates new users on the fly.
 * Includes "Follow All" bulk action button.
 */
export default function SuggestedForYou({
  limit = 8,
  compact = false,
}: SuggestedForYouProps) {
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  // Ensure we always have enough recommendations
  const ensurePool = useCallback(() => {
    let recs = getRecommendedPeople(limit + 8);

    // If pool is too small, generate more users and re-fetch
    if (recs.length < 4) {
      const newUsers = generateUsers(12);
      registerUsers(newUsers);
      recs = getRecommendedPeople(limit + 8);
    }

    setRecommendations(recs);
    const states: Record<string, boolean> = {};
    for (const r of recs) {
      states[r.user.id] = checkFollowing(r.user.id);
    }
    setFollowStates(states);
  }, [limit]);

  useEffect(() => {
    ensurePool();
  }, [limit, refreshKey, ensurePool]);

  const handleFollow = (userId: string) => {
    const result = toggleFollow(userId);
    setFollowStates(prev => ({ ...prev, [userId]: result.following }));
    analytics.track('follow_click', '/home', {
      targetUserId: userId,
      source: 'suggested_for_you',
      action: result.following ? 'follow' : 'unfollow',
    });

    // If unfollowed count drops below threshold, refresh
    const unfollowedCount = Object.values({ ...followStates, [userId]: result.following })
      .filter(v => !v).length;
    if (unfollowedCount < 2) {
      // Generate fresh users and refresh
      const newUsers = generateUsers(8);
      registerUsers(newUsers);
      setRefreshKey(k => k + 1);
    }
  };

  const handleFollowAll = () => {
    const unfollowedIds = visibleDisplayRecs
      .filter(r => !followStates[r.user.id])
      .map(r => r.user.id);

    if (unfollowedIds.length === 0) return;

    followMultipleUsers(unfollowedIds);

    const newStates = { ...followStates };
    for (const id of unfollowedIds) {
      newStates[id] = true;
    }
    setFollowStates(newStates);

    analytics.track('cta_click', '/home', {
      action: 'follow_all',
      count: unfollowedIds.length,
      source: 'suggested_for_you',
    });

    // After following all, generate new batch immediately
    setTimeout(() => {
      const newUsers = generateUsers(12);
      registerUsers(newUsers);
      setRefreshKey(k => k + 1);
    }, 800);
  };

  const handleDismiss = (userId: string) => {
    dismissSuggestion(userId);
    setDismissedIds(prev => {
      const next = new Set(Array.from(prev));
      next.add(userId);
      return next;
    });
    analytics.track('cta_click', '/home', {
      action: 'dismiss_suggestion',
      targetUserId: userId,
    });

    // If dismissals reduce pool too much, refresh
    const remaining = recommendations.filter(
      r => !dismissedIds.has(r.user.id) && r.user.id !== userId
    );
    if (remaining.length < 4) {
      const newUsers = generateUsers(8);
      registerUsers(newUsers);
      setRefreshKey(k => k + 1);
    }
  };

  // Filter out dismissed — show all up to limit
  const visibleRecs = recommendations.filter(r => !dismissedIds.has(r.user.id));
  const visibleDisplayRecs = visibleRecs.slice(0, limit);

  // Count of unfollowed users in current display
  const unfollowedCount = visibleDisplayRecs.filter(r => !followStates[r.user.id]).length;

  // NEVER return null — always render the follow funnel
  return (
    <div className={compact ? '' : 'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'}>
      {/* Header */}
      <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'px-5 pt-5 pb-3'}`}>
        <h3 className={`font-bold ${compact ? 'text-base text-gray-900' : 'text-lg text-gray-900'}`}>
          Suggested for you
        </h3>
        <div className="flex items-center gap-2">
          {/* Follow All Button — always prominent */}
          {unfollowedCount > 0 && (
            <button
              onClick={handleFollowAll}
              className="flex items-center gap-1.5 bg-[#2e443b] text-white hover:bg-[#1e3028] font-bold rounded-full px-4 py-2 text-sm shadow-sm transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Follow All
              <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-xs font-medium">
                {unfollowedCount}
              </span>
            </button>
          )}
          {/* See all button removed — showing 8 at a time is sufficient */}
        </div>
      </div>

      {/* People List */}
      <div className={compact ? 'space-y-1' : 'divide-y divide-gray-50'}>
        {visibleDisplayRecs.map((rec) => (
          <SuggestionRow
            key={rec.user.id}
            rec={rec}
            isFollowing={followStates[rec.user.id] || false}
            onFollow={() => handleFollow(rec.user.id)}
            onDismiss={() => handleDismiss(rec.user.id)}
            compact={compact}
          />
        ))}
      </div>

    </div>
  );
}

// ─── Individual Suggestion Row ───────────────────────────────

function SuggestionRow({
  rec,
  isFollowing,
  onFollow,
  onDismiss,
  compact = false,
}: {
  rec: UserRecommendation;
  isFollowing: boolean;
  onFollow: () => void;
  onDismiss: () => void;
  compact?: boolean;
}) {
  const user = rec.user;

  return (
    <div className={`flex items-center gap-3 group transition-colors ${
      compact ? 'py-2.5 px-1' : 'py-3.5 px-5 hover:bg-gray-50/50'
    }`}>
      {/* Avatar */}
      <Link href={`/profile/${user.id}`} className="flex-shrink-0">
        <div className={`${compact ? 'w-11 h-11' : 'w-14 h-14'} rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-50`}>
          <Image
            src={user.avatar}
            alt={user.name}
            width={56}
            height={56}
            className="object-cover w-full h-full"
          />
        </div>
      </Link>

      {/* Name + Reason */}
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.id}`} className="block">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold text-gray-900 truncate ${compact ? 'text-sm' : 'text-[15px]'}`}>
              {user.name}
            </span>
            {user.isVerified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </Link>
        {/* Recommendation reason */}
        <p className={`text-gray-500 truncate ${compact ? 'text-xs' : 'text-xs mt-0.5'}`}>
          {rec.reason}
        </p>
        {rec.secondaryReason && !compact && (
          <p className="text-gray-400 text-[11px] truncate mt-0.5">
            {rec.secondaryReason}
          </p>
        )}
      </div>

      {/* Follow Button */}
      <button
        onClick={onFollow}
        className={`flex-shrink-0 font-bold rounded-full transition-all active:scale-95 ${
          isFollowing
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 text-sm'
            : 'bg-[#2e443b] text-white hover:bg-[#1e3028] px-5 py-2.5 text-sm shadow-sm'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>

      {/* Dismiss Button */}
      {!isFollowing && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1.5 text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
