/**
 * Merge class names, filtering out falsy values.
 * e.g. cn('base', isActive && 'active', undefined) -> "base active"
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calculate the percentage of raised vs goal, capped at 100.
 */
export function getPercentage(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  const pct = (raised / goal) * 100;
  return Math.min(pct, 100);
}

/**
 * Get initials from a full name.
 * e.g. "John Vivekanandan" -> "JV", "Alice" -> "A"
 */
export function getInitials(name: string): string {
  if (!name.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
