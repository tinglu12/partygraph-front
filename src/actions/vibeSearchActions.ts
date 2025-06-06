"use server";

import { createTagCenteredGraph } from "@/lib/sampleData";
import { searchEvent, searchEventsByTags } from "@/server/LamService";
import { EventNode, TagCenteredGraphData } from "@/types/EventGraph";
import { EventType } from "@/types/EventType";
import { techweekEvents } from "@/constants/techweekEvents";
import { sampleDateRangeEvents } from "@/constants/sampleDateRangeEvents";
import { sampleEvents as originalSampleEvents } from "@/constants/sampleEvents";
// import {
//   searchJinaEventsByKeywords,
//   searchTagCenteredByKeywords
// } from "@/lib/services/LamService";

// Combine existing events with sample date range events for testing
// Note: For production, replace with getAllEvents() from database
const sampleEvents: EventNode[] = [...sampleDateRangeEvents, ...originalSampleEvents];

/**
 * Get all events from the database (when database is implemented)
 * Currently returns all sample events + date range events
 */
export async function getAllEventsFromDatabase(): Promise<EventNode[]> {
  // TODO: Replace with actual database query
  // For now, return all sample events
  const allEvents = [...sampleDateRangeEvents, ...originalSampleEvents];
  console.log(`Total events available: ${allEvents.length}`);
  return allEvents;
}

/**
 * Convert EventNode to EventType for compatibility with LamService
 */
function convertToEventType(eventNode: EventNode): EventType {
  return {
    title: eventNode.title,
    description: eventNode.description,
    // date: eventNode.date,
    tags: eventNode.tags,
    // keywords: eventNode.keywords || eventNode.tags || [],
    // type: eventNode.category ? [eventNode.category] : undefined,
  };
}

/**
 * Enhanced server action for semantic vibe search using LamService
 * Now uses tag-based LLaMA search that constrains AI to existing vocabulary
 * Falls back to local multi-tag search if AI fails
 */
export async function searchEventsByVibe(
  vibeQuery: string
): Promise<EventNode[]> {
  try {
    console.log(`Starting enhanced vibe search for: "${vibeQuery}"`);

    // Convert EventNodes to EventTypes for LamService compatibility
    const eventTypes = sampleEvents.map(convertToEventType);

    // ENHANCED APPROACH: Use new tag-based LLaMA search
    // This constrains LLaMA to existing tags and provides consistent ranking
    const llamaResult = await searchEventsByTags(vibeQuery, eventTypes);

    if (
      llamaResult.selectedTags.length > 0 &&
      llamaResult.matchingEvents.length > 0
    ) {
      // Success! LLaMA found relevant tags and matching events
      console.log(
        `LLaMA success: ${llamaResult.selectedTags.length} tags, ${llamaResult.matchingEvents.length} events`
      );
      console.log(
        `LLaMA selected tags: [${llamaResult.selectedTags.join(", ")}]`
      );

      // Convert EventTypes back to EventNodes and find them in our dataset
      const matchingIds = new Set(
        llamaResult.matchingEvents.map((e) => e.title)
      );
      const matchingNodes = sampleEvents.filter((event) =>
        matchingIds.has(event.title)
      );

      return matchingNodes;
    }

    // FALLBACK 1: Try legacy LLaMA search for backward compatibility
    console.log("New LLaMA search found no results, trying legacy approach...");
    const legacyResult = await searchEvent(vibeQuery, eventTypes);

    if (legacyResult) {
      // Legacy LLaMA found a matching event title
      const matchingEvents = sampleEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(legacyResult.toLowerCase()) ||
          legacyResult.toLowerCase().includes(event.title.toLowerCase())
      );

      // Include connected events for richer results (existing logic)
      if (matchingEvents.length > 0) {
        const connectedEventIds = new Set<string>();
        matchingEvents.forEach((event) => {
          if (event.connections) {
            event.connections.forEach((id) => connectedEventIds.add(id));
          }
        });

        const connectedEvents = sampleEvents.filter((event) =>
          connectedEventIds.has(event.id)
        );

        const allRelevantEvents = [...matchingEvents, ...connectedEvents];
        const uniqueEvents = Array.from(
          new Map(allRelevantEvents.map((event) => [event.id, event])).values()
        );

        console.log(
          `Legacy LLaMA found ${uniqueEvents.length} events for: "${vibeQuery}"`
        );
        return uniqueEvents;
      }
    }
  } catch (error) {
    console.error("Error in LLaMA searches:", error);
  }

  // FALLBACK 2: Enhanced local multi-tag search
  // This provides the same 5-tag functionality as our fallback search
  console.log("All LLaMA approaches failed, using enhanced local search...");
  const fallbackResult = searchEventsByKeywordsWithTags(vibeQuery);
  return fallbackResult.events;
}

