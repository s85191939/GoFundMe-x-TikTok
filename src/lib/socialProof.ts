/**
 * Social Proof Utilities — "People like you donated" scoring and data
 *
 * Scores donors against the current user on location, vibe (bio keywords),
 * and community overlap to surface the most relatable social proof.
 */

import type { Donation, User } from '@/data/types';
import { getDonationsForFundraiser, donations as allDonations } from '@/data/donations';
import { getUserById } from '@/data/users';
import { getCommunityById } from '@/data/communities';
import { CURRENT_USER_ID } from '@/lib/auth';
import { extractState, getRegion, getVibes, vibeOverlap } from '@/lib/social';

// ─── Types ───────────────────────────────────────────────────

export interface SimilarDonor {
  donor: User;
  donation: Donation;
  similarityScore: number;
  similarityReason: string;
  similarityCategory: 'location' | 'vibe' | 'community' | 'region';
}

export interface CommunityDonationStats {
  regionName: string;
  regionDonorCount: number;
  regionTotalAmount: number;
  communityName?: string;
  communityDonorCount?: number;
  communityTotalAmount?: number;
  recentSimilarDonations: SimilarDonor[];
}

export interface PeerDonationNudge {
  peerMedianDonation: number;
  suggestedAmount: number;
  similarDonorAvatars: Array<{ avatar: string; name: string }>;
  similarDonorCount: number;
  nudgeMessage: string;
}

// ─── Vibe label mapping ──────────────────────────────────────

const VIBE_LABELS: Record<string, string> = {
  environmentalist: 'environmental advocate',
  animal_lover: 'animal lover',
  educator: 'education supporter',
  community_builder: 'community builder',
  humanitarian: 'humanitarian',
  health_advocate: 'health advocate',
  veteran_supporter: 'veteran supporter',
  philanthropist: 'philanthropist',
  arts_culture: 'arts & culture fan',
  sports_fitness: 'sports enthusiast',
};

// ─── Core scoring ────────────────────────────────────────────

function scoreDonor(
  currentUser: User,
  donor: User
): { score: number; reason: string; category: SimilarDonor['similarityCategory'] } {
  const currentState = extractState(currentUser.location);
  const donorState = extractState(donor.location);
  const currentRegion = getRegion(currentState);
  const donorRegion = getRegion(donorState);

  let locationPts = 0;
  if (currentState && donorState && currentState === donorState) {
    locationPts = 40;
  } else if (currentRegion && donorRegion && currentRegion === donorRegion) {
    locationPts = 25;
  } else if (currentState && donorState) {
    locationPts = 5;
  }

  const currentVibes = getVibes(currentUser.bio || '');
  const donorVibes = getVibes(donor.bio || '');
  const vibePts = Math.round(vibeOverlap(currentVibes, donorVibes) * 0.3);

  const sharedCommunities = (currentUser.communityIds || []).filter(c =>
    (donor.communityIds || []).includes(c)
  );
  const communityPts = Math.min(sharedCommunities.length * 15, 30);

  const total = locationPts + vibePts + communityPts;

  // Pick the best reason
  if (locationPts >= 40) {
    const stateNames: Record<string, string> = {
      CA: 'California', TX: 'Texas', OR: 'Oregon', IL: 'Illinois',
      CO: 'Colorado', WA: 'Washington', TN: 'Tennessee', NY: 'New York',
      FL: 'Florida', AZ: 'Arizona', NV: 'Nevada',
    };
    const stateName = stateNames[currentState] || currentState;
    return { score: total, reason: `Near you in ${stateName}`, category: 'location' };
  }
  if (communityPts >= 15 && sharedCommunities.length > 0) {
    const comm = getCommunityById(sharedCommunities[0]);
    const commName = comm?.name || 'your community';
    return { score: total, reason: `Member of ${commName}`, category: 'community' };
  }
  if (vibePts >= 10) {
    const sharedVibes = currentVibes.filter(v => donorVibes.includes(v));
    const label = VIBE_LABELS[sharedVibes[0]] || sharedVibes[0] || 'supporter';
    return { score: total, reason: `Fellow ${label}`, category: 'vibe' };
  }
  if (locationPts >= 25) {
    return { score: total, reason: 'In your region', category: 'region' };
  }

  return { score: total, reason: 'Supporter', category: 'vibe' };
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Get donors similar to the current user for a specific fundraiser.
 */
export function getSimilarDonors(fundraiserId: string, limit = 4): SimilarDonor[] {
  const currentUser = getUserById(CURRENT_USER_ID);
  if (!currentUser) return [];

  const fundraiserDonations = getDonationsForFundraiser(fundraiserId);

  const scored: SimilarDonor[] = [];
  for (const donation of fundraiserDonations) {
    if (donation.isAnonymous || !donation.donorId || donation.donorId === CURRENT_USER_ID) continue;
    const donor = getUserById(donation.donorId);
    if (!donor) continue;

    const { score, reason, category } = scoreDonor(currentUser, donor);
    if (score > 0) {
      scored.push({ donor, donation, similarityScore: score, similarityReason: reason, similarityCategory: category });
    }
  }

  return scored.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, limit);
}

