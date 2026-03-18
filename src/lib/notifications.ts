/**
 * Notification System
 *
 * Persists notifications in localStorage. New notifications are generated
 * over time from a pool of templates — once generated, they stay in the list.
 * Read state persists. New ones appear as genuinely new (unread).
 *
 * Types:
 * - donation: "Sarah donated $500 to Animal Shelter Expansion"
 * - milestone: "Education Fund just hit 75% of its goal!"
 * - new_campaign: "David just started a new fundraiser"
 * - community: "Watch Duty community reached $100K total raised"
 * - follow: "James Nguyen started following you"
 * - recommendation: "Based on your interests, check out..."
 */

import { getUserById } from '@/data/users';
import { getAllFundraisers } from '@/data/fundraisers';
import { activities } from '@/data/activity';
import { getAllCommunities } from '@/data/communities';
import { getFollowing } from '@/lib/social';
import { CURRENT_USER_ID } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────

export type NotificationType =
  | 'donation'
  | 'milestone'
  | 'new_campaign'
  | 'community_milestone'
  | 'follow'
  | 'recommendation'
  | 'update';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  avatar?: string;
  link?: string;
  timestamp: string;
  read: boolean;
  userId?: string;
  fundraiserId?: string;
  communityId?: string;
}

// ─── Storage Keys ────────────────────────────────────────────

const STORE_KEY = 'gfm_notifications_store';
const LAST_GEN_KEY = 'gfm_notifications_last_gen';

function loadStore(): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStore(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  // Keep max 30 notifications to avoid unbounded growth
  const trimmed = notifications.slice(0, 30);
  localStorage.setItem(STORE_KEY, JSON.stringify(trimmed));
}

