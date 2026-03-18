/**
 * Content Initialization
 *
 * Generates and registers bulk content (users, fundraisers, communities)
 * on first call. Idempotent — subsequent calls are no-ops.
 */

import { generateUsers } from '@/lib/userGenerator';
import { generateFundraisers, generateCommunities } from '@/lib/contentGenerator';
import { registerUsers, getUserCount } from '@/data/users';
import { registerFundraisers, getFundraiserCount } from '@/data/fundraisers';
import { registerCommunities, getCommunityCount } from '@/data/communities';

let initialized = false;

/**
 * Initialize bulk generated content.
 * Call this once on app load (e.g. from layout or discover page).
 * Safe to call multiple times — only runs once.
 */
export function initContent(): void {
  if (initialized) return;
  initialized = true;

  // Skip if content was already bulk-loaded (e.g. HMR, double-render)
  if (getUserCount() > 50) return;

  // ─── Step 1: Generate 300 users ────────────────────────────
  const newUsers = generateUsers(300, 12345);
  registerUsers(newUsers);

  const allUserIds = newUsers.map(u => u.id);
  // Include seed users too
  for (let i = 1; i <= 10; i++) {
    allUserIds.push(`user-${i}`);
  }

  // ─── Step 2: Generate 100 communities ──────────────────────
  // Generate communities first (with empty fundraiser lists)
  const newCommunities = generateCommunities(100, [], allUserIds, 54321);
  registerCommunities(newCommunities);

  const allCommunityIds = newCommunities.map(c => c.id);
  // Include seed communities
  for (let i = 1; i <= 6; i++) {
    allCommunityIds.push(`community-${i}`);
  }

  // ─── Step 3: Generate 1200 fundraisers ─────────────────────
  const newFundraisers = generateFundraisers(1200, allUserIds, allCommunityIds, 67890);
  registerFundraisers(newFundraisers);

  // ─── Step 4: Cross-link some fundraisers to communities ────
  // Update community fundraiserIds with some generated fundraisers
  for (const fundraiser of newFundraisers) {
    if (fundraiser.communityId) {
      // Find the matching community and add this fundraiser
      const community = newCommunities.find(c => c.id === fundraiser.communityId);
      if (community && !community.fundraiserIds.includes(fundraiser.id)) {
        community.fundraiserIds.push(fundraiser.id);
      }
    }
  }

  // ─── Step 5: Assign some fundraisers to generated users ────
  for (const fundraiser of newFundraisers) {
    const user = newUsers.find(u => u.id === fundraiser.organizerId);
    if (user && !user.fundraiserIds.includes(fundraiser.id)) {
      user.fundraiserIds.push(fundraiser.id);
    }
  }

  // ─── Step 6: Add some generated users to communities ───────
  for (const user of newUsers) {
    for (const cId of user.communityIds) {
      const community = newCommunities.find(c => c.id === cId);
      if (community && !community.memberIds.includes(user.id)) {
        community.memberIds.push(user.id);
      }
    }
  }

  console.log(
    `[contentInit] Generated ${newUsers.length} users, ` +
    `${newFundraisers.length} fundraisers, ` +
    `${newCommunities.length} communities. ` +
    `Totals: ${getUserCount()} users, ${getFundraiserCount()} fundraisers, ${getCommunityCount()} communities.`
  );
}

/**
 * Check if content has been initialized.
 */
export function isContentInitialized(): boolean {
  return initialized;
}