/**
 * Calculate similarity between a search query and a tag using multiple methods
 */
function calculateTagSimilarity(query: string, tag: string): number {
  const queryLower = query.toLowerCase();
  const tagLower = tag.toLowerCase();

  // Exact match gets highest score
  if (queryLower === tagLower) return 1.0;

  // Check if query contains tag or vice versa
  if (queryLower.includes(tagLower) || tagLower.includes(queryLower))
    return 0.9;

  // Word-based matching
  const queryWords = queryLower.split(/\s+/);
  const tagWords = tagLower.split(/\s+/);

  let matchingWords = 0;
  for (const queryWord of queryWords) {
    for (const tagWord of tagWords) {
      if (
        queryWord === tagWord ||
        queryWord.includes(tagWord) ||
        tagWord.includes(queryWord)
      ) {
        matchingWords++;
        break;
      }
    }
  }

  if (matchingWords > 0) {
    return (
      0.5 + (matchingWords / Math.max(queryWords.length, tagWords.length)) * 0.4
    );
  }

  return 0;
}

/**
 * Find the 5 most similar tags to a search query
 */
function findSimilarTags(query: string, allTags: string[]): string[] {
  const tagScores = allTags.map((tag) => ({
    tag,
    score: calculateTagSimilarity(query, tag),
  }));

  // Sort by score descending and take top 5
  return tagScores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.tag);
}

/**
 * Enhanced search that finds events matching the 5 most similar tags
 * Events are ranked by how many matching tags they have
 */
function searchEventsByMultipleTags(query: string): EventNode[] {
  // Get all unique tags from events
  const allTags = Array.from(
    new Set(sampleEvents.flatMap((event) => event.tags || []))
  );

  // Find the 5 most similar tags
  const similarTags = findSimilarTags(query, allTags);
  console.log(`Found similar tags for "${query}":`, similarTags);

  if (similarTags.length === 0) {
    return [];
  }

  // Find events that have any of these tags and calculate match scores
  const eventScores = new Map<
    string,
    { event: EventNode; score: number; matchingTags: string[] }
  >();

  sampleEvents.forEach((event) => {
    if (!event.tags) return;

    const matchingTags = event.tags.filter((tag) => similarTags.includes(tag));
    if (matchingTags.length > 0) {
      // Score based on number of matching tags and their similarity scores
      const score = matchingTags.reduce((total, tag) => {
        const tagIndex = similarTags.indexOf(tag);
        // Higher weight for tags that ranked higher in similarity
        const weight = 1 - (tagIndex / similarTags.length) * 0.5;
        return total + weight;
      }, 0);

      eventScores.set(event.id, {
        event,
        score,
        matchingTags,
      });
    }
  });

  // Sort by score descending
  const rankedEvents = Array.from(eventScores.values())
    .sort((a, b) => b.score - a.score)
    .map((item) => item.event);

  console.log(
    `Found ${rankedEvents.length} events matching tags [${similarTags.join(
      ", "
    )}]`
  );
  return rankedEvents;
}

/**
 * Enhanced fallback search using multiple tag matching
 */
// function searchEventsByKeywords(query: string): EventNode[] {
//   // Try the new multi-tag search first
//   const multiTagResults = searchEventsByMultipleTags(query);
//   if (multiTagResults.length > 0) {
//     return multiTagResults;
//   }

//   // If no tag matches, fall back to original keyword search
//   const searchTerms = query.toLowerCase().split(" ");

//   return sampleEvents.filter((event) => {
//     const searchText = `${event.title} ${event.description} ${
//       event.tags?.join(" ") || ""
//     }`.toLowerCase();
//     return searchTerms.some((term) => searchText.includes(term));
//   });
// }

/**
 * Enhanced search result that includes similar tags for UI display
 */
interface EnhancedSearchResult {
  events: EventNode[];
  similarTags: string[];
}

/**
 * Enhanced search that returns both events and the similar tags found
 */
