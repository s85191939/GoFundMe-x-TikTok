/**
 * Mock authentication — simulates a currently logged-in user.
 *
 * In a real app this would use NextAuth, Clerk, or a session cookie.
 * Here we just hardcode user-1 (Marissa Chen) as the logged-in user.
 */

import { getUserById } from '@/data/users';
import type { User } from '@/data/types';

/** The ID of the currently "logged-in" user. */
export const CURRENT_USER_ID = 'user-1';

/** Get the currently logged-in user. */
export function getCurrentUser(): User | undefined {
  return getUserById(CURRENT_USER_ID);
}

/** Check if a given user ID is the currently logged-in user. */
export function isCurrentUser(userId: string): boolean {
  return userId === CURRENT_USER_ID;
}
