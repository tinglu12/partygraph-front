/**
 * Utility functions for converting day-of-week date strings to actual calendar dates
 * Specifically for NY Tech Week 2025 (June 2-8, 2025)
 */

/**
 * NY Tech Week 2025 date mapping
 * Based on June 2-8, 2025:
 * Monday = June 2, 2025
 * Tuesday = June 3, 2025  
 * Wednesday = June 4, 2025
 * Thursday = June 5, 2025
 * Friday = June 6, 2025
 * Saturday = June 7, 2025
 * Sunday = June 8, 2025
 */
const NY_TECH_WEEK_2025_DATES: Record<string, string> = {
  'MONDAY': '2025-06-02',
  'TUESDAY': '2025-06-03', 
  'WEDNESDAY': '2025-06-04',
  'THURSDAY': '2025-06-05',
  'FRIDAY': '2025-06-06',
  'SATURDAY': '2025-06-07',
  'SUNDAY': '2025-06-08'
};

/**
 * Convert a day-of-week string like "THURSDAY 3:00 PM" to an ISO date string
 * @param dayTimeString - String like "THURSDAY 3:00 PM"
 * @returns ISO date string like "2025-06-05T15:00:00Z" or null if invalid
 */
export function convertDayOfWeekToDate(dayTimeString: string): string | null {
  if (!dayTimeString || typeof dayTimeString !== 'string') {
    return null;
  }

  try {
    // Extract day of week (first word)
    const parts = dayTimeString.trim().split(' ');
    if (parts.length < 1) return null;
    
    const dayOfWeek = parts[0].toUpperCase();
    const datePart = NY_TECH_WEEK_2025_DATES[dayOfWeek];
    
    if (!datePart) {
      console.warn(`Unknown day of week: ${dayOfWeek} in "${dayTimeString}"`);
      return null;
    }
    
    // Extract time if available
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const timeMatch = dayTimeString.match(timeRegex);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${datePart}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00Z`;
    } else {
      // No time specified, default to 12:00 PM
      return `${datePart}T12:00:00Z`;
    }
  } catch (error) {
    console.error(`Error converting day string "${dayTimeString}":`, error);
    return null;
  }
}

/**
 * Check if a date string is in day-of-week format
 * @param dateString - String to check
 * @returns boolean indicating if it's day-of-week format
 */
export function isDayOfWeekFormat(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  
  const dayOfWeekPattern = /^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s/i;
  return dayOfWeekPattern.test(dateString.trim());
}

/**
 * Convert multiple day-of-week strings to ISO dates
 * @param dayStrings - Array of day-of-week strings
 * @returns Array of ISO date strings (null values filtered out)
 */
export function convertMultipleDaysToDate(dayStrings: string[]): string[] {
  return dayStrings
    .map(convertDayOfWeekToDate)
    .filter((date): date is string => date !== null);
} 