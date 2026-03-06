/**
 * Abbreviate a number with K, M, B suffixes.
 * e.g. 38900 -> "38.9K", 1200000 -> "1.2M"
 */
export function abbreviateNumber(n: number): string {
  if (n >= 1_000_000_000) {
    const val = n / 1_000_000_000;
    return `${parseFloat(val.toFixed(1))}B`;
  }
  if (n >= 1_000_000) {
    const val = n / 1_000_000;
    return `${parseFloat(val.toFixed(1))}M`;
  }
  if (n >= 1_000) {
    const val = n / 1_000;
    return `${parseFloat(val.toFixed(1))}K`;
  }
  return n.toString();
}

/**
 * Format a number as currency string.
 * Small amounts: "$1,234"
 * Large amounts abbreviated: "$38.9K", "$1.2M"
 */
export function formatCurrency(amount: number): string {
  if (amount >= 10_000) {
    return `$${abbreviateNumber(amount)}`;
  }
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/**
 * Format a number with commas.
 * e.g. 1234 -> "1,234"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Format a date string as relative time.
 * e.g. "2 hours ago", "3 days ago", "1 month ago"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  if (diffWeeks < 5) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  }
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  }
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

/**
 * Format a date string as a human-readable date.
 * e.g. "February 14th, 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const suffix = getOrdinalSuffix(day);

  return `${month} ${day}${suffix}, ${year}`;
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
