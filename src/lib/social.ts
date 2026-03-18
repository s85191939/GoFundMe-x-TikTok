/**
 * Social Graph — Follow/unfollow state management + people recommendations
 *
 * Persisted in localStorage. In production this would be a database.
 *
 * Recommendation algorithm for "Suggested for you":
 * 1. Category alignment — users active in categories you care about
 * 2. Location proximity — users in nearby cities/states
 * 3. Similar vibes — tag overlap, bio keyword matching, cause alignment
 * 4. Community overlap — users in the same communities
 * 5. Donation patterns — users who donate to similar campaigns
 * 6. Friends-of-friends — users followed by people you follow
 * 7. Activity level — highly active users get boosted
 * 8. Verification status — verified users are more trustworthy
 */

import type { User, FundraiserCategory } from '@/data/types';
import { getAllUsers, getUserById } from '@/data/users';
import { donations } from '@/data/donations';
import { activities } from '@/data/activity';
import { getAllFundraisers } from '@/data/fundraisers';
import { CURRENT_USER_ID } from '@/lib/auth';
import { getPreferences } from '@/lib/preferences';

// ─── Storage ─────────────────────────────────────────────────

const FOLLOWING_KEY = 'gfm_following';
const FOLLOWERS_KEY = 'gfm_followers';
const DISMISSED_KEY = 'gfm_dismissed_suggestions';

/**
 * Get the list of user IDs the current user follows.
 */
export function getFollowing(): string[] {
  if (typeof window === 'undefined') return getDefaultFollowing();
  try {
    const raw = localStorage.getItem(FOLLOWING_KEY);
    if (!raw) {
      // Initialize with default following
      const defaults = getDefaultFollowing();
      localStorage.setItem(FOLLOWING_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw) as string[];
  } catch {
    return getDefaultFollowing();
  }
}

/**
 * Default following — seed the social graph so the feed isn't empty.
 * Current user (user-1) follows user-2, user-3, user-5 by default.
 */
function getDefaultFollowing(): string[] {
  return ['user-2', 'user-3', 'user-5'];
}

/**
 * Follow a user.
 */
export function followUser(userId: string): string[] {
  const current = getFollowing();
  if (current.includes(userId) || userId === CURRENT_USER_ID) return current;
  const updated = [...current, userId];
  if (typeof window !== 'undefined') {
    localStorage.setItem(FOLLOWING_KEY, JSON.stringify(updated));
  }
  // Also add current user to that user's followers (mock)
  addFollower(userId, CURRENT_USER_ID);
  return updated;
}

/**
 * Unfollow a user.
 */
export function unfollowUser(userId: string): string[] {
  const current = getFollowing();
  const updated = current.filter(id => id !== userId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(FOLLOWING_KEY, JSON.stringify(updated));
  }
  removeFollower(userId, CURRENT_USER_ID);
  return updated;
}

/**
 * Check if current user follows a given user.
 */
export function isFollowing(userId: string): boolean {
  return getFollowing().includes(userId);
}

/**
 * Toggle follow state.
 */
export function toggleFollow(userId: string): { following: boolean; list: string[] } {
  if (isFollowing(userId)) {
    return { following: false, list: unfollowUser(userId) };
  }
  return { following: true, list: followUser(userId) };
}

/**
 * Dismiss a user suggestion (won't be shown again).
 */
export function dismissSuggestion(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(DISMISSED_KEY) || '[]';
    const dismissed = JSON.parse(raw) as string[];
    if (!dismissed.includes(userId)) {
      dismissed.push(userId);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    }
  } catch { /* ignore */ }
}

function getDismissedSuggestions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DISMISSED_KEY) || '[]';
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

// ─── Followers (mock) ────────────────────────────────────────

function addFollower(userId: string, followerId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FOLLOWERS_KEY) || '{}';
    const map = JSON.parse(raw) as Record<string, string[]>;
    if (!map[userId]) map[userId] = [];
    if (!map[userId].includes(followerId)) map[userId].push(followerId);
    localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

function removeFollower(userId: string, followerId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FOLLOWERS_KEY) || '{}';
    const map = JSON.parse(raw) as Record<string, string[]>;
    if (map[userId]) {
      map[userId] = map[userId].filter(id => id !== followerId);
      localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(map));
    }
  } catch { /* ignore */ }
}

// ─── Location Similarity ─────────────────────────────────────

/** State extraction from "City, ST" format */
export function extractState(location: string): string {
  const parts = location.split(',').map(s => s.trim());
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
}

