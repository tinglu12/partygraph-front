"use client";
import { useState } from 'react';
import { VibeSearch } from '@/components/VibeSearch';
import { Graph } from '@/features/components/Graph';
import { TagCenteredGraph } from '@/components/TagCenteredGraph';
import { EventsList } from '@/components/EventsList';
import { searchTagCenteredByVibe } from '@/actions/vibeSearchActions';
import { sampleEvents, generateEdgesFromConnections, EventNode, TagCenteredGraphData, createTagCenteredGraph, TagCenteredNode } from '@/lib/sampleData';
import { AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';

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
 * Enhanced vibe-based event discovery page with improved styling and UX
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/3 to-blue-500/3 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Enhanced search interface */}
        <div className="pt-8 pb-6">
          <VibeSearch 
            onSearch={handleVibeSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Enhanced results section */}
        {hasSearched && (
          <div className="px-6 pb-8">
            {isLoading ? (
              <div className="text-center text-white py-12">
                <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                    </div>
                    <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                  </div>
                  <span className="text-lg font-semibold">Finding the perfect vibe match...</span>
                  <p className="text-gray-300 text-sm mt-2">Analyzing your search to find the best tagged events</p>
                </div>
              </div>
            ) : error ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <h2 className="text-2xl font-bold text-white">No matching tag found</h2>
                  </div>
                  <p className="text-gray-300 mb-6 text-lg">{error}</p>
                  
                  {/* Enhanced available tags display */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Info className="w-5 h-5 text-blue-400" />
                      <p className="text-white font-semibold">Available tags in our events:</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                      {Array.from(new Set(sampleEvents.flatMap(e => e.tags || []))).map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleVibeSearch(tag)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-sm rounded-full border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : tagGraphData ? (
              <div className="space-y-8">
                {/* Enhanced results header */}
                <div className="text-center">
                  <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                      <h2 className="text-3xl font-bold text-white">
                        Perfect Match Found!
                      </h2>
                    </div>
                    <div className="mb-4">
                      <p className="text-xl text-gray-300 mb-2">
                        Events tagged with <span className="font-bold text-purple-300">"{tagGraphData.centralTag}"</span>
                      </p>
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Sparkles className="w-4 h-4" />
                        <span>
                          Found {tagGraphData.nodes.filter((n: TagCenteredNode) => n.type === 'event').length} event{tagGraphData.nodes.filter((n: TagCenteredNode) => n.type === 'event').length !== 1 ? 's' : ''} matching your vibe
                        </span>
                      </div>
                    </div>
                    {usedFallback && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Info className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-300 font-medium">
                            Using keyword search - LLaMA semantic search unavailable
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced tag-centered graph */}
                <div className="max-w-7xl mx-auto">
                  <TagCenteredGraph graphData={tagGraphData} />
                </div>

                {/* Enhanced events list */}
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      All Events with "{tagGraphData.centralTag}"
                    </h3>
                    <p className="text-gray-300">Explore the events that match your vibe</p>
                  </div>
                  <EventsList 
                    events={tagGraphData.nodes
                      .filter((node: TagCenteredNode) => node.type === 'event')
                      .map((node: TagCenteredNode) => node.data as EventNode)
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                    <h2 className="text-2xl font-bold text-white">No matches found</h2>
                  </div>
                  <p className="text-gray-300 mb-4 text-lg">
                    We couldn't find any tags matching <span className="font-semibold text-purple-300">"{searchQuery}"</span>
                  </p>
                  <p className="text-gray-400">Try a different description or browse our available tags above.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced initial state */}
        {!hasSearched && (
          <div className="px-6 pb-8">
            <div className="text-center mb-8">
              <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                  <h2 className="text-2xl font-bold text-white">All Available Events</h2>
                  <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <p className="text-gray-300 text-lg">
                  Search above to find events by tag similarity to your vibe, or browse all events below
                </p>
              </div>
            </div>
            
            {/* Enhanced traditional graph and list view */}
            <div className="space-y-8">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Event Network Overview</h3>
                  <Graph events={sampleEvents} edges={generateEdgesFromConnections(sampleEvents)} />
                </div>
              </div>
              
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Browse All Events</h3>
                  <p className="text-gray-300">Discover what's happening in your area</p>
                </div>
                <EventsList events={sampleEvents} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 