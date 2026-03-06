/**
 * User preferences store — persisted in localStorage.
 *
 * Tracks selected interest categories and onboarding status.
 */

import type { FundraiserCategory } from '@/data/types';

export interface UserPreferences {
  interests: FundraiserCategory[];
  hasCompletedOnboarding: boolean;
  updatedAt: number;
}

const STORAGE_KEY = 'gfm_user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  interests: [],
  hasCompletedOnboarding: false,
  updatedAt: Date.now(),
};

/**
 * Get the user's saved preferences from localStorage.
 */
export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return JSON.parse(raw) as UserPreferences;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save preferences to localStorage.
 */
export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences();
  const updated: UserPreferences = {
    ...current,
    ...prefs,
    updatedAt: Date.now(),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

/**
 * Toggle a category interest on/off.
 */
export function toggleInterest(category: FundraiserCategory): UserPreferences {
  const current = getPreferences();
  const idx = current.interests.indexOf(category);
  const interests = [...current.interests];
  if (idx >= 0) {
    interests.splice(idx, 1);
  } else {
    interests.push(category);
  }
  return savePreferences({ interests });
}

/**
 * Mark onboarding as completed.
 */
export function completeOnboarding(interests: FundraiserCategory[]): UserPreferences {
  return savePreferences({ interests, hasCompletedOnboarding: true });
}

/**
 * All available categories with metadata.
 */
export const CATEGORY_OPTIONS: { id: FundraiserCategory; label: string; emoji: string; description: string }[] = [
  { id: 'emergency', label: 'Emergency', emoji: '🚨', description: 'Crisis relief & urgent aid' },
  { id: 'medical', label: 'Medical', emoji: '🏥', description: 'Healthcare & medical costs' },
  { id: 'education', label: 'Education', emoji: '📚', description: 'Scholarships & school funding' },
  { id: 'nonprofit', label: 'Nonprofit', emoji: '💛', description: 'Charitable organizations' },
  { id: 'community', label: 'Community', emoji: '🏘️', description: 'Neighborhoods & local projects' },
  { id: 'animals', label: 'Animals', emoji: '🐾', description: 'Animal welfare & rescue' },
  { id: 'environment', label: 'Environment', emoji: '🌿', description: 'Conservation & sustainability' },
  { id: 'memorial', label: 'Memorial', emoji: '🕊️', description: 'Remembrance & tributes' },
  { id: 'sports', label: 'Sports', emoji: '⚽', description: 'Athletics & recreation' },
  { id: 'other', label: 'Other', emoji: '✨', description: 'Creative & unique causes' },
];
