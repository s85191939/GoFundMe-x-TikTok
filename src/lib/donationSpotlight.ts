import { donations } from '@/data/donations';
import { getUserById } from '@/data/users';
import { getFundraiserById } from '@/data/fundraisers';
import { getCoordinates, type Coordinates } from './coordinates';
import type { Donation } from '@/data/types';

export interface SpotlightDonation {
  donation: Donation;
  donorId: string;
  donorName: string;
  donorLocation: string;
  donorVerified: boolean;
  coordinates: Coordinates;
  fundraiserTitle: string;
  fundraiserId: string;
  fundraiserStorySnippet: string;
}

// Pre-filter and build spotlight-eligible donations
const spotlightPool: SpotlightDonation[] = donations
  .filter((d) => !d.isAnonymous && d.donorId)
  .map((d) => {
    const user = getUserById(d.donorId!);
    if (!user) return null;
    const coords = getCoordinates(user.location);
    if (!coords) return null;
    const fundraiser = getFundraiserById(d.fundraiserId);
    if (!fundraiser) return null;
    return {
      donation: d,
      donorId: d.donorId!,
      donorName: d.donorName,
      donorLocation: user.location,
      donorVerified: user.isVerified,
      coordinates: coords,
      fundraiserTitle: fundraiser.title,
      fundraiserId: fundraiser.id,
      fundraiserStorySnippet: fundraiser.story.slice(0, 120) + '...',
    };
  })
  .filter(Boolean) as SpotlightDonation[];

export function getRandomSpotlight(excludeId?: string): SpotlightDonation {
  let pool = spotlightPool;
  if (excludeId) {
    pool = spotlightPool.filter((s) => s.donation.id !== excludeId);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getSpotlightCount(): number {
  return spotlightPool.length;
}
