import { EventNode } from "@/types/EventGraph";

/**
 * Sample events with flexible date patterns to demonstrate the new dates array functionality
 * These events show how the system can handle:
 * - Multi-day consecutive events (conference spanning 3 days)
 * - Multi-day non-consecutive events (every Thursday pattern)
 * - Single day events (dates array with one item)
 * - Legacy events (date field only)
 */
export const sampleDateRangeEvents: EventNode[] = [
  {
    id: "sample-multi-day-conference",
    title: "Sample Tech Conference 2025",
    description: "A three-day tech conference covering AI, blockchain, and startup trends. Runs June 6, 7, and 8. Should appear when filtering for any of those dates.",
    neighborhood: "MANHATTAN",
    tags: ["conference", "ai", "blockchain", "startup"],
    keywords: ["conference"],
    category: "conference",
    url: "https://example.com/tech-conference",
    dates: [
      "2025-06-06T09:00:00Z", // June 6th
      "2025-06-07T09:00:00Z", // June 7th  
      "2025-06-08T09:00:00Z"  // June 8th
    ],
  },
  {
    id: "sample-weekly-meetup",
    title: "Weekly Tech Meetup (Every Thursday)",
    description: "A recurring weekly meetup every Thursday in June. Demonstrates non-consecutive date pattern handling.",
    neighborhood: "BROOKLYN",
    tags: ["workshop", "meetup", "recurring", "weekly"],
    keywords: ["meetup"],
    category: "recurring",
    url: "https://example.com/weekly-meetup",
    dates: [
      "2025-06-05T18:00:00Z", // June 5th (Thursday)
      "2025-06-12T18:00:00Z", // June 12th (Thursday)
      "2025-06-19T18:00:00Z", // June 19th (Thursday)
      "2025-06-26T18:00:00Z"  // June 26th (Thursday)
    ],
  },
  {
    id: "sample-scattered-dates",
    title: "Special Events Series",
    description: "A series of special events on specific dates throughout June - not consecutive, demonstrating flexible date handling.",
    neighborhood: "SOHO",
    tags: ["series", "special events", "scattered"],
    keywords: ["series"],
    category: "series",
    url: "https://example.com/special-series",
    dates: [
      "2025-06-03T19:00:00Z", // June 3rd
      "2025-06-10T19:00:00Z", // June 10th
      "2025-06-17T19:00:00Z", // June 17th
      "2025-06-24T19:00:00Z"  // June 24th
    ],
  },
  {
    id: "sample-single-day-event",
    title: "Single Day Networking Event",
    description: "A single day networking event for entrepreneurs and investors. Uses dates array with one date for consistency.",
    neighborhood: "TRIBECA",
    tags: ["networking", "entrepreneurs", "investors"],
    keywords: ["networking"],
    category: "networking",
    url: "https://example.com/networking",
    dates: ["2025-06-15T18:00:00Z"], // June 15th only
  },
  {
    id: "sample-legacy-event",
    title: "Legacy Date Format Event",
    description: "This event uses the old date format to demonstrate backward compatibility with existing events.",
    neighborhood: "EAST VILLAGE",
    tags: ["legacy", "compatibility"],
    keywords: ["legacy"],
    category: "demo",
    url: "https://example.com/legacy",
    date: "FRIDAY 6:00 PM", // Legacy format
  }
];

/**
 * Helper function to add sample events to existing events for testing
 */
export function addSampleEvents(existingEvents: EventNode[]): EventNode[] {
  return [...sampleDateRangeEvents, ...existingEvents];
} 