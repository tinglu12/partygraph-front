"use server";

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
 * Simple keyword-based tag search fallback
 * Finds the best matching tag based on keyword similarity
 */
function findTagByKeywords(query: string, events: EventNode[]): { centralTag: string; relatedEvents: EventNode[] } | null {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  // Get all unique tags
  const tagSet = new Set<string>();
  events.forEach(event => {
    if (event.tags) {
      event.tags.forEach(tag => tagSet.add(tag));
    }
  });
  const allTags = Array.from(tagSet);

  // Find the best matching tag
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
    const relatedEvents = events.filter(event => 
      event.tags && event.tags.includes(bestTag!)
    );
    
    if (relatedEvents.length > 0) {
      return {
        centralTag: bestTag,
        relatedEvents
      };
    }
  }

  return null;
}

/**
 * Server action for tag-centered vibe search
 * Returns a graph structure with central tag and connected events
 */
export async function searchTagCenteredByVibe(vibeQuery: string): Promise<TagCenteredGraphData | null> {
  try {
    // For now, use keyword search as LLaMA integration is not implemented
    // In the future, this would integrate with LLaMA for semantic search
    console.log(`Searching for vibe: "${vibeQuery}"`);
    
    const result = findTagByKeywords(vibeQuery, sampleEvents);
    
    if (!result) {
      console.log('No matching tags found for query:', vibeQuery);
      return null;
    }

    // Create the tag-centered graph structure
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

    // For now, return a simple keyword-based search
    // In the future, this would integrate with LLaMA for semantic search
    const searchTerms = vibeQuery.toLowerCase().split(' ');
    
    const matchingEvents = sampleEvents.filter(event => {
      const searchText = `${event.title} ${event.description} ${event.tags?.join(' ') || ''}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });

    console.log(`Found ${matchingEvents.length} matching events for query: "${vibeQuery}"`);
    return matchingEvents;
  } catch (error) {
    console.error('Error in vibe search:', error);
    return [];
  }
} 