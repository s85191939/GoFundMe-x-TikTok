'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Fundraiser, Community, AnalyticsEventType } from '@/data/types';
import { formatCurrency } from '@/lib/formatters';
import { getPercentage } from '@/lib/utils';
import { getUserById } from '@/data/users';

type FeedItem =
  | { type: 'fundraiser'; data: Fundraiser }
  | { type: 'community'; data: Community };

interface FeedMetrics {
  itemId: string;
  itemType: 'fundraiser' | 'community';
  category?: string;
  timeSpentMs: number;
  impressionStart: number;
}

interface DiscoverFeedProps {
  fundraisers: Fundraiser[];
  communities: Community[];
  onTrack?: (event: AnalyticsEventType, data?: Record<string, unknown>) => void;
}

const categoryEmoji: Record<string, string> = {
  emergency: '🚨',
  medical: '🏥',
  education: '📚',
  nonprofit: '💛',
  community: '🏘️',
  animals: '🐾',
  environment: '🌿',
  memorial: '🕊️',
  sports: '⚽',
  other: '✨',
};

export default function DiscoverFeed({ fundraisers, communities, onTrack }: DiscoverFeedProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const metricsRef = useRef<FeedMetrics | null>(null);
  const categoryTimeRef = useRef<Record<string, number>>({});
  const [categoryEngagement, setCategoryEngagement] = useState<Record<string, number>>({});

  // Interleave fundraisers and communities into a feed
  const feedItems: FeedItem[] = [];
  let communityIdx = 0;
  for (let i = 0; i < fundraisers.length; i++) {
    feedItems.push({ type: 'fundraiser', data: fundraisers[i] });
    // Insert a community card every 3 fundraisers
    if ((i + 1) % 3 === 0 && communityIdx < communities.length) {
      feedItems.push({ type: 'community', data: communities[communityIdx] });
      communityIdx++;
    }
  }
  // Append remaining communities
  while (communityIdx < communities.length) {
    feedItems.push({ type: 'community', data: communities[communityIdx] });
    communityIdx++;
  }

  // --- Feed Metrics Tracking ---

  const getItemId = useCallback((item: FeedItem) => {
    return item.type === 'fundraiser'
      ? (item.data as Fundraiser).id
      : (item.data as Community).id;
  }, []);

  const getItemCategory = useCallback((item: FeedItem) => {
    return item.type === 'fundraiser'
      ? (item.data as Fundraiser).category
      : 'community';
  }, []);

  // Start tracking time for current item
  const startTracking = useCallback((index: number) => {
    const item = feedItems[index];
    if (!item) return;
    metricsRef.current = {
      itemId: getItemId(item),
      itemType: item.type,
      category: getItemCategory(item),
      timeSpentMs: 0,
      impressionStart: Date.now(),
    };
  }, [feedItems, getItemId, getItemCategory]);

  // Stop tracking and record metrics
  const stopTracking = useCallback(() => {
    if (!metricsRef.current) return;
    const elapsed = Date.now() - metricsRef.current.impressionStart;
    metricsRef.current.timeSpentMs = elapsed;

    // Track time per category
    const cat = metricsRef.current.category || 'unknown';
    categoryTimeRef.current[cat] = (categoryTimeRef.current[cat] || 0) + elapsed;
    setCategoryEngagement({ ...categoryTimeRef.current });

    // Emit event
    onTrack?.('feed_item_view', {
      itemId: metricsRef.current.itemId,
      itemType: metricsRef.current.itemType,
      category: metricsRef.current.category,
      timeSpentMs: elapsed,
      timeSpentSec: Math.round(elapsed / 1000),
    });

    metricsRef.current = null;
  }, [onTrack]);

  // Track on mount and cleanup
  useEffect(() => {
    startTracking(0);
    return () => { stopTracking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track category engagement periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (metricsRef.current) {
        const cat = metricsRef.current.category || 'unknown';
        const elapsed = Date.now() - metricsRef.current.impressionStart;
        const updated = { ...categoryTimeRef.current, [cat]: (categoryTimeRef.current[cat] || 0) + elapsed };
        setCategoryEngagement(updated);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrollingRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const cardHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / cardHeight);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < feedItems.length) {
      // Stop tracking previous, start tracking new
      stopTracking();
      setActiveIndex(newIndex);
      startTracking(newIndex);

      onTrack?.('feed_scroll', {
        fromIndex: activeIndex,
        toIndex: newIndex,
        itemType: feedItems[newIndex].type,
        itemId: getItemId(feedItems[newIndex]),
      });
    }
  }, [activeIndex, feedItems, onTrack, stopTracking, startTracking, getItemId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const cardHeight = containerRef.current.clientHeight;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const next = Math.min(activeIndex + 1, feedItems.length - 1);
        stopTracking();
        setActiveIndex(next);
        startTracking(next);
        isScrollingRef.current = true;
        containerRef.current.scrollTo({ top: next * cardHeight, behavior: 'smooth' });
        setTimeout(() => { isScrollingRef.current = false; }, 500);
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        stopTracking();
        setActiveIndex(prev);
        startTracking(prev);
        isScrollingRef.current = true;
        containerRef.current.scrollTo({ top: prev * cardHeight, behavior: 'smooth' });
        setTimeout(() => { isScrollingRef.current = false; }, 500);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, feedItems.length, stopTracking, startTracking]);

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const cardHeight = containerRef.current.clientHeight;
    stopTracking();
    setActiveIndex(index);
    startTracking(index);
    isScrollingRef.current = true;
    containerRef.current.scrollTo({ top: index * cardHeight, behavior: 'smooth' });
    setTimeout(() => { isScrollingRef.current = false; }, 500);
  };

  // Get top categories for "For You" personalization hint
  const topCategories = Object.entries(categoryEngagement)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      {/* Scrollable feed container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {feedItems.map((item, index) => (
          <div key={`${item.type}-${getItemId(item)}`} className="w-full h-full snap-start snap-always">
            {item.type === 'fundraiser' ? (
              <FundraiserFeedCard fundraiser={item.data as Fundraiser} isActive={index === activeIndex} />
            ) : (
              <CommunityFeedCard community={item.data as Community} isActive={index === activeIndex} />
            )}
          </div>
        ))}
      </div>

      {/* Progress dots - right side */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
        {feedItems.map((item, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'w-2.5 h-2.5 bg-white shadow-lg'
                : item.type === 'community'
                  ? 'w-1.5 h-1.5 bg-purple-400/50 hover:bg-purple-400/80'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to item ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter + Category engagement */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
          {activeIndex + 1} / {feedItems.length}
        </div>
        {topCategories.length > 0 && (
          <div className="bg-black/40 backdrop-blur-sm text-white/70 text-[10px] px-3 py-1 rounded-full">
            Trending for you: {topCategories.map(c => categoryEmoji[c] || '📌').join(' ')}
          </div>
        )}
      </div>

      {/* Scroll hint - only on first card */}
      {activeIndex === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="flex flex-col items-center gap-1 text-white/70">
            <span className="text-xs font-medium">Scroll to explore</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────── Fundraiser Card ──────────────────────────────── */

function FundraiserFeedCard({ fundraiser, isActive }: { fundraiser: Fundraiser; isActive: boolean }) {
  const percentage = getPercentage(fundraiser.raisedAmount, fundraiser.goalAmount);
  const organizer = getUserById(fundraiser.organizerId);
  const emoji = categoryEmoji[fundraiser.category] || '✨';

  return (
    <Link href={`/fundraiser/${fundraiser.id}`} className="block w-full h-full">
      <div className="relative w-full h-full overflow-hidden bg-gray-900 cursor-pointer group">
        {/* Background image */}
        <Image
          src={fundraiser.heroImage}
          alt={fundraiser.title}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isActive ? 'scale-100' : 'scale-110'}`}
          sizes="100vw"
          priority={isActive}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-12 p-6 md:p-10 space-y-4 max-w-2xl">
          {/* Category badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
            <span>{emoji}</span>
            <span className="capitalize">{fundraiser.category}</span>
          </div>

          {/* Title */}
          <h2 className={`text-2xl md:text-4xl font-bold text-white leading-tight transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {fundraiser.title}
          </h2>

          {/* Story preview */}
          <p className={`text-white/80 text-sm md:text-base leading-relaxed line-clamp-2 transition-all duration-500 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {fundraiser.story.substring(0, 150)}...
          </p>

          {/* Progress */}
          <div className={`space-y-2 transition-all duration-500 delay-200 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gfm-green rounded-full transition-all duration-1000 ease-out"
                style={{ width: isActive ? `${Math.min(percentage, 100)}%` : '0%' }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white font-semibold">
                {formatCurrency(fundraiser.raisedAmount)} raised
              </span>
              <span className="text-white/60">
                {percentage}% of {formatCurrency(fundraiser.goalAmount)}
              </span>
            </div>
          </div>

          {/* Bottom row: organizer + stats */}
          <div className={`flex items-center justify-between pt-2 transition-all duration-500 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {/* Organizer */}
            {organizer && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30">
                  <Image src={organizer.avatar} alt={organizer.name} width={36} height={36} className="object-cover" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{organizer.name}</p>
                  <p className="text-white/50 text-xs">{organizer.location}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            <span className="bg-gfm-green group-hover:bg-gfm-green-dark text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all shadow-lg shadow-gfm-green/30">
              Donate Now
            </span>
          </div>

          {/* Donation count */}
          <p className="text-white/40 text-xs">
            {fundraiser.donationCount} donations &bull; Last donation {formatRelativeSimple(fundraiser.lastDonationDate)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ──────────────────────────────── Community Card ──────────────────────────────── */

function CommunityFeedCard({ community, isActive }: { community: Community; isActive: boolean }) {
  return (
    <Link href={`/community/${community.id}`} className="block w-full h-full">
      <div className="relative w-full h-full overflow-hidden bg-gray-900 cursor-pointer group">
        {/* Background image */}
        <Image
          src={community.bannerImage}
          alt={community.name}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isActive ? 'scale-100' : 'scale-110'}`}
          sizes="100vw"
          priority={isActive}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-purple-900/20" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-12 p-6 md:p-10 space-y-4 max-w-2xl">
          {/* Community badge */}
          <div className="inline-flex items-center gap-1.5 bg-purple-500/20 backdrop-blur-md text-purple-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-400/30">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span>Community</span>
          </div>

          {/* Avatar + Title */}
          <div className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white/30 flex-shrink-0 shadow-xl">
              <Image src={community.avatarImage} alt={community.name} width={64} height={64} className="object-cover w-full h-full" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {community.name}
              </h2>
              <p className="text-white/70 text-sm md:text-base mt-1">{community.tagline}</p>
            </div>
          </div>

          {/* Description */}
          <p className={`text-white/70 text-sm md:text-base leading-relaxed line-clamp-3 transition-all duration-500 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {community.description.substring(0, 200)}...
          </p>

          {/* Stats row */}
          <div className={`flex items-center gap-6 transition-all duration-500 delay-200 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{community.followerCount}</p>
              <p className="text-white/50 text-xs">Members</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-xl font-bold text-gfm-green">{formatCurrency(community.totalRaised)}</p>
              <p className="text-white/50 text-xs">Raised</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-xl font-bold text-white">{community.activeFundraiserCount}</p>
              <p className="text-white/50 text-xs">Active</p>
            </div>
          </div>

          {/* CTA */}
          <div className={`flex items-center gap-3 pt-2 transition-all duration-500 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <span className="bg-white group-hover:bg-gray-100 text-gray-900 font-semibold px-6 py-2.5 rounded-full text-sm transition-all shadow-lg">
              View Community
            </span>
            <span className="text-white/40 text-xs">
              Founded {new Date(community.createdDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ──────────────────────────────── Helpers ──────────────────────────────── */

function formatRelativeSimple(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