/**
 * Get community/regional donation statistics for a fundraiser.
 */
export function getCommunityDonationStats(fundraiserId: string): CommunityDonationStats | null {
  const currentUser = getUserById(CURRENT_USER_ID);
  if (!currentUser) return null;

  const currentState = extractState(currentUser.location);
  const currentRegion = getRegion(currentState);
  const fundraiserDonations = getDonationsForFundraiser(fundraiserId);

  let regionDonorCount = 0;
  let regionTotalAmount = 0;
  const stateNames: Record<string, string> = {
    CA: 'California', TX: 'Texas', OR: 'Oregon', IL: 'Illinois',
    CO: 'Colorado', WA: 'Washington', TN: 'Tennessee', NY: 'New York',
    FL: 'Florida', AZ: 'Arizona', NV: 'Nevada',
  };

  for (const donation of fundraiserDonations) {
    if (donation.isAnonymous || !donation.donorId) continue;
    const donor = getUserById(donation.donorId);
    if (!donor) continue;
    const donorState = extractState(donor.location);
    const donorRegion = getRegion(donorState);

    if ((currentState && donorState === currentState) || (currentRegion && donorRegion === currentRegion)) {
      regionDonorCount++;
      regionTotalAmount += donation.amount;
    }
  }

  if (regionDonorCount === 0) return null;

  const regionName = stateNames[currentState] || currentRegion || 'your area';
  const similarDonors = getSimilarDonors(fundraiserId, 3);

  // Check community overlap
  let communityName: string | undefined;
  let communityDonorCount: number | undefined;
  let communityTotalAmount: number | undefined;

  const currentCommunities = currentUser.communityIds || [];
  if (currentCommunities.length > 0) {
    let bestCommName = '';
    let bestCommCount = 0;
    let bestCommTotal = 0;

    for (const commId of currentCommunities) {
      let count = 0;
      let total = 0;
      for (const donation of fundraiserDonations) {
        if (donation.isAnonymous || !donation.donorId) continue;
        const donor = getUserById(donation.donorId);
        if (donor?.communityIds?.includes(commId)) {
          count++;
          total += donation.amount;
        }
      }
      if (count > bestCommCount) {
        const comm = getCommunityById(commId);
        bestCommName = comm?.name || '';
        bestCommCount = count;
        bestCommTotal = total;
      }
    }
    if (bestCommCount > 0) {
      communityName = bestCommName;
      communityDonorCount = bestCommCount;
      communityTotalAmount = bestCommTotal;
    }
  }

  return {
    regionName,
    regionDonorCount,
    regionTotalAmount,
    communityName,
    communityDonorCount,
    communityTotalAmount,
    recentSimilarDonations: similarDonors,
  };
}

/**
 * Get peer donation nudge data for the donate modal.
 */