/** Region mapping for "nearby" detection */
export const REGION_MAP: Record<string, string[]> = {
  'WEST_COAST': ['CA', 'OR', 'WA'],
  'SOUTHWEST': ['AZ', 'NM', 'NV', 'UT'],
  'MOUNTAIN': ['CO', 'MT', 'WY', 'ID'],
  'MIDWEST': ['IL', 'IN', 'OH', 'MI', 'WI', 'MN', 'IA', 'MO'],
  'SOUTH': ['TX', 'LA', 'MS', 'AL', 'GA', 'FL', 'SC', 'NC'],
  'NORTHEAST': ['NY', 'NJ', 'PA', 'MA', 'CT', 'ME', 'VT', 'NH', 'RI'],
  'MID_ATLANTIC': ['VA', 'MD', 'DE', 'DC', 'WV'],
  'PACIFIC_NW': ['WA', 'OR'],
  'SOUTHEAST': ['TN', 'KY', 'AR', 'OK'],
};

export function getRegion(state: string): string | undefined {
  for (const [region, states] of Object.entries(REGION_MAP)) {
    if (states.includes(state)) return region;
  }
  return undefined;
}

function locationScore(userLocation: string, targetLocation: string): number {
  const userState = extractState(userLocation);
  const targetState = extractState(targetLocation);

  // Same city → highest score
  if (userLocation.toLowerCase() === targetLocation.toLowerCase()) return 100;
  // Same state → high score
  if (userState && targetState && userState === targetState) return 70;
  // Same region → moderate score
  const userRegion = getRegion(userState);
  const targetRegion = getRegion(targetState);
  if (userRegion && targetRegion && userRegion === targetRegion) return 40;
  // Both in US → small score
  if (userState && targetState) return 10;
  return 0;
}

// ─── Vibe / Tag Similarity ───────────────────────────────────

/** Keywords extracted from bios for "vibe" matching */
export const VIBE_CLUSTERS: Record<string, string[]> = {
  'environmentalist': ['environment', 'wildfire', 'conservation', 'sustainability', 'climate', 'green', 'nature', 'water', 'clean'],
  'animal_lover': ['animal', 'rescue', 'shelter', 'dogs', 'cats', 'pets', 'veterinary', 'welfare', 'paws'],
  'educator': ['teacher', 'education', 'school', 'tutoring', 'scholarship', 'students', 'learning', 'kids', 'youth'],
  'community_builder': ['community', 'neighbor', 'neighborhood', 'local', 'volunteer', 'garden', 'food bank'],
  'humanitarian': ['disaster', 'relief', 'crisis', 'emergency', 'rebuild', 'displaced', 'humanitarian'],
  'health_advocate': ['medical', 'health', 'hospital', 'nurse', 'cancer', 'treatment', 'healthcare', 'mental health'],
  'veteran_supporter': ['veteran', 'military', 'service', 'firefighter', 'police', 'first responder'],
  'philanthropist': ['donate', 'giving', 'philanthrop', 'charity', 'generous', 'support', 'help'],
  'arts_culture': ['art', 'music', 'creative', 'theater', 'culture', 'painting', 'dance'],
  'sports_fitness': ['sports', 'soccer', 'basketball', 'athletic', 'fitness', 'team', 'coach', 'league'],
};

export function getVibes(text: string): string[] {
  const lower = text.toLowerCase();
  const vibes: string[] = [];
  for (const [vibe, keywords] of Object.entries(VIBE_CLUSTERS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      vibes.push(vibe);
    }
  }
  return vibes;
}

export function vibeOverlap(vibesA: string[], vibesB: string[]): number {
  const shared = vibesA.filter(v => vibesB.includes(v));
  if (vibesA.length === 0 || vibesB.length === 0) return 0;
  return (shared.length / Math.max(vibesA.length, vibesB.length)) * 100;
}

// ─── People Recommendations ─────────────────────────────────

export interface UserRecommendation {
  user: User;
  score: number;
  reason: string;
  secondaryReason?: string;
  mutualConnections: number;
  sharedInterests: string[];
  matchDimensions: {
    category: number;
    location: number;
    vibe: number;
    community: number;
    donationPattern: number;
    friendsOfFriends: number;
    activity: number;
  };
}

/**
 * Get recommended people to follow.
 *
 * Multi-dimensional scoring:
 * 1. Category alignment (0–25)
 * 2. Location proximity (0–20)
 * 3. Vibe similarity (0–20)
 * 4. Community overlap (0–15)
 * 5. Donation pattern similarity (0–10)
 * 6. Friends-of-friends (0–15)
 * 7. Activity & trust signals (0–10)
 */
