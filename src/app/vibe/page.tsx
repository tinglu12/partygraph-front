"use client";
import { useState } from "react";
import { VibeSearch } from "@/components/VibeSearch";
import { FlyerUpload } from "@/components/FlyerUpload";
import { Graph } from "@/features/components/Graph";
import { TagCenteredGraph } from "@/components/TagCenteredGraph";
import { EventsList } from "@/components/EventsList";
import {
  searchTagCenteredByVibe,
  searchEventsByVibe,
  searchEventsByTag,
} from "@/actions/vibeSearchActions";
import {
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Brain,
  Zap,
  Cpu,
  Upload,
} from "lucide-react";
import { EventNode, TagCenteredGraphData } from "@/types/EventGraph";
import { sampleEvents } from "@/constants/sampleEvents";

/**
 * Enhanced AI-powered vibe discovery page with semantic search capabilities
 * Uses LLaMA AI for intelligent event matching and tag-centered visualization
 */
export default function VibePage() {
  const [tagGraphData, setTagGraphData] = useState<TagCenteredGraphData | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<EventNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"semantic" | "tag">("semantic");
  const [showUpload, setShowUpload] = useState(false);
  const [recentlyAddedEvent, setRecentlyAddedEvent] = useState<EventNode | null>(null);

  // Handle semantic vibe search using AI
  const handleVibeSearch = async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    setHasSearched(true);
    setError(null);
    setSearchMode("semantic");
    setRecentlyAddedEvent(null);

    try {
      console.log(`Starting AI semantic search for: "${query}"`);

      // Try tag-centered search first for better visualization
      const graphData = await searchTagCenteredByVibe(query);

      if (graphData) {
        setTagGraphData(graphData);
        // Extract events from graph for list view
        const events = graphData.nodes
          .filter((node: any) => node.type === "event")
          .map((node: any) => node.data as EventNode);
        setSearchResults(events);
      } else {
        // Fallback to direct event search
        const events = await searchEventsByVibe(query);
        if (events.length > 0) {
          setSearchResults(events);
          setTagGraphData(null);
        } else {
          setError(
            "No events found matching your vibe. Try a different description or browse available tags below."
          );
          setSearchResults([]);
          setTagGraphData(null);
        }
      }
    } catch (error) {
      console.error("Error in AI vibe search:", error);
      setError(
        "AI search encountered an error. Please try again or use a simpler description."
      );
      setSearchResults([]);
      setTagGraphData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tag-based search
  const handleTagSearch = async (tag: string) => {
    setIsLoading(true);
    setSearchQuery(tag);
    setHasSearched(true);
    setError(null);
    setSearchMode("tag");
    setRecentlyAddedEvent(null);

    try {
      console.log(`Searching by tag: "${tag}"`);

      const events = await searchEventsByTag(tag);
      if (events.length > 0) {
        setSearchResults(events);
        setTagGraphData(null);
      } else {
        setError(`No events found with tag "${tag}".`);
        setSearchResults([]);
        setTagGraphData(null);
      }
    } catch (error) {
      console.error("Error in tag search:", error);
      setError("Tag search failed. Please try again.");
      setSearchResults([]);
      setTagGraphData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful flyer upload and event extraction
  const handleEventExtracted = (event: EventNode) => {
    setRecentlyAddedEvent(event);
    setShowUpload(false);
    setHasSearched(true);
    setSearchResults([event]);
    setTagGraphData(null);
    setError(null);
    setSearchQuery(`Flyer Upload: ${event.title}`);
    setSearchMode("semantic");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced background decorations with AI theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/3 to-blue-500/3 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Enhanced search interface with AI branding */}
        <div className="pt-8 pb-6">
          <VibeSearch
            onSearch={handleVibeSearch}
            onTagSelect={handleTagSearch}
            isLoading={isLoading}
          />
          
          {/* Upload toggle section */}
          <div className="max-w-5xl mx-auto px-6 mt-8">
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Can't find what you're looking for? Add your own event!
              </p>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <Upload className="w-5 h-5" />
                {showUpload ? "Hide Upload" : "Upload Event Flyer"}
              </button>
            </div>
          </div>

          {/* Flyer upload section */}
          {showUpload && (
            <div className="max-w-5xl mx-auto px-6 mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
                  <Brain className="w-6 h-6 text-purple-400" />
                  AI Flyer Analysis
                  <Upload className="w-6 h-6 text-green-400" />
                </h3>
                <FlyerUpload onEventExtracted={handleEventExtracted} />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced results section */}
        {hasSearched && (
          <div className="px-6 pb-8">
            {/* Show recently added event banner */}
            {recentlyAddedEvent && (
              <div className="max-w-5xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-bold text-white">Event Successfully Added!</h3>
                  </div>
                  <p className="text-gray-300">
                    Your event "<span className="text-white font-semibold">{recentlyAddedEvent.title}</span>" has been added to Party Graph and is now searchable by other users.
                  </p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center text-white py-16">
                <div className="max-w-lg mx-auto bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                      <div
                        className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"
                        style={{ animationDirection: "reverse" }}
                      ></div>
                      <div
                        className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-green-600 rounded-full animate-spin"
                        style={{ animationDuration: "2s" }}
                      ></div>
                    </div>
                    <Brain className="w-8 h-8 text-purple-400" />
                    <Cpu className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {searchMode === "semantic"
                      ? "AI Analyzing Your Vibe..."
                      : "Searching Events..."}
                  </h3>
                  <p className="text-gray-300 text-lg mb-2">
                    {searchMode === "semantic"
                      ? "LLaMA AI is processing your description and finding semantic matches"
                      : `Finding events tagged with "${searchQuery}"`}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Sparkles className="w-4 h-4" />
                    <span>This may take a few moments</span>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-3xl p-10 text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <h2 className="text-3xl font-bold text-white">
                      Search Results
                    </h2>
                  </div>
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                    {error}
                  </p>

                  {/* Enhanced suggestions */}
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <Info className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">
                        Try These Instead:
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-300 font-semibold mb-3">
                          🤖 AI-Friendly Descriptions:
                        </p>
                        <div className="space-y-2">
                          {[
                            "energetic music with dancing",
                            "chill art gallery vibes",
                            "outdoor food festival",
                          ].map((example) => (
                            <button
                              key={example}
                              onClick={() => handleVibeSearch(example)}
                              className="block w-full text-left px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 rounded-lg transition-colors"
                            >
                              "{example}"
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-300 font-semibold mb-3">
                          🏷️ Available Tags:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(
                            new Set(sampleEvents.flatMap((e) => e.tags || []))
                          )
                            .slice(0, 8)
                            .map((tag) => (
                              <button
                                key={tag}
                                onClick={() => handleTagSearch(tag)}
                                className="px-3 py-1 text-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 rounded-full border border-blue-500/20 transition-colors"
                              >
                                #{tag}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : searchResults.length > 0 || tagGraphData ? (
              <div className="space-y-12">
                {/* Tag-centered graph visualization */}
                {tagGraphData && (
                  <div className="max-w-7xl mx-auto">
                    <TagCenteredGraph graphData={tagGraphData} />
                  </div>
                )}

                {/* Enhanced events list */}
                {searchResults.length > 0 && (
                  <div className="max-w-7xl mx-auto">
                    <EventsList
                      events={searchResults}
                      title={
                        recentlyAddedEvent
                          ? "Your New Event"
                          : tagGraphData
                          ? `All Events: #${tagGraphData.centralTag}`
                          : "Matching Events"
                      }
                      subtitle={
                        recentlyAddedEvent
                          ? "Event successfully extracted from flyer and added to Party Graph"
                          : searchMode === "semantic"
                          ? "Events discovered through AI semantic analysis of your vibe description"
                          : `Events tagged with "${searchQuery}"`
                      }
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                    <h2 className="text-3xl font-bold text-white">
                      No Results Found
                    </h2>
                  </div>
                  <p className="text-gray-300 mb-4 text-lg">
                    {searchMode === "semantic"
                      ? `The AI couldn't find events matching "${searchQuery}"`
                      : `No events found with tag "${searchQuery}"`}
                  </p>
                  <p className="text-gray-400">
                    Try a different description or browse our available options
                    above.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced initial state */}
        {!hasSearched && (
          <div className="px-6 pb-8">
            {/* Enhanced initial content */}
            <div className="space-y-12 h-full">
              <div className="max-w-7xl mx-auto h-full">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 h-full">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    Event Network Overview
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </h3>

                  <div className="h-[700px]">
                    <Graph />
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto">
                {/* <EventsList
                  events={sampleEvents}
                  title="All Available Events"
                  subtitle="Explore our complete event catalog, or use AI search above to find your perfect vibe"
                /> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
