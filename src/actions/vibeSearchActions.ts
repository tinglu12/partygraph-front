"use server";

import { VibeSearchService, TagCenteredResult } from '@/services/VibeSearchService';
import { sampleEvents, EventNode, createTagCenteredGraph, TagCenteredGraphData } from '@/lib/sampleData';

/**
 * Check if LLaMA API is properly configured
 */
function checkEnvironment() {
  const apiKey = process.env["LLAMA_API_KEY"];
  if (!apiKey) {
    console.warn('LLAMA_API_KEY not found in environment variables');
    return false;
  }
  return true;
}

/**
 * Server action for tag-centered vibe search
 * Returns a graph structure with central tag and connected events
 */
export async function searchTagCenteredByVibe(vibeQuery: string): Promise<TagCenteredGraphData | null> {
  try {
    const vibeSearchService = new VibeSearchService();
    
    let result: TagCenteredResult | null = null;

    // Try LLaMA semantic search first if available
    if (checkEnvironment()) {
      result = await vibeSearchService.getTagCenteredResults(vibeQuery, sampleEvents);
    }
    
    // Fallback to keyword search if LLaMA failed or unavailable
    if (!result) {
      console.log('Using fallback keyword search for tag-centered results');
      result = vibeSearchService.findTagByKeywords(vibeQuery, sampleEvents);
    }

    if (!result) {
      return null;
    }

    // Create the graph structure
    const graphData = createTagCenteredGraph(result.centralTag, result.relatedEvents);
    
    console.log(`Created tag-centered graph with central tag "${result.centralTag}" and ${result.relatedEvents.length} events`);
    return graphData;
  } catch (error) {
    console.error('Error in tag-centered vibe search:', error);
    return null;
  }
}

/**
 * Server action to search for events based on user's vibe description
 * Returns events that match the semantic search plus their connected nodes
 */
export async function searchEventsByVibe(vibeQuery: string): Promise<EventNode[]> {
  try {
    // Check if environment is properly configured
    if (!checkEnvironment()) {
      console.log('LLaMA API not configured, returning empty results');
      return [];
    }

    // Create a new instance of the service for server-side execution
    const vibeSearchService = new VibeSearchService();
    
    // Get matching events and their network
    const matchingEvents = await vibeSearchService.getEventNetworkByVibe(vibeQuery, sampleEvents);
    
    console.log(`Found ${matchingEvents.length} matching events for query: "${vibeQuery}"`);
    return matchingEvents;
  } catch (error) {
    console.error('Error in vibe search action:', error);
    // Return empty array on error rather than throwing
    return [];
  }
}

/**
 * Server action to get just the matching event IDs (without connections)
 * Useful for highlighting the primary matches vs connected events
 */
export async function getMatchingEventIds(vibeQuery: string): Promise<string[]> {
  try {
    if (!checkEnvironment()) {
      return [];
    }

    const vibeSearchService = new VibeSearchService();
    const matchingIds = await vibeSearchService.findEventsByVibe(vibeQuery, sampleEvents);
    return matchingIds;
  } catch (error) {
    console.error('Error getting matching event IDs:', error);
    return [];
  }
}

/**
 * Check if the LLaMA API is available
 */
export async function checkLlamaApiStatus(): Promise<{ available: boolean; message: string }> {
  try {
    if (!checkEnvironment()) {
      return {
        available: false,
        message: "LLAMA_API_KEY not found in environment variables"
      };
    }

    // Try a simple test call
    const vibeSearchService = new VibeSearchService();
    await vibeSearchService.findEventsByVibe("test", sampleEvents.slice(0, 1));
    
    return {
      available: true,
      message: "LLaMA API is working correctly"
    };
  } catch (error) {
    return {
      available: false,
      message: `LLaMA API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 