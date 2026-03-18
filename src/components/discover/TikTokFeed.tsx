'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Fundraiser, FundraiserCategory, AnalyticsEventType } from '@/data/types';
import { formatCurrency } from '@/lib/formatters';
import { getPercentage } from '@/lib/utils';
import { getUserById } from '@/data/users';
import { isFollowing as checkIsFollowing, toggleFollow } from '@/lib/social';
import {
  type ScoredItem,
  getTrendingFeed,
  getFollowingFeed,
  trackEngagement,
} from '@/lib/recommendation';
import { initContent } from '@/lib/contentInit';
import PeopleSuggestions from './PeopleSuggestions';
import {
  getSession,
  resetSession,
  recordSignal,
  getNextBatch,
} from '@/lib/feedAlgorithm';

// Initialize generated content on first import
initContent();

// ─── Types ───────────────────────────────────────────────────

type FeedTab = 'for_you' | 'following' | 'trending';

type FeedEntry =
  | { type: 'fundraiser'; item: ScoredItem }
  | { type: 'people'; key: string };

interface TikTokFeedProps {
  onTrack?: (event: AnalyticsEventType, data?: Record<string, unknown>) => void;
}

const categoryEmoji: Record<string, string> = {
  emergency: '🚨', medical: '🏥', education: '📚', nonprofit: '💛',
  community: '🏘️', animals: '🐾', environment: '🌿', memorial: '🕊️',
  sports: '⚽', other: '✨',
};

// ─── Build mixed feed with people cards interspersed ─────────

function buildMixedFeed(items: ScoredItem[]): FeedEntry[] {
  const entries: FeedEntry[] = [];
  let peopleInserted = 0;

  for (let i = 0; i < items.length; i++) {
    entries.push({ type: 'fundraiser', item: items[i] });
    // Insert a "people suggestions" card every 3 fundraisers
    if ((i + 1) % 3 === 0 && peopleInserted < 3) {
      entries.push({ type: 'people', key: `people-${peopleInserted}` });
      peopleInserted++;
    }
  }

  return entries;
}

// ─── Infinite scroll: when user nears end, cycle items with new seed ───

function extendFeed(existing: ScoredItem[], newBatch: ScoredItem[]): ScoredItem[] {
  // Add new batch with modified IDs to avoid key conflicts
  const cycle = Math.floor(existing.length / 12) + 1;
  const extended = newBatch.map(item => ({
    ...item,
    id: `${item.id}-cycle-${cycle}`,
  }));
  return [...existing, ...extended];
}

// ─── Main Feed Component ─────────────────────────────────────