export function getPeerDonationNudge(fundraiserId: string): PeerDonationNudge | null {
  const currentUser = getUserById(CURRENT_USER_ID);
  if (!currentUser) return null;

  // Gather donations from similar users across all fundraisers
  const currentState = extractState(currentUser.location);
  const currentRegion = getRegion(currentState);
  const currentVibes = getVibes(currentUser.bio || '');
  const currentCommunities = currentUser.communityIds || [];

  const peerAmounts: number[] = [];
  const peerAvatars: Array<{ avatar: string; name: string }> = [];
  const seenDonors = new Set<string>();

  for (const donation of allDonations) {
    if (donation.isAnonymous || !donation.donorId || donation.donorId === CURRENT_USER_ID) continue;
    const donor = getUserById(donation.donorId);
    if (!donor) continue;

    const donorState = extractState(donor.location);
    const donorRegion = getRegion(donorState);
    const donorVibes = getVibes(donor.bio || '');
    const sharedComms = currentCommunities.filter(c => (donor.communityIds || []).includes(c));

    const isSimilar =
      (currentState && donorState === currentState) ||
      (currentRegion && donorRegion === currentRegion) ||
      vibeOverlap(currentVibes, donorVibes) > 20 ||
      sharedComms.length > 0;

    if (isSimilar) {
      peerAmounts.push(donation.amount);
      if (!seenDonors.has(donation.donorId)) {
        seenDonors.add(donation.donorId);
        if (peerAvatars.length < 3) {
          peerAvatars.push({ avatar: donor.avatar, name: donor.name });
        }
      }
    }
  }

  if (peerAmounts.length < 2) return null;

  peerAmounts.sort((a, b) => a - b);
  const median = peerAmounts[Math.floor(peerAmounts.length / 2)];
  const suggested = Math.round(median / 5) * 5; // round to nearest $5

  return {
    peerMedianDonation: median,
    suggestedAmount: Math.max(suggested, 10),
    similarDonorAvatars: peerAvatars,
    similarDonorCount: seenDonors.size,
    nudgeMessage: `People like you typically donate $${Math.max(suggested, 10).toLocaleString()}`,
  };
}

/**
 * Find a donation from a similar user for personalized toast messages.
 */
export function getPersonalizedToastDonation(
  fundraiserDonations: Donation[]
): { donation: Donation; personalizedMessage: string } | null {
  const currentUser = getUserById(CURRENT_USER_ID);
  if (!currentUser) return null;

  const currentState = extractState(currentUser.location);
  const currentVibes = getVibes(currentUser.bio || '');
  const stateNames: Record<string, string> = {
    CA: 'California', TX: 'Texas', OR: 'Oregon', IL: 'Illinois',
    CO: 'Colorado', WA: 'Washington', TN: 'Tennessee', NY: 'New York',
    FL: 'Florida', AZ: 'Arizona', NV: 'Nevada',
  };

  // Shuffle donations for variety
  const shuffled = [...fundraiserDonations].sort(() => Math.random() - 0.5);

  for (const donation of shuffled) {
    if (donation.isAnonymous || !donation.donorId || donation.donorId === CURRENT_USER_ID) continue;
    const donor = getUserById(donation.donorId);
    if (!donor) continue;

    const donorState = extractState(donor.location);
    const donorVibes = getVibes(donor.bio || '');

    // Location match
    if (currentState && donorState === currentState) {
      const stateName = stateNames[currentState] || currentState;
      return {
        donation,
        personalizedMessage: `Someone near you in ${stateName} donated $${donation.amount.toLocaleString()}`,
      };
    }

    // Vibe match
    const sharedVibes = currentVibes.filter(v => donorVibes.includes(v));
    if (sharedVibes.length > 0) {
      const label = VIBE_LABELS[sharedVibes[0]] || sharedVibes[0];
      return {
        donation,
        personalizedMessage: `A fellow ${label} donated $${donation.amount.toLocaleString()}`,
      };
    }
  }

  return null;
}
