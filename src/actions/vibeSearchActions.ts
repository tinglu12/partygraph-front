"use server";

import { createTagCenteredGraph } from "@/lib/sampleData";
import { searchEvent } from "@/server/LamService";
import { EventNode, TagCenteredGraphData } from "@/types/EventGraph";
import { EventType } from "@/types/EventType";
import { sampleEvents } from "@/constants/sampleEvents-v2";

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
 * Uses LLaMA AI to find events that match the user's vibe description
 */
export async function searchEventsByVibe(
  vibeQuery: string
): Promise<EventNode[]> {
  try {
    console.log(`Searching for events with vibe: "${vibeQuery}"`);

    // Convert EventNodes to EventTypes for LamService compatibility
    const eventTypes = sampleEvents.map(convertToEventType);

    // Use the new LamService semantic search
    const matchingEventTitle = await searchEvent(vibeQuery, eventTypes);

    if (!matchingEventTitle) {
      console.log("No matching events found");
      return [];
    }

    // Find the matching event(s) in our data
    const matchingEvents = sampleEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(matchingEventTitle.toLowerCase()) ||
        matchingEventTitle.toLowerCase().includes(event.title.toLowerCase())
    );

    // If we found exact matches, also include connected events for a richer result
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
        `Found ${uniqueEvents.length} events for vibe: "${vibeQuery}"`
      );
      return uniqueEvents;
    }

    return matchingEvents;
  } catch (error) {
    console.error("Error in semantic vibe search:", error);

    // Fallback to simple keyword search if LamService fails
    console.log("Falling back to keyword search...");
    return searchEventsByKeywords(vibeQuery);
  }
}

/**
 * Fallback keyword-based search
 */
function searchEventsByKeywords(query: string): EventNode[] {
  const searchTerms = query.toLowerCase().split(" ");

  return sampleEvents.filter((event) => {
    const searchText = `${event.title} ${event.description} ${
      event.tags?.join(" ") || ""
    }`.toLowerCase();
    return searchTerms.some((term) => searchText.includes(term));
  });
}

/**
 * Server action for tag-centered vibe search using semantic matching
 * Returns a graph structure with central concept and connected events
 */
export async function searchTagCenteredByVibe(
  vibeQuery: string
): Promise<TagCenteredGraphData | null> {
  try {
    console.log(`Searching for tag-centered results for: "${vibeQuery}"`);

    // First, try to find matching events using semantic search
    const matchingEvents = await searchEventsByVibe(vibeQuery);

    if (matchingEvents.length === 0) {
      return null;
    }

    // Extract the most common tag from matching events as the central concept
    const tagFrequency = new Map<string, number>();
    matchingEvents.forEach((event) => {
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
      // If no tags found, use the category of the first event
      centralTag = matchingEvents[0].category || "event";
    }

    // Get all events that share this central tag
    const relatedEvents = sampleEvents.filter(
      (event) =>
        event.tags?.includes(centralTag) || event.category === centralTag
    );

    // Create the tag-centered graph
    const graphData = createTagCenteredGraph(centralTag, relatedEvents);

    console.log(
      `Created tag-centered graph with central concept "${centralTag}" and ${relatedEvents.length} events`
    );
    return graphData;
  } catch (error) {
    console.error("Error in tag-centered vibe search:", error);
    return null;
  }
}

/**
 * Server action to get events by exact tag match using the API
 */
export async function searchEventsByTag(tag: string): Promise<EventNode[]> {
  try {
    const response = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3001"
      }/api/events/tags?query=${encodeURIComponent(tag)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch events by tag");
    }

    const data = await response.json();
    console.log(`Found ${data[0]?.length || 0} events for tag: "${tag}"`);
    return data[0] || [];
  } catch (error) {
    console.error("Error fetching events by tag:", error);
    // Fallback to local search
    return sampleEvents.filter((event) => event.tags?.includes(tag));
  }
}

/**
 * Server action to get all unique tags from events
 */
export async function getAllTags(): Promise<string[]> {
  const tagSet = new Set<string>();
  sampleEvents.forEach((event) => {
    if (event.tags) {
      event.tags.forEach((tag) => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
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