export default function TikTokFeed({ onTrack }: TikTokFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('for_you');
  const [activeIndex, setActiveIndex] = useState(0);
  const [rawItems, setRawItems] = useState<ScoredItem[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [totalFollowed, setTotalFollowed] = useState(0);
  const [showFollowToast, setShowFollowToast] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const dwellStartRef = useRef<number>(Date.now());
  const loadCycleRef = useRef(0);
  const isTabSwitchingRef = useRef(false);

  const feedEntries = buildMixedFeed(rawItems);

  // Load feed based on tab — for_you uses session-aware persuasion engine
  const loadFeed = useCallback((tab: FeedTab) => {
    let items: ScoredItem[];
    if (tab === 'for_you') {
      items = getNextBatch({ batchSize: 12, session: getSession(), tab });
    } else if (tab === 'following') {
      items = getFollowingFeed();
    } else {
      items = getTrendingFeed();
    }
    setRawItems(items);
    loadCycleRef.current = 0;
  }, []);

  useEffect(() => {
    loadFeed(activeTab);
    // Block infinite scroll from firing during the tab-switch render
    isTabSwitchingRef.current = true;
    requestAnimationFrame(() => { isTabSwitchingRef.current = false; });
  }, [activeTab, loadFeed]);

  // Infinite scroll: load more when near the end (only on scroll, NOT on tab switch)
  // For "for_you" tab, uses session-aware persuasion engine for smarter next batch
  useEffect(() => {
    if (isTabSwitchingRef.current) return;
    if (activeIndex >= feedEntries.length - 3 && feedEntries.length > 0) {
      loadCycleRef.current++;
      let newBatch: ScoredItem[];
      if (activeTab === 'for_you') {
        newBatch = getNextBatch({ batchSize: 12, session: getSession(), tab: activeTab });
      } else if (activeTab === 'following') {
        newBatch = getFollowingFeed();
      } else {
        newBatch = getTrendingFeed();
      }
      setRawItems(prev => extendFeed(prev, newBatch));
    }
  }, [activeIndex, feedEntries.length]);

  // Auto-dismiss follow toast after 3 seconds
  useEffect(() => {
    if (!showFollowToast) return;
    const t = setTimeout(() => setShowFollowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showFollowToast, totalFollowed]);

  // Track dwell time and view on current card
  useEffect(() => {
    dwellStartRef.current = Date.now();
    // Track view immediately so it registers for every card including the first
    const entry = feedEntries[activeIndex];
    if (entry && entry.type === 'fundraiser') {
      trackEngagement({
        itemId: entry.item.id,
        category: entry.item.data.category,
        action: 'view',
        timestamp: Date.now(),
      });
      onTrack?.('feed_item_view', {
        itemId: entry.item.id,
        itemType: 'fundraiser',
        category: entry.item.data.category,
        timeSpentMs: 0,
      });
    }
    return () => {
      const exitEntry = feedEntries[activeIndex];
      if (exitEntry && exitEntry.type === 'fundraiser') {
        const dwell = Date.now() - dwellStartRef.current;
        trackEngagement({
          itemId: exitEntry.item.id,
          category: exitEntry.item.data.category,
          action: 'dwell',
          durationMs: dwell,
          timestamp: Date.now(),
        });
      }
    };
  }, [activeIndex]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrollingRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const cardHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / cardHeight);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < feedEntries.length) {
      // Record dwell signal for persuasion engine (dwell tracking handled by useEffect cleanup)
      const prevEntry = feedEntries[activeIndex];
      if (prevEntry && prevEntry.type === 'fundraiser') {
        recordSignal(getSession(), 'dwell', prevEntry.item.data.category);
      }

      setActiveIndex(newIndex);

      // Record signal for persuasion engine (view tracking handled by useEffect)
      const newEntry = feedEntries[newIndex];
      if (newEntry && newEntry.type === 'fundraiser') {
        recordSignal(getSession(), 'view', newEntry.item.data.category);
      }

      onTrack?.('feed_scroll', {
        fromIndex: activeIndex,
        toIndex: newIndex,
        tab: activeTab,
      });
    }
  }, [activeIndex, feedEntries, onTrack, activeTab]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const cardHeight = containerRef.current.clientHeight;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const next = Math.min(activeIndex + 1, feedEntries.length - 1);
        scrollToIdx(next, cardHeight);
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        scrollToIdx(prev, cardHeight);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, feedEntries.length]);

  const scrollToIdx = (idx: number, cardHeight: number) => {
    if (!containerRef.current) return;
    isScrollingRef.current = true;
    setActiveIndex(idx);
    dwellStartRef.current = Date.now();
    containerRef.current.scrollTo({ top: idx * cardHeight, behavior: 'smooth' });
    setTimeout(() => { isScrollingRef.current = false; }, 500);
  };

  const handleTabChange = (tab: FeedTab) => {
    resetSession(); // Reset persuasion session on tab switch
    setActiveTab(tab);
    setActiveIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    onTrack?.('tab_switch', { tab });
  };

  const handleLike = (id: string, category: FundraiserCategory) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      const isLiking = !next.has(id);
      if (isLiking) {
        next.add(id);
        trackEngagement({ itemId: id, category, action: 'like', timestamp: Date.now() });
        recordSignal(getSession(), 'like', category);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSave = (id: string, category: FundraiserCategory) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      const isSaving = !next.has(id);
      if (isSaving) {
        next.add(id);
        trackEngagement({ itemId: id, category, action: 'save', timestamp: Date.now() });
        recordSignal(getSession(), 'save', category);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleDonateClick = (item: ScoredItem) => {
    trackEngagement({
      itemId: item.id,
      category: item.data.category,
      action: 'donate_click',
      timestamp: Date.now(),
    });
    recordSignal(getSession(), 'donate_click', item.data.category);
    onTrack?.('donate_button_click', { fundraiserId: item.id, source: 'feed' });
  };

  const handleShareClick = (item: ScoredItem) => {
    trackEngagement({
      itemId: item.id,
      category: item.data.category,
      action: 'share',
      timestamp: Date.now(),
    });
    recordSignal(getSession(), 'share', item.data.category);
    onTrack?.('share_click', { fundraiserId: item.id, source: 'feed' });
  };

  const hasFollowingContent = activeTab === 'following' &&
    rawItems.some(item => item.signals.social > 0);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-black">
      {/* ─── Tab Bar (TikTok-style top tabs) ─── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-3 pb-2">
        <div className="flex items-center gap-6">
          {([
            { id: 'following' as FeedTab, label: 'Following' },
            { id: 'for_you' as FeedTab, label: 'For You' },
            { id: 'trending' as FeedTab, label: 'Trending' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative text-base font-semibold transition-all duration-200 pb-1 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Followed Count Toast ─── */}
      {showFollowToast && totalFollowed > 0 && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
          <div className="bg-[#00b964] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
            +{totalFollowed} following &mdash; your feed is improving!
          </div>
        </div>
      )}

      {/* ─── Scrollable Feed ─── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {feedEntries.length === 0 ? (
          <EmptyFeedState tab={activeTab} />
        ) : activeTab === 'following' && !hasFollowingContent ? (
          <FollowingEmptyState />
        ) : (
          feedEntries.map((entry, index) => {
            if (entry.type === 'people') {
              return (
                <div key={entry.key} className="w-full h-full snap-start snap-always">
                  <PeopleSuggestions
                    mode="inline"
                    limit={4}
                    onTrack={(event, data) => {
                      if (event === 'follow_click') {
                        setTotalFollowed(prev => prev + 1);
                        setShowFollowToast(true);
                        // Refresh feed after following
                        setTimeout(() => loadFeed(activeTab), 300);
                      }
                      onTrack?.(event, data);
                    }}
                  />
                </div>
              );
            }

            return (
              <div key={entry.item.id} className="w-full h-full snap-start snap-always">
                <FeedCard
                  item={entry.item}
                  isActive={index === activeIndex}
                  isLiked={likedIds.has(entry.item.id)}
                  isSaved={savedIds.has(entry.item.id)}
                  onLike={() => handleLike(entry.item.id, entry.item.data.category)}
                  onSave={() => handleSave(entry.item.id, entry.item.data.category)}
                  onDonate={() => handleDonateClick(entry.item)}
                  onShare={() => handleShareClick(entry.item)}
                  onFollow={() => {
                    setTotalFollowed(prev => prev + 1);
                    setShowFollowToast(true);
                    setTimeout(() => loadFeed(activeTab), 300);
                  }}
                  tab={activeTab}
                />
              </div>
            );
          })
        )}
      </div>

      {/* ─── Progress indicator (compact) ─── */}
      {feedEntries.length > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-10">
          {feedEntries.slice(0, Math.min(feedEntries.length, 25)).map((entry, index) => (
            <button
              key={entry.type === 'fundraiser' ? entry.item.id : (entry as { key: string }).key}
              onClick={() => {
                if (containerRef.current) {
                  scrollToIdx(index, containerRef.current.clientHeight);
                }
              }}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'w-2 h-2 bg-white shadow-lg'
                  : entry.type === 'people'
                    ? 'w-1.5 h-1.5 bg-[#00b964]/50 hover:bg-[#00b964]/80'
                    : 'w-1 h-1 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* ─── Scroll hint ─── */}
      {activeIndex === 0 && feedEntries.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="flex flex-col items-center gap-1 text-white/60">
            <span className="text-xs font-medium">Swipe up to explore</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Feed Card Component ─────────────────────────────────────

interface FeedCardProps {
  item: ScoredItem;
  isActive: boolean;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onDonate: () => void;
  onShare: () => void;
  onFollow: () => void;
  tab: FeedTab;
}

function FeedCard({ item, isActive, isLiked, isSaved, onLike, onSave, onDonate, onShare, onFollow, tab }: FeedCardProps) {
  const fundraiser = item.data;
  const percentage = getPercentage(fundraiser.raisedAmount, fundraiser.goalAmount);
  const organizer = getUserById(fundraiser.organizerId);
  const emoji = categoryEmoji[fundraiser.category] || '✨';
  const [following, setFollowing] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    if (organizer) {
      setFollowing(checkIsFollowing(organizer.id));
    }
  }, [organizer]);

  const handleFollowOrganizer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (organizer) {
      const result = toggleFollow(organizer.id);
      setFollowing(result.following);
      if (result.following) onFollow();
      trackEngagement({
        itemId: item.id,
        category: item.data.category,
        action: 'follow_organizer',
        timestamp: Date.now(),
      });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare();
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      {/* Background image */}
      <Image
        src={fundraiser.heroImage}
        alt={fundraiser.title}
        fill
        className={`object-cover transition-transform duration-700 ${isActive ? 'scale-100' : 'scale-110'}`}
        sizes="100vw"
        priority={isActive}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* ─── Side Action Bar (TikTok-style) ─── */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Organizer avatar with follow button */}
        {organizer && (
          <div className="relative">
            <Link href={`/profile/${organizer.id}`} onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                <Image src={organizer.avatar} alt={organizer.name} width={48} height={48} className="object-cover" />
              </div>
            </Link>
            <button
              onClick={handleFollowOrganizer}
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-all ${
                following
                  ? 'bg-white/20 border border-white/30'
                  : 'bg-[#00b964] animate-pulse'
              }`}
            >
              {following ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Like button */}
        <ActionButton
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(); }}
          icon={
            <svg className={`w-7 h-7 transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-white'}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          label={String(fundraiser.donationCount + (isLiked ? 1 : 0))}
        />

        {/* Donate button */}
        <Link href={`/fundraiser/${fundraiser.id.replace(/-cycle-\d+$/, '')}`} onClick={() => onDonate()}>
          <ActionButton
            icon={
              <div className="w-7 h-7 bg-[#00b964] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
            label="Donate"
          />
        </Link>

        {/* Share button */}
        <ActionButton
          onClick={handleShare}
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          }
          label="Share"
        />

        {/* Save/Bookmark */}
        <ActionButton
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(); }}
          icon={
            <svg className={`w-7 h-7 transition-all ${isSaved ? 'text-yellow-400' : 'text-white'}`} fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          }
          label={isSaved ? 'Saved' : 'Save'}
        />
      </div>

      {/* ─── Bottom Content ─── */}
      <div className="absolute bottom-0 left-0 right-16 p-5 md:p-8 space-y-3 max-w-xl">
        {/* Organizer info */}
        {organizer && (
          <Link
            href={`/profile/${organizer.id}`}
            onClick={e => e.stopPropagation()}
            className={`inline-flex items-center gap-2 transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <span className="text-white font-bold text-sm">@{organizer.name.split(' ').join('').toLowerCase()}</span>
            {organizer.isVerified && (
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {following && (
              <span className="text-[10px] text-white/50 font-medium px-1.5 py-0.5 rounded-full border border-white/20">Following</span>
            )}
          </Link>
        )}

        {/* Category badge + Recommendation score */}
        <div className={`flex items-center gap-2 transition-all duration-500 delay-75 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
            <span>{emoji}</span>
            <span className="capitalize">{fundraiser.category}</span>
          </div>
          {tab === 'for_you' && item.score > 60 && (
            <div className="inline-flex items-center gap-1 bg-[#00b964]/20 backdrop-blur-md text-[#00b964] text-[10px] font-bold px-2 py-1 rounded-full border border-[#00b964]/30">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Picked for you
            </div>
          )}
          {tab === 'trending' && (
            <div className="inline-flex items-center gap-1 bg-orange-500/20 backdrop-blur-md text-orange-300 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-500/30">
              🔥 Trending
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className={`text-xl md:text-3xl font-bold text-white leading-tight transition-all duration-500 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {fundraiser.title}
        </h2>

        {/* Story preview */}
        <p className={`text-white/75 text-sm leading-relaxed line-clamp-2 transition-all duration-500 delay-150 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {fundraiser.story.substring(0, 120)}...
        </p>

        {/* Progress bar */}
        <div className={`space-y-1.5 transition-all duration-500 delay-200 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="w-full bg-white/15 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-[#00b964] rounded-full transition-all duration-1000 ease-out"
              style={{ width: isActive ? `${Math.min(percentage, 100)}%` : '0%' }}
            />
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white font-bold">{formatCurrency(fundraiser.raisedAmount)}</span>
            <span className="text-white/40">of {formatCurrency(fundraiser.goalAmount)}</span>
            <span className="text-white/40">&bull;</span>
            <span className="text-[#00b964] font-semibold">{percentage}%</span>
          </div>
        </div>

        {/* CTA row */}
        <div className={`flex items-center gap-3 pt-1 transition-all duration-500 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <Link
            href={`/fundraiser/${fundraiser.id.replace(/-cycle-\d+$/, '')}`}
            onClick={() => onDonate()}
            className="bg-[#00b964] hover:bg-[#009e54] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all shadow-lg shadow-[#00b964]/30 active:scale-95"
          >
            Donate Now
          </Link>
          <Link
            href={`/fundraiser/${fundraiser.id.replace(/-cycle-\d+$/, '')}`}
            className="text-white/60 hover:text-white text-sm font-medium transition-colors"
          >
            Read Story →
          </Link>
        </div>
      </div>

      {/* ─── Share Toast ─── */}
      {showShareToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-full shadow-lg animate-fade-in">
          Link copied! 🔗
        </div>
      )}
    </div>
  );
}

// ─── Action Button ───────────────────────────────────────────

function ActionButton({ onClick, icon, label }: {
  onClick?: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className="transition-transform active:scale-90 group-hover:scale-110">
        {icon}
      </div>
      <span className="text-white text-[10px] font-medium">{label}</span>
    </button>
  );
}

// ─── Empty States ────────────────────────────────────────────

function EmptyFeedState({ tab }: { tab: FeedTab }) {
  return (
    <div className="w-full h-full flex items-center justify-center snap-start snap-always">
      <div className="text-center space-y-4 max-w-sm px-6">
        <div className="text-6xl">
          {tab === 'for_you' ? '✨' : tab === 'following' ? '👥' : '🔥'}
        </div>
        <h3 className="text-xl font-bold text-white">No items yet</h3>
        <p className="text-white/60 text-sm">
          {tab === 'for_you'
            ? 'Select your interests to get personalized recommendations.'
            : tab === 'following'
              ? 'Follow people to see their campaigns here.'
              : 'Check back later for trending campaigns.'}
        </p>
      </div>
    </div>
  );
}

function FollowingEmptyState() {
  return (
    <div className="w-full h-full flex items-center justify-center snap-start snap-always">
      <div className="text-center space-y-6 max-w-sm px-6">
        <div className="text-6xl">👥</div>
        <h3 className="text-xl font-bold text-white">Follow people to fill your feed</h3>
        <p className="text-white/60 text-sm">
          When you follow organizers and donors, their campaigns will appear here.
        </p>
        <PeopleSuggestions mode="inline" limit={4} />
      </div>
    </div>
  );
}
