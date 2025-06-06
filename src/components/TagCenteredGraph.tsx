"use client";
import { useEffect, useState } from 'react';
import { Sparkles, Link, Eye, Brain, Zap, MessageCircle } from 'lucide-react';

import { EventNode, TagCenteredNode } from '@/types/EventGraph';
import { TagCenteredGraphData } from '@/types/EventGraph';
interface TagCenteredGraphProps {
  graphData: TagCenteredGraphData;
  className?: string;
  onEventClick?: (event: EventNode) => void;
  selectedEventId?: string;
}

/**
 * Enhanced fallback visualization with modern styling and animations
 */
const FallbackVisualization = ({ 
  graphData, 
  onEventClick, 
  selectedEventId 
}: { 
  graphData: TagCenteredGraphData;
  onEventClick?: (event: EventNode) => void;
  selectedEventId?: string;
}) => {
  const events = graphData.nodes.filter((n: TagCenteredNode) => n.type === 'event');
  
  return (
    <div className="w-full min-h-[800px] bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/20 flex flex-col items-center justify-start py-12 px-8 relative overflow-visible">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5"></div>
      <div className="absolute top-8 left-8 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-8 right-8 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl">
        {/* Enhanced header with AI branding */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <h3 className="text-3xl md:text-4xl font-bold text-white">
              AI-Discovered Vibe Match
            </h3>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white px-10 py-6 rounded-3xl text-2xl md:text-3xl font-bold shadow-2xl border border-purple-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20 rounded-3xl blur-xl"></div>
            <div className="relative flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <span>#{graphData.centralTag}</span>
                <Sparkles className="w-6 h-6" />
              </div>
              
              {/* Similar tags */}
              {graphData.similarTags && graphData.similarTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {graphData.similarTags.map((tag, index) => (
                    <span 
                      key={`similar-tag-${index}-${tag}`} 
                      className="text-sm bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 backdrop-blur-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-300 mt-4 text-lg">
            Central concept discovered by LLaMA AI semantic analysis
          </p>
        </div>
        
        {/* Enhanced connection indicator */}
        <div className="flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
          <Link className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">Showing {events.length} semantically connected events</span>
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        
        {/* Enhanced events grid with staggered animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-7xl">
          {events.map((node: TagCenteredNode, index: number) => {
            const event = node.data as EventNode;
            const isSelected = selectedEventId === event.id;
            
            return (
              <div 
                key={node.id}
                onClick={() => onEventClick?.(event)}
                className={`
                  group relative transition-all duration-500 backdrop-blur-sm hover:shadow-2xl rounded-2xl text-center overflow-hidden cursor-pointer
                  ${onEventClick ? 'hover:scale-110' : 'hover:scale-105'}
                  ${isSelected 
                    ? "bg-gradient-to-br from-blue-600/30 via-purple-500/20 to-blue-600/30 border-2 border-blue-400/80 shadow-lg shadow-blue-500/40 ring-2 ring-blue-400/60" 
                    : "bg-gradient-to-br from-green-600/25 via-emerald-500/15 to-teal-600/25 border border-green-500/40 hover:shadow-green-500/30"
                  }
                  text-white px-6 py-6
                `}
              >
                {/* Selected for chat indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                    <MessageCircle className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className={`
                  absolute inset-0 rounded-2xl transition-all duration-500
                  ${isSelected 
                    ? "bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-blue-600/15" 
                    : "bg-gradient-to-br from-green-600/0 via-emerald-600/0 to-teal-600/0 group-hover:from-green-600/15 group-hover:via-emerald-600/10 group-hover:to-teal-600/15"
                  }
                `}></div>
                
                <div className="relative z-10">
                  <div className={`
                    font-bold text-base md:text-lg mb-3 leading-tight transition-colors
                    ${isSelected ? "text-blue-100" : "group-hover:text-green-100"}
                  `}>
                    {event.title}
                  </div>
                  {/* <div className="text-xs text-green-200 opacity-90 mb-3 flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    {event.date}
                  </div> */}
                  
                  {/* Event details section - replacing tags */}
                  <div className="mt-3 space-y-2 text-xs">
                    {/* Brief description - exactly 3 lines */}
                    {event.description && (
                      <div className={`
                        text-left leading-relaxed h-12 flex items-start
                        ${isSelected ? "text-blue-100" : "text-green-100"}
                      `}>
                        <div className="line-clamp-3">
                          {event.description}
                        </div>
                      </div>
                    )}
                    
                    {/* Date */}
                    {event.date && (
                      <div className={`
                        flex items-center gap-1 justify-center
                        ${isSelected ? "text-blue-200" : "text-green-200"}
                      `}>
                        <span className="font-medium">📅</span>
                        <span>{event.date}</span>
                      </div>
                    )}
                    
                    {/* Location/Borough */}
                    {event.neighborhood && (
                      <div className={`
                        flex items-center gap-1 justify-center
                        ${isSelected ? "text-blue-200" : "text-green-200"}
                      `}>
                        <span className="font-medium">📍</span>
                        <span>{event.neighborhood}</span>
                      </div>
                    )}
                    
                    {/* Event URL */}
                    {event.url && (
                      <div className="flex justify-center mt-2">
                        <a 
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`
                            px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105
                            ${isSelected 
                              ? "bg-blue-500/30 border-blue-400/50 text-blue-100 hover:bg-blue-500/40" 
                              : "bg-white/20 border-white/30 hover:bg-white/30"
                            }
                          `}
                        >
                          🔗 View Event
                        </a>
                      </div>
                    )}
                    
                    {/* Main category tag - moved after View Event button */}
                    {event.category && (
                      <div className="flex justify-center mt-2">
                        <div className={`
                          text-xs px-3 py-1 rounded-full inline-block border font-semibold
                          ${isSelected 
                            ? "bg-blue-500/30 border-blue-400/50 text-blue-100" 
                            : "bg-white/20 border-white/30"
                          }
                        `}>
                          {event.category}
                        </div>
                      </div>
                    )}
                    
                    {/* Subtle tags section */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mt-2 opacity-60">
                        {event.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                          <span 
                            key={`event-${event.id}-tag-${tagIndex}-${tag}`} 
                            className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/80"
                          >
                            #{tag}
                          </span>
                        ))}
                        {event.tags.length > 2 && (
                          <span className="text-xs text-white/60">
                            +{event.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`
                    absolute inset-0 rounded-2xl blur-xl
                    ${isSelected 
                      ? "bg-gradient-to-r from-blue-400/20 to-purple-400/20" 
                      : "bg-gradient-to-r from-green-400/20 to-emerald-400/20"
                    }
                  `}></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Enhanced description with AI branding */}
        <div className="mt-12 text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-blue-400" />
            <h4 className="text-xl font-bold text-white">AI Semantic Analysis</h4>
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-gray-300 leading-relaxed mb-3">
            Our LLaMA AI analyzed your vibe description and identified <span className="font-semibold text-purple-300">"{graphData.centralTag}"</span> as the central concept that best matches your request.
          </p>
          <p className="text-gray-400 text-sm">
            Each connected event shares semantic similarity with your desired vibe, creating a personalized discovery experience.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced tag-centered graph component with improved styling and animations
 * Shows a central tag node with event nodes radiating out from it
 */
export const TagCenteredGraph = ({ 
  graphData,
  className = "w-full rounded-3xl border bg-card",
  onEventClick,
  selectedEventId
}: TagCenteredGraphProps) => {
  const [mounted, setMounted] = useState(false);

  // Use effect to safely handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render the same structure to avoid hydration mismatch
  // Only show loading during actual loading states, not during hydration
  if (!mounted) {
    // Render the same structure as the main component to avoid hydration issues
    return (
      <div className="space-y-8">
        <div className="w-full min-h-[800px] bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/20 flex flex-col items-center justify-center py-12 px-8">
          <div className="flex flex-col items-center gap-6 text-gray-300">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-600 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <p className="font-bold text-xl">Loading Visualization...</p>
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400">Preparing your personalized event graph</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FallbackVisualization graphData={graphData} onEventClick={onEventClick} selectedEventId={selectedEventId} />
      
      {/* Enhanced legend with AI branding */}
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-4xl">
          <h4 className="text-white font-bold mb-6 text-center text-xl flex items-center justify-center gap-3">
            <Eye className="w-6 h-6 text-purple-400" />
            AI Visualization Guide
            <Brain className="w-6 h-6 text-blue-400" />
          </h4>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-full border-2 border-purple-400/50 shadow-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-white block">Central Tag(s):</span>
                <span className="text-gray-300">"{graphData.centralTag}" (AI-discovered)</span>
                {graphData.similarTags && graphData.similarTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {graphData.similarTags.map((tag, index) => (
                      <span 
                        key={`similar-tag-${index}-${tag}`} 
                        className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded-full border border-purple-400/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl border-2 border-green-500/50 shadow-lg flex items-center justify-center">
                <Link className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-white block">Connected Events:</span>
                <span className="text-gray-300">({graphData.nodes.filter((n: TagCenteredNode) => n.type === 'event').length}) semantically related</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400 leading-relaxed flex items-center justify-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>
                🎯 Powered by LLaMA AI • Each event connection represents semantic similarity to your desired vibe • 
                Results improve with more descriptive queries
              </span>
              <Zap className="w-4 h-4 text-blue-400" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 