function searchEventsByKeywordsWithTags(query: string): EnhancedSearchResult {
  // Get all unique tags from events
  const allTags = Array.from(
    new Set(sampleEvents.flatMap((event) => event.tags || []))
  );

  // Find the 5 most similar tags
  const similarTags = findSimilarTags(query, allTags);
  console.log(`Found similar tags for "${query}":`, similarTags);

  if (similarTags.length === 0) {
    // Fallback to original keyword search
    const searchTerms = query.toLowerCase().split(" ");
    const events = sampleEvents.filter((event) => {
      const searchText = `${event.title} ${event.description} ${
        event.tags?.join(" ") || ""
      }`.toLowerCase();
      return searchTerms.some((term) => searchText.includes(term));
    });

    return { events, similarTags: [] };
  }

  // Find events that have any of these tags and calculate match scores
  const eventScores = new Map<
    string,
    { event: EventNode; score: number; matchingTags: string[] }
  >();

  sampleEvents.forEach((event) => {
    if (!event.tags) return;

    const matchingTags = event.tags.filter((tag) => similarTags.includes(tag));
    if (matchingTags.length > 0) {
      // Score based on number of matching tags and their similarity scores
      const score = matchingTags.reduce((total, tag) => {
        const tagIndex = similarTags.indexOf(tag);
        // Higher weight for tags that ranked higher in similarity
        const weight = 1 - (tagIndex / similarTags.length) * 0.5;
        return total + weight;
      }, 0);

      eventScores.set(event.id, {
        event,
        score,
        matchingTags,
      });
    }
  });

  // Sort by score descending
  const rankedEvents = Array.from(eventScores.values())
    .sort((a, b) => b.score - a.score)
    .map((item) => item.event);

  console.log(
    `Found ${rankedEvents.length} events matching tags [${similarTags.join(
      ", "
    )}]`
  );
  return { events: rankedEvents, similarTags };
}

/**
 * Enhanced server action for tag-centered vibe search using semantic matching
 * Now captures and displays both LLaMA-selected tags and fallback search tags
 * Returns a graph structure with central concept and connected events
 */
export async function searchTagCenteredByVibe(
  vibeQuery: string
): Promise<TagCenteredGraphData | null> {
  try {
    console.log(`Starting tag-centered search for: "${vibeQuery}"`);

    // Always prepare enhanced fallback search for comparison/fallback
    const enhancedResult = searchEventsByKeywordsWithTags(vibeQuery);
    let similarTags = enhancedResult.similarTags;
    let searchMethod: "llama" | "fallback" = "fallback";

    // Try enhanced LLaMA search first - this is our preferred method
    const eventTypes = sampleEvents.map(convertToEventType);

    try {
      const llamaResult = await searchEventsByTags(vibeQuery, eventTypes);

      if (
        llamaResult.selectedTags.length > 0 &&
        llamaResult.matchingEvents.length > 0
      ) {
        // SUCCESS: LLaMA found relevant tags - use these instead of fallback
        console.log(
          `LLaMA tag-centered search successful: [${llamaResult.selectedTags.join(
            ", "
          )}]`
        );
        similarTags = llamaResult.selectedTags;
        searchMethod = "llama";

        // Convert LLaMA's EventTypes back to our EventNodes
        const matchingIds = new Set(
          llamaResult.matchingEvents.map((e) => e.title)
        );
        const finalEvents = sampleEvents.filter((event) =>
          matchingIds.has(event.title)
        );

        if (finalEvents.length > 0) {
          // Use LLaMA's results and tags
          return createTagCenteredGraphFromEvents(
            finalEvents,
            similarTags,
            searchMethod,
            vibeQuery
          );
        }
      }
    } catch (llamaError) {
      console.log("LLaMA tag search failed, using fallback:", llamaError);
    }

    // FALLBACK: Use regular vibe search (which has its own LLaMA fallback chain)
    const matchingEvents = await searchEventsByVibe(vibeQuery);
    let finalEvents = matchingEvents;

    // If no events found, use enhanced local search results
    if (finalEvents.length === 0) {
      finalEvents = enhancedResult.events;

      if (finalEvents.length === 0) {
        return null;
      }
    }

    return createTagCenteredGraphFromEvents(
      finalEvents,
      similarTags,
      searchMethod,
      vibeQuery
    );
  } catch (error) {
    console.error("Error in tag-centered vibe search:", error);
    return null;
  }
}

