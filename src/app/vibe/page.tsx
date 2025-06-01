"use client";
import { useState } from 'react';
import { VibeSearch } from '@/components/VibeSearch';
import { Graph } from '@/features/components/Graph';
import { TagCenteredGraph } from '@/components/TagCenteredGraph';
import { EventsList } from '@/components/EventsList';
import { searchTagCenteredByVibe } from '@/actions/vibeSearchActions';
import { sampleEvents, generateEdgesFromConnections, EventNode, TagCenteredGraphData } from '@/lib/sampleData';

/**
 * Simple fallback search that works without LLaMA
 * Finds the best matching tag and returns events with that tag
 */
const fallbackTagSearch = (query: string, events: EventNode[]): { centralTag: string; relatedEvents: EventNode[] } | null => {
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
};

/**
 * Simple vibe-based event discovery page
 * Users type what vibe they want, finds the most relevant tag,
 * and shows it in the center with related events around it
 */
export default function VibePage() {
  const [tagGraphData, setTagGraphData] = useState<TagCenteredGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Handle vibe search - find the most relevant tag and related events
  const handleVibeSearch = async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    setHasSearched(true);
    setError(null);
    setUsedFallback(false);

    try {
      // Try LLaMA semantic search first
      const graphData = await searchTagCenteredByVibe(query);
      
      if (graphData) {
        setTagGraphData(graphData);
      } else {
        // If no results from LLaMA, try fallback search
        console.log('No results from LLaMA, trying fallback tag search...');
        const fallbackResult = fallbackTagSearch(query, sampleEvents);
        
        if (fallbackResult) {
          // Create graph data from fallback result
          const { createTagCenteredGraph } = await import('@/lib/sampleData');
          const fallbackGraphData = createTagCenteredGraph(
            fallbackResult.centralTag, 
            fallbackResult.relatedEvents
          );
          setTagGraphData(fallbackGraphData);
          setUsedFallback(true);
        } else {
          setError('No matching tags found for your search. Try different keywords.');
          setTagGraphData(null);
        }
      }
    } catch (error) {
      console.error('Error searching for vibe:', error);
      
      // Fallback to simple keyword search
      console.log('LLaMA search failed, using fallback tag search...');
      const fallbackResult = fallbackTagSearch(query, sampleEvents);
      
      if (fallbackResult) {
        const { createTagCenteredGraph } = await import('@/lib/sampleData');
        const fallbackGraphData = createTagCenteredGraph(
          fallbackResult.centralTag, 
          fallbackResult.relatedEvents
        );
        setTagGraphData(fallbackGraphData);
        setUsedFallback(true);
      } else {
        setError('Search failed and no matching tags found. Try different terms.');
        setTagGraphData(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Search Interface */}
      <div className="pt-8 pb-6">
        <VibeSearch 
          onSearch={handleVibeSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="px-6 pb-8">
          {isLoading ? (
            <div className="text-center text-white">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-lg">Finding the best tag match for your vibe...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-white">
              <h2 className="text-xl font-semibold mb-2">No matching tag found</h2>
              <p className="text-gray-300 mb-4">{error}</p>
              <div className="text-sm text-gray-400">
                <p>Available tags in our events:</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                  {Array.from(new Set(sampleEvents.flatMap(e => e.tags || []))).map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : tagGraphData ? (
            <div>
              {/* Results header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Events tagged with "{tagGraphData.centralTag}"
                </h2>
                <p className="text-gray-300">
                  Found {tagGraphData.nodes.filter(n => n.type === 'event').length} event{tagGraphData.nodes.filter(n => n.type === 'event').length !== 1 ? 's' : ''} matching your vibe
                  {usedFallback && (
                    <span className="block text-sm text-yellow-400 mt-1">
                      (Using keyword search - LLaMA semantic search unavailable)
                    </span>
                  )}
                </p>
              </div>

              {/* Tag-Centered Graph */}
              <div className="max-w-5xl mx-auto mb-8">
                <TagCenteredGraph graphData={tagGraphData} />
              </div>

              {/* Events List */}
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-semibold text-white mb-4 text-center">
                  Events with tag "{tagGraphData.centralTag}"
                </h3>
                <EventsList 
                  events={tagGraphData.nodes
                    .filter(node => node.type === 'event')
                    .map(node => node.data as EventNode)
                  }
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-white">
              <h2 className="text-xl font-semibold mb-2">No matches found</h2>
              <p className="text-gray-300 mb-4">
                We couldn't find any tags matching "{searchQuery}". Try a different description.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial state - show all events */}
      {!hasSearched && (
        <div className="px-6 pb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">All Available Events</h2>
            <p className="text-gray-300">Search above to find events by tag similarity to your vibe</p>
          </div>
          
          {/* Show traditional graph and list view initially */}
          <div className="max-w-5xl mx-auto mb-8">
            <Graph events={sampleEvents} edges={generateEdgesFromConnections(sampleEvents)} />
          </div>
          
          <div className="max-w-6xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Browse All Events</h3>
            <EventsList events={sampleEvents} />
          </div>
        </div>
      )}
    </div>
  );
} 