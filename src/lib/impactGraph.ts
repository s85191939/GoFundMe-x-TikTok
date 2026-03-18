/**
 * Impact Graph — Collaborative filtering for donor-based fundraiser connections.
 *
 * Algorithm: For a given fundraiser, find all its donors, then find all OTHER
 * fundraisers those donors also contributed to. Rank by shared donor count.
 * This powers the "Impact Network" visualization on fundraiser pages.
 */

import type { Fundraiser, Community } from '@/data/types';
import { getDonationsForFundraiser, getDonationsByUser } from '@/data/donations';
import { getFundraiserById } from '@/data/fundraisers';
import { getCommunityById } from '@/data/communities';
import { CURRENT_USER_ID } from '@/lib/auth';

// ─── Types ──────────────────────────────────────────────────

export interface ImpactConnection {
  fundraiser: Fundraiser;
  sharedDonorCount: number;
  community?: Community;
  sharedDonorNames: string[];
}

export interface ImpactGraphData {
  currentFundraiser: Fundraiser;
  userSupported: boolean;
  connections: ImpactConnection[];
  totalSharedDonors: number;
}

// ─── Category Emoji Map ─────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
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

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] || '✨';
}

// ─── Core Algorithm ─────────────────────────────────────────

/**
 * Get impact connections for a fundraiser via collaborative filtering.
 * Returns null if the fundraiser doesn't exist.
 */
export function getImpactConnections(fundraiserId: string): ImpactGraphData | null {
  const currentFundraiser = getFundraiserById(fundraiserId);
  if (!currentFundraiser) return null;

  // Get all donations for this fundraiser
  const donations = getDonationsForFundraiser(fundraiserId);

  // Check if the current user donated here
  const userSupported = donations.some((d) => d.donorId === CURRENT_USER_ID);

  // Collect unique non-anonymous donor IDs
  const donorIds = new Set<string>();
  const donorNameMap = new Map<string, string>(); // donorId → donorName
  for (const d of donations) {
    if (d.donorId && !d.isAnonymous) {
      donorIds.add(d.donorId);
      donorNameMap.set(d.donorId, d.donorName);
    }
  }

  // For each donor, find all OTHER fundraisers they donated to
  // Build frequency map: fundraiserId → { count, donorNames }
  const connectionMap = new Map<string, { count: number; donorNames: string[] }>();

  const donorIdArray = Array.from(donorIds);
  for (const donorId of donorIdArray) {
    const otherDonations = getDonationsByUser(donorId);
    const seenFundraisers = new Set<string>(); // Prevent double-counting same donor→fundraiser

    for (const d of otherDonations) {
      if (d.fundraiserId === fundraiserId) continue; // Skip current fundraiser
      if (seenFundraisers.has(d.fundraiserId)) continue;
      seenFundraisers.add(d.fundraiserId);

      const existing = connectionMap.get(d.fundraiserId);
      const name = donorNameMap.get(donorId) || d.donorName;
      if (existing) {
        existing.count += 1;
        existing.donorNames.push(name);
      } else {
        connectionMap.set(d.fundraiserId, { count: 1, donorNames: [name] });
      }
    }
  }

  // Sort by shared donor count (descending), take top 5
  const sorted = Array.from(connectionMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  // Resolve fundraiser + community objects
  const connections: ImpactConnection[] = [];
  for (let idx = 0; idx < sorted.length; idx++) {
    const entry = sorted[idx];
    const fId = entry[0];
    const { count, donorNames } = entry[1];
    const fundraiser = getFundraiserById(fId);
    if (!fundraiser) continue;

    const community = fundraiser.communityId
      ? getCommunityById(fundraiser.communityId)
      : undefined;

    connections.push({
      fundraiser,
      sharedDonorCount: count,
      community,
      sharedDonorNames: donorNames,
    });
  }

  // Count unique donors who donated to at least one other fundraiser
  let totalSharedDonors = 0;
  for (const donorId of donorIdArray) {
    const otherDonations = getDonationsByUser(donorId);
    const hasOther = otherDonations.some((d) => d.fundraiserId !== fundraiserId);
    if (hasOther) totalSharedDonors += 1;
  }

  return {
    currentFundraiser,
    userSupported,
    connections,
    totalSharedDonors,
  };
}