/**
 * Helper function to create tag-centered graph from events and display tags
 * Centralizes the graph creation logic and tag display handling
 */
function createTagCenteredGraphFromEvents(
  events: EventNode[],
  displayTags: string[],
  searchMethod: "llama" | "fallback",
  originalQuery: string
): TagCenteredGraphData {
  // Extract the most common tag from matching events as the central concept
  const tagFrequency = new Map<string, number>();
  events.forEach((event) => {
    if (event.tags) {
      event.tags.forEach((tag) => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      });
    }
  });

  // Find the most frequent tag
  let centralTag = "";
  let maxFrequency = 0;
  tagFrequency.forEach((frequency, tag) => {
    if (frequency > maxFrequency) {
      maxFrequency = frequency;
      centralTag = tag;
    }
  });

  if (!centralTag) {
    // If no tags found, use the category of the first event or first display tag
    centralTag = events[0]?.category || displayTags[0] || "event";
  }

  // Get all events that share this central tag for the full graph
  const relatedEvents = sampleEvents.filter(
    (event) => event.tags?.includes(centralTag) || event.category === centralTag
  );

  // Create the tag-centered graph with enhanced tag information
  const graphData = createTagCenteredGraph(centralTag, relatedEvents);

  // Always include the display tags for UI (LLaMA tags or fallback similar tags)
  if (displayTags.length > 0) {
    graphData.similarTags = displayTags;
  }

  const tagSource = searchMethod === "llama" ? "LLaMA AI" : "local similarity";
  console.log(
    `Created tag-centered graph: central="${centralTag}", events=${relatedEvents.length}, ` +
      `tags=[${displayTags.join(", ")}] via ${tagSource}`
  );

  return graphData;
}

/**
 * Server action to get events by exact tag match using the API
 */
export async function searchEventsByTag(tag: string): Promise<EventNode[]> {
  // TODO this throws an error locally but seems to return data..?
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
  const searchUrl = `${baseUrl}/api/events/tags?query=${encodeURIComponent(
    tag
  )}`;
  console.log("baseUrl", { baseUrl, searchUrl });
  try {
    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch events by tag");
    }

    const data = await response.json();

    // Ensure we always return an array - handle various response formats
    let events: EventNode[] = [];

    if (Array.isArray(data)) {
      // If data is directly an array
      events = data;
    } else if (data && Array.isArray(data[0])) {
      // If data[0] is an array (current expected format)
      events = data[0];
    } else if (data && data.events && Array.isArray(data.events)) {
      // If data.events is an array
      events = data.events;
    } else {
      console.warn(
        "Unexpected API response format for searchEventsByTag:",
        data
      );
      events = [];
    }

    console.log(`Found ${events.length} events for tag: "${tag}"`);
    return events;
  } catch (error) {
    console.error("Error fetching events by tag:", error);
    // Fallback to local search - ensure this also returns an array
    const localResults = sampleEvents.filter((event) =>
      event.tags?.includes(tag)
    );
    console.log(
      `Fallback to local search found ${localResults.length} events for tag: "${tag}"`
    );
    return localResults;
  }
}

/**
 * Server action to get all unique tags from events
 * Now returns ALL tags without arbitrary limits
 */
export async function getAllTags(): Promise<string[]> {
  const tagSet = new Set<string>();
  sampleEvents.forEach((event) => {
    if (event.tags) {
      event.tags.forEach((tag) => tagSet.add(tag));
    }
  });
  const allTags = Array.from(tagSet);
  console.log(`Total available tags: ${allTags.length}`);
  
  // Sort all tags alphabetically, with nytechweek at the beginning
  const sorted = allTags.filter(tag => tag !== "nytechweek").sort();
  const final = ["nytechweek", ...sorted];
  
  return final;
}

/**
 * Server action to get all unique categories from events
 */
export async function getAllCategories(): Promise<string[]> {
  const categorySet = new Set<string>();
  sampleEvents.forEach((event) => {
    if (event.category) {
      categorySet.add(event.category);
    }
  });
  return Array.from(categorySet).sort();
}

/**
 * Server action to get ALL events without any filtering
 * Useful for displaying the complete event catalog
 */
export async function getAllEvents(): Promise<EventNode[]> {
  console.log(`Returning all ${sampleEvents.length} available events`);
  return sampleEvents;
}
