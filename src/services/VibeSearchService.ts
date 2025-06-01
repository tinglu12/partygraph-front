import { EventNode } from '@/lib/sampleData';
import { EventType } from '@/types/EventType';
import LlamaAPIClient from "llama-api-client";

/**
 * Extended interface for graph with central tag
 */
export interface TagCenteredResult {
  centralTag: string;
  relatedEvents: EventNode[];
  allUniqueTags: string[];
}

/**
 * Service for finding events that match a user's desired vibe
 * Uses semantic search with LLaMA to find the best matching events
 */
export class VibeSearchService {
  private client: LlamaAPIClient;
  private model: string;

  constructor() {
    this.client = new LlamaAPIClient({
      apiKey: process.env["LLAMA_API_KEY"],
    });
    this.model = "Llama-4-Maverick-17B-128E-Instruct-FP8";
  }

  /**
   * Get all unique tags from events
   */
  private getAllTags(events: EventNode[]): string[] {
    const tagSet = new Set<string>();
    events.forEach(event => {
      if (event.tags) {
        event.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }

  /**   
   * Find the most relevant tag based on user's vibe query
   * Returns the tag that best matches the semantic meaning
   */
  async findMostRelevantTag(vibeQuery: string, events: EventNode[]): Promise<string | null> {
    const allTags = this.getAllTags(events);
    
    if (allTags.length === 0) {
      return null;
    }

    const tagsList = allTags.join(', ');

    const prompt = `
    You are a helpful assistant that finds the most relevant tag for a user's vibe query.
    
    User is looking for: "${vibeQuery}"
    
    Available tags: ${tagsList}
    
    Instructions:
    1. Find the single tag that best matches the user's desired vibe
    2. Consider the semantic meaning, not just exact word matches
    3. Return ONLY the tag name, nothing else
    4. If no tags match well, return "NO_MATCH"
    `;

    try {
      const response = await this.client.chat.completions.create({
        messages: [{ content: prompt, role: "user" }],
        model: this.model,
      });

      const content = response.completion_message?.content;
      if (!content) {
        return null;
      }

      // Handle content type - it could be a string or an object with text property
      const textContent = typeof content === "string" ? content : (content as any).text || content;
      
      if (!textContent || textContent.trim() === "NO_MATCH") {
        return null;
      }

      const tag = textContent.trim();
      
      // Verify the tag exists in our available tags
      if (allTags.includes(tag)) {
        return tag;
      }

      return null;
    } catch (error) {
      console.error("Error finding relevant tag:", error);
      return null;
    }
  }

  /**
   * Get events that have a specific tag
   */
  private getEventsWithTag(tag: string, events: EventNode[]): EventNode[] {
    return events.filter(event => 
      event.tags && event.tags.includes(tag)
    );
  }

  /**
   * Find events organized around a central tag based on vibe search
   * Returns the most relevant tag and all events that have that tag
   */
  async getTagCenteredResults(vibeQuery: string, allEvents: EventNode[]): Promise<TagCenteredResult | null> {
    try {
      // Find the most relevant tag
      const centralTag = await this.findMostRelevantTag(vibeQuery, allEvents);
      
      if (!centralTag) {
        return null;
      }

      // Get all events that have this tag
      const relatedEvents = this.getEventsWithTag(centralTag, allEvents);
      
      // Get all unique tags for potential fallback or additional info
      const allUniqueTags = this.getAllTags(allEvents);

      return {
        centralTag,
        relatedEvents,
        allUniqueTags
      };
    } catch (error) {
      console.error("Error in tag-centered search:", error);
      return null;
    }
  }

  /**
   * Fallback function to find tag by keyword matching
   */
  findTagByKeywords(vibeQuery: string, events: EventNode[]): TagCenteredResult | null {
    const allTags = this.getAllTags(events);
    const searchTerms = vibeQuery.toLowerCase().split(' ').filter(term => term.length > 2);
    
    // Find tag that best matches the search terms
    let bestTag: string | null = null;
    let bestScore = 0;

    allTags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      let score = 0;
      
      searchTerms.forEach(term => {
        if (tagLower.includes(term) || term.includes(tagLower)) {
          score += tagLower === term ? 3 : 1; // Exact match gets higher score
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestTag = tag;
      }
    });

    if (bestTag) {
      const relatedEvents = this.getEventsWithTag(bestTag, events);
      if (relatedEvents.length > 0) {
        return {
          centralTag: bestTag,
          relatedEvents,
          allUniqueTags: allTags
        };
      }
    }

    return null;
  }

  /**
   * Find events that match the user's vibe description
   * Returns event IDs sorted by relevance (most relevant first)
   */
  async findEventsByVibe(vibeQuery: string, events: EventNode[]): Promise<string[]> {
    // Create a searchable description for each event
    const eventDescriptions = events.map(event => {
      const tags = event.tags ? event.tags.join(', ') : '';
      const category = event.category || '';
      return `Event: ${event.title}\nDescription: ${event.description}\nCategory: ${category}\nTags: ${tags}`;
    }).join('\n\n');

    const prompt = `
    You are a helpful assistant that finds events matching a user's desired vibe.
    
    User is looking for: "${vibeQuery}"
    
    Here are the available events:
    ${eventDescriptions}
    
    Instructions:
    1. Find events that best match the user's desired vibe
    2. Consider the semantic meaning, not just exact word matches
    3. Return the event titles that match, separated by newlines
    4. Return them in order of relevance (most relevant first)
    5. If no events match well, return "NO_MATCHES"
    6. Only return event titles, nothing else
    `;

    try {
      const response = await this.client.chat.completions.create({
        messages: [{ content: prompt, role: "user" }],
        model: this.model,
      });

      const content = response.completion_message?.content;
      if (!content) {
        return [];
      }

      // Handle content type - it could be a string or an object with text property
      const textContent = typeof content === "string" ? content : (content as any).text || content;
      
      if (!textContent || textContent.trim() === "NO_MATCHES") {
        return [];
      }

      // Parse the response to get event titles
      const matchedTitles = textContent.trim().split('\n').map((title: string) => title.trim()).filter((title: string) => title);
      
      // Convert titles back to event IDs
      const matchedIds: string[] = [];
      matchedTitles.forEach((title: string) => {
        const event = events.find(e => e.title === title);
        if (event) {
          matchedIds.push(event.id);
        }
      });

      return matchedIds;
    } catch (error) {
      console.error("Error in vibe search:", error);
      return [];
    }
  }

  /**
   * Get events and their connected nodes based on vibe search
   * This returns both the matching events and their immediate connections
   */
  async getEventNetworkByVibe(vibeQuery: string, allEvents: EventNode[]): Promise<EventNode[]> {
    const matchedIds = await this.findEventsByVibe(vibeQuery, allEvents);
    
    if (matchedIds.length === 0) {
      return [];
    }

    // Get the matched events and their connections
    const networkIds = new Set(matchedIds);
    
    // Add connected events to create a network around the matches
    matchedIds.forEach(id => {
      const event = allEvents.find(e => e.id === id);
      if (event && event.connections) {
        event.connections.forEach(connectedId => {
          networkIds.add(connectedId);
        });
      }
    });

    // Return events in the network
    return allEvents.filter(event => networkIds.has(event.id));
  }
}

// Export a singleton instance for use across the app
export const vibeSearchService = new VibeSearchService(); 