function getLastGenTime(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(LAST_GEN_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

function setLastGenTime(t: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_GEN_KEY, String(t));
}

// ─── Public API ──────────────────────────────────────────────

export function markAsRead(notificationId: string): void {
  const store = loadStore();
  const notif = store.find(n => n.id === notificationId);
  if (notif) {
    notif.read = true;
    saveStore(store);
  }
}

export function markAllAsRead(): void {
  const store = loadStore();
  store.forEach(n => { n.read = true; });
  saveStore(store);
}

export function getNotifications(): Notification[] {
  maybeGenerateNew();
  return loadStore();
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}

// ─── Generation Engine ───────────────────────────────────────
// Generates initial seed notifications on first visit, then
// adds new ones periodically (every 2 hours of wall-clock time).

function maybeGenerateNew(): void {
  if (typeof window === 'undefined') return;

  const store = loadStore();
  const lastGen = getLastGenTime();
  const now = Date.now();

  // First visit — generate seed notifications
  if (store.length === 0) {
    const seed = generateSeedNotifications();
    saveStore(seed);
    setLastGenTime(now);
    return;
  }

  // Generate new notifications every 2 hours
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  if (now - lastGen < TWO_HOURS) return;

  // Generate 1-2 new notifications
  const existingIds = new Set(store.map(n => n.id));
  const fresh = generateFreshNotifications(existingIds);

  if (fresh.length > 0) {
    const updated = [...fresh, ...store];
    saveStore(updated);
  }
  setLastGenTime(now);
}

// ─── Seed (first visit) ─────────────────────────────────────

function generateSeedNotifications(): Notification[] {
  const following = getFollowing();
  const notifications: Notification[] = [];
  const allFundraisers = getAllFundraisers();
  const allCommunities = getAllCommunities();

  // 1. Donations from people you follow
  const followedDonationActivities = activities
    .filter(a =>
      a.type === 'donation' &&
      following.includes(a.userId) &&
      a.userId !== CURRENT_USER_ID
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  for (const act of followedDonationActivities) {
    const user = getUserById(act.userId);
    if (!user) continue;
    const amount = act.metadata?.amount ? `$${act.metadata.amount.toLocaleString()}` : '';
    const title = act.metadata?.fundraiserTitle || 'a fundraiser';

    notifications.push({
      id: `notif-donation-${act.id}`,
      type: 'donation',
      title: `${user.name} donated`,
      message: `${amount} to "${title}"`,
      avatar: user.avatar,
      link: `/fundraiser/${act.targetId}`,
      timestamp: act.timestamp,
      read: false,
      userId: act.userId,
      fundraiserId: act.targetId,
    });
  }

  // 2. New campaigns from people you follow
  const followedCampaigns = activities
    .filter(a =>
      a.type === 'fundraiser_created' &&
      following.includes(a.userId) &&
      a.userId !== CURRENT_USER_ID
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 2);

  for (const act of followedCampaigns) {
    const user = getUserById(act.userId);
    if (!user) continue;

    notifications.push({
      id: `notif-campaign-${act.id}`,
      type: 'new_campaign',
      title: `${user.name} started a fundraiser`,
      message: `"${act.metadata?.fundraiserTitle || 'New campaign'}"`,
      avatar: user.avatar,
      link: `/fundraiser/${act.targetId}`,
      timestamp: act.timestamp,
      read: false,
      userId: act.userId,
      fundraiserId: act.targetId,
    });
  }

  // 3. Fundraiser milestones
  const nearGoal = allFundraisers.filter(f => {
    const pct = f.raisedAmount / f.goalAmount;
    return pct >= 0.65 && pct < 1.0 && f.isActive;
  });

  for (const f of nearGoal.slice(0, 2)) {
    const pct = Math.round((f.raisedAmount / f.goalAmount) * 100);
    notifications.push({
      id: `notif-milestone-${f.id}`,
      type: 'milestone',
      title: `Almost there! ${pct}% funded`,
      message: `"${f.title}" is close to reaching its goal`,
      link: `/fundraiser/${f.id}`,
      timestamp: f.lastDonationDate,
      read: false,
      fundraiserId: f.id,
    });
  }

  // 4. Community milestone
  const topCommunity = allCommunities
    .sort((a, b) => b.totalRaised - a.totalRaised)[0];

  if (topCommunity) {
    notifications.push({
      id: `notif-community-${topCommunity.id}`,
      type: 'community_milestone',
      title: `${topCommunity.name} is thriving!`,
      message: `$${topCommunity.totalRaised.toLocaleString()} raised across ${topCommunity.activeFundraiserCount} fundraisers`,
      avatar: topCommunity.avatarImage,
      link: `/community/${topCommunity.id}`,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      communityId: topCommunity.id,
    });
  }

  // 5. Initial follow notification
  const follower = pickRandom(FOLLOW_POOL);
  if (follower) {
    const user = getUserById(follower.userId);
    notifications.push({
      id: `notif-follow-${Date.now()}-1`,
      type: 'follow',
      title: 'New follower!',
      message: `${user?.name || follower.name} started following you`,
      avatar: user?.avatar,
      link: `/profile/${follower.userId}`,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
      userId: follower.userId,
    });
  }

  // Sort newest first
  notifications.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return notifications;
}

// ─── Fresh notifications (periodic) ─────────────────────────

const FOLLOW_POOL = [
  { userId: 'user-2', name: '' },
  { userId: 'user-3', name: '' },
  { userId: 'user-4', name: '' },
  { userId: 'user-5', name: '' },
  { userId: 'user-6', name: '' },
  { userId: 'user-7', name: '' },
  { userId: 'user-8', name: '' },
  { userId: 'user-9', name: '' },
  { userId: 'user-10', name: '' },
];

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFreshNotifications(existingIds: Set<string>): Notification[] {
  const fresh: Notification[] = [];
  const allFundraisers = getAllFundraisers();
  const now = Date.now();
  const uid = now.toString(36); // unique suffix

  // Pick a random notification type to generate
  const roll = Math.random();

  if (roll < 0.35) {
    // New follower
    const candidate = pickRandom(FOLLOW_POOL);
    if (candidate) {
      const user = getUserById(candidate.userId);
      if (user) {
        fresh.push({
          id: `notif-follow-${uid}`,
          type: 'follow',
          title: 'New follower!',
          message: `${user.name} started following you`,
          avatar: user.avatar,
          link: `/profile/${candidate.userId}`,
          timestamp: new Date(now - Math.floor(Math.random() * 30) * 60 * 1000).toISOString(),
          read: false,
          userId: candidate.userId,
        });
      }
    }
  } else if (roll < 0.6) {
    // Recommendation
    const f = pickRandom(allFundraisers);
    if (f) {
      const id = `notif-rec-${uid}`;
      if (!existingIds.has(id)) {
        fresh.push({
          id,
          type: 'recommendation',
          title: 'Recommended for you',
          message: `"${f.title}" is trending in ${f.category}`,
          link: `/fundraiser/${f.id}`,
          timestamp: new Date(now - Math.floor(Math.random() * 60) * 60 * 1000).toISOString(),
          read: false,
          fundraiserId: f.id,
        });
      }
    }
  } else if (roll < 0.8) {
    // Donation activity
    const donationActs = activities.filter(a => a.type === 'donation');
    const act = pickRandom(donationActs);
    if (act) {
      const user = getUserById(act.userId);
      if (user) {
        const amount = act.metadata?.amount ? `$${act.metadata.amount.toLocaleString()}` : '';
        const title = act.metadata?.fundraiserTitle || 'a fundraiser';
        fresh.push({
          id: `notif-donation-${uid}`,
          type: 'donation',
          title: `${user.name} donated`,
          message: `${amount} to "${title}"`,
          avatar: user.avatar,
          link: `/fundraiser/${act.targetId}`,
          timestamp: new Date(now - Math.floor(Math.random() * 20) * 60 * 1000).toISOString(),
          read: false,
          userId: act.userId,
          fundraiserId: act.targetId,
        });
      }
    }
  } else {
    // Campaign update
    const updateActs = activities.filter(a => a.type === 'fundraiser_update');
    const act = pickRandom(updateActs);
    if (act) {
      const user = getUserById(act.userId);
      if (user) {
        fresh.push({
          id: `notif-update-${uid}`,
          type: 'update',
          title: `${user.name} posted an update`,
          message: `New update on "${act.metadata?.fundraiserTitle || 'a campaign'}"`,
          avatar: user.avatar,
          link: `/fundraiser/${act.targetId}`,
          timestamp: new Date(now - Math.floor(Math.random() * 45) * 60 * 1000).toISOString(),
          read: false,
          userId: act.userId,
          fundraiserId: act.targetId,
        });
      }
    }
  }

  return fresh;
}