export function getRecommendedPeople(limit = 10): UserRecommendation[] {
  const following = getFollowing();
  const dismissed = getDismissedSuggestions();
  const prefs = getPreferences();
  const currentUser = getUserById(CURRENT_USER_ID);
  const currentUserCommunities = currentUser?.communityIds || [];
  const currentUserLocation = currentUser?.location || '';
  const allFundraisers = getAllFundraisers();

  // Get categories the current user cares about
  const myCategories = new Set(prefs.interests);

  // Get vibes from current user bio
  const myVibes = getVibes(currentUser?.bio || '');

  // Get tags from fundraisers user organized
  const myFundraisers = allFundraisers.filter(f => f.organizerId === CURRENT_USER_ID);
  const myTags = new Set(myFundraisers.flatMap(f => f.tags));

  // Candidates: everyone not already followed, not dismissed, not self
  const candidates = getAllUsers().filter(u =>
    u.id !== CURRENT_USER_ID &&
    !following.includes(u.id) &&
    !dismissed.includes(u.id)
  );

  const scored: UserRecommendation[] = candidates.map(user => {
    const dimensions = {
      category: 0,
      location: 0,
      vibe: 0,
      community: 0,
      donationPattern: 0,
      friendsOfFriends: 0,
      activity: 0,
    };

    const reasons: string[] = [];
    let mutualConnections = 0;
    const sharedInterests: string[] = [];

    // ──── 1. Category Alignment (0–25) ────
    const userFundraisers = allFundraisers.filter(f => f.organizerId === user.id);
    const userCategories = new Set(userFundraisers.map(f => f.category));
    const userDonations = donations.filter(d => d.donorId === user.id);
    const donatedCategoryList = userDonations
      .map(d => allFundraisers.find(f => f.id === d.fundraiserId)?.category)
      .filter((c): c is FundraiserCategory => c !== undefined);

    // Merge organized + donated categories
    const allUserCategoryList = Array.from(userCategories).concat(donatedCategoryList);
    const allUserCategories = new Set(allUserCategoryList);

    for (const cat of Array.from(allUserCategories)) {
      if (cat && myCategories.has(cat as FundraiserCategory)) {
        sharedInterests.push(cat);
        dimensions.category += 8;
      }
    }
    dimensions.category = Math.min(dimensions.category, 25);

    if (sharedInterests.length > 0) {
      const emoji: Record<string, string> = {
        emergency: '🚨', medical: '🏥', education: '📚', nonprofit: '💛',
        community: '🏘️', animals: '🐾', environment: '🌿', memorial: '🕊️',
        sports: '⚽', other: '✨',
      };
      const topCat = sharedInterests[0];
      reasons.push(`${emoji[topCat] || '💛'} Supports ${topCat}`);
    }

    // ──── 2. Location Proximity (0–20) ────
    if (currentUserLocation && user.location) {
      const locScore = locationScore(currentUserLocation, user.location);
      dimensions.location = Math.round(locScore * 0.20);
      if (locScore >= 70) {
        const state = extractState(user.location);
        reasons.push(`📍 Near you in ${state}`);
      } else if (locScore >= 40) {
        reasons.push(`📍 In your region`);
      }
    }

    // ──── 3. Vibe Similarity (0–20) ────
    const userVibes = getVibes(user.bio);
    const overlap = vibeOverlap(myVibes, userVibes);
    dimensions.vibe = Math.round(overlap * 0.20);

    // Also check tag overlap from fundraisers
    const userTags = new Set(userFundraisers.flatMap(f => f.tags));
    let tagOverlap = 0;
    for (const tag of Array.from(userTags)) {
      if (myTags.has(tag)) tagOverlap++;
    }
    dimensions.vibe = Math.min(dimensions.vibe + Math.min(tagOverlap * 2, 8), 20);

    if (overlap >= 50 && reasons.length < 2) {
      const sharedVibe = myVibes.find(v => userVibes.includes(v));
      if (sharedVibe) {
        const vibeLabels: Record<string, string> = {
          'environmentalist': '🌿 Environmental advocate',
          'animal_lover': '🐾 Animal lover',
          'educator': '📚 Education champion',
          'community_builder': '🏘️ Community builder',
          'humanitarian': '🚨 Humanitarian',
          'health_advocate': '🏥 Health advocate',
          'veteran_supporter': '🎖️ Veterans supporter',
          'philanthropist': '💛 Active philanthropist',
          'arts_culture': '🎨 Arts & culture',
          'sports_fitness': '⚽ Sports enthusiast',
        };
        reasons.push(vibeLabels[sharedVibe] || 'Similar interests');
      }
    }

    // ──── 4. Community Overlap (0–15) ────
    const commonCommunities = user.communityIds.filter(c =>
      currentUserCommunities.includes(c)
    );
    dimensions.community = Math.min(commonCommunities.length * 8, 15);
    if (commonCommunities.length > 0 && reasons.length < 2) {
      reasons.push(`👥 In ${commonCommunities.length} of your communities`);
    }

    // ──── 5. Donation Pattern Similarity (0–10) ────
    // Check if they donate to similar campaigns as you
    const myDonations = donations.filter(d => d.donorId === CURRENT_USER_ID);
    const myDonatedFundraisers = new Set(myDonations.map(d => d.fundraiserId));
    const userDonatedFundraisers = new Set(userDonations.map(d => d.fundraiserId));

    let donationOverlap = 0;
    for (const fId of Array.from(userDonatedFundraisers)) {
      if (myDonatedFundraisers.has(fId)) donationOverlap++;
    }
    dimensions.donationPattern = Math.min(donationOverlap * 5, 10);

    if (donationOverlap > 0 && reasons.length < 2) {
      reasons.push(`💰 Supports same campaigns`);
    }

    // ──── 6. Friends-of-Friends (0–15) ────
    const followedUsers = following.map(id => getUserById(id)).filter(Boolean) as User[];
    for (const fu of followedUsers) {
      const sharedComms = user.communityIds.filter(c => fu.communityIds.includes(c));
      if (sharedComms.length > 0) {
        mutualConnections++;
      }
    }
    dimensions.friendsOfFriends = Math.min(mutualConnections * 5, 15);

    if (mutualConnections > 0 && reasons.length < 2) {
      reasons.push(`🤝 ${mutualConnections} mutual connection${mutualConnections > 1 ? 's' : ''}`);
    }

    // ──── 7. Activity & Trust Signals (0–10) ────
    const userActivities = activities.filter(a => a.userId === user.id);
    dimensions.activity = Math.min(userActivities.length * 1.5, 5);
    if (user.isVerified) dimensions.activity += 3;
    if (user.followerCount > 200) dimensions.activity += 1;
    if (user.followerCount > 500) dimensions.activity += 1;
    dimensions.activity = Math.min(dimensions.activity, 10);

    // ──── Total Score ────
    const totalScore =
      dimensions.category +
      dimensions.location +
      dimensions.vibe +
      dimensions.community +
      dimensions.donationPattern +
      dimensions.friendsOfFriends +
      dimensions.activity;

    // Build primary + secondary reasons
    const primaryReason = reasons[0] || (
      user.isVerified ? '✓ Verified organizer' :
      user.followerCount > 100 ? `${user.followerCount} followers` :
      'Active in giving'
    );
    const secondaryReason = reasons[1] || undefined;

    return {
      user,
      score: totalScore,
      reason: primaryReason,
      secondaryReason,
      mutualConnections,
      sharedInterests: Array.from(new Set(sharedInterests)),
      matchDimensions: dimensions,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get mutual connections between current user and target user.
 */
export function getMutualFollowers(targetUserId: string): User[] {
  const following = getFollowing();
  const targetUser = getUserById(targetUserId);
  if (!targetUser) return [];

  const currentCommunities = getUserById(CURRENT_USER_ID)?.communityIds || [];
  const targetCommunities = targetUser.communityIds;
  const sharedCommunities = currentCommunities.filter(c => targetCommunities.includes(c));

  if (sharedCommunities.length === 0) return [];

  return following
    .map(id => getUserById(id))
    .filter((u): u is User =>
      u !== undefined &&
      u.communityIds.some(c => sharedCommunities.includes(c))
    )
    .slice(0, 3);
}

/**
 * Get follow counts for display
 */
export function getFollowCounts(): { following: number; followers: number } {
  const following = getFollowing();
  // Mock follower count based on the current user data + any new followers from social actions
  const currentUser = getUserById(CURRENT_USER_ID);
  const baseFollowers = currentUser?.followerCount || 0;
  return {
    following: following.length,
    followers: baseFollowers,
  };
}

/**
 * Follow multiple users at once (bulk follow).
 * Returns the updated following list.
 */
export function followMultipleUsers(userIds: string[]): string[] {
  let current = getFollowing();
  for (const userId of userIds) {
    if (!current.includes(userId) && userId !== CURRENT_USER_ID) {
      current = [...current, userId];
      addFollower(userId, CURRENT_USER_ID);
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(FOLLOWING_KEY, JSON.stringify(current));
  }
  return current;
}
