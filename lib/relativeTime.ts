// lib/relativeTime.ts

/**
 * Normalize various date formats to a parseable format
 * @param dateString - Date string in various formats
 * @returns Normalized date string
 */
function normalizeDateString(dateString: string): string {
  // Remove extra spaces
  let normalized = dateString.trim();
  
  // Handle "2025 10/10/25" format -> convert to "2025-10-10"
  const weirdFormat = /^(\d{4})\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  const match = normalized.match(weirdFormat);
  if (match) {
    const [, year, month, day] = match;
    normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return normalized;
  }
  
  // Handle "10/10/2025" or "10/10/25" format -> convert to "2025-10-10"
  const slashFormat = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  const slashMatch = normalized.match(slashFormat);
  if (slashMatch) {
    let [, month, day, year] = slashMatch;
    // If year is 2 digits, assume 20xx
    if (year.length === 2) {
      year = '20' + year;
    }
    normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return normalized;
  }
  
  return normalized;
}

/**
 * Calculate relative time from a date string
 * @param dateString - ISO date string or any valid date format
 * @returns Relative time string like "1mo ago", "2w ago", etc.
 */
export function getRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '';

  try {
    // Normalize the date string first
    const normalized = normalizeDateString(dateString);
    const date = new Date(normalized);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date after parsing:', dateString, '-> normalized:', normalized);
      return '';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Handle future dates
    if (diffDays < 0) {
      return 'recently';
    }

    if (diffDays < 7) {
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return '1d ago';
      return `${diffDays}d ago`;
    } else if (diffWeeks < 4) {
      if (diffWeeks === 1) return '1w ago';
      return `${diffWeeks}w ago`;
    } else if (diffMonths < 12) {
      if (diffMonths === 1) return '1mo ago';
      return `${diffMonths}mo ago`;
    } else {
      if (diffYears === 1) return '1y ago';
      return `${diffYears}y ago`;
    }
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return '';
  }
}

