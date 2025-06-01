"use client";
import { useEffect, useRef, useState } from 'react';
import { TagCenteredGraphData, TagCenteredNode, EventNode } from '@/lib/sampleData';
import { Sparkles, Link, Eye } from 'lucide-react';

interface TagCenteredGraphProps {
  graphData: TagCenteredGraphData;
  className?: string;
}

/**
 * Enhanced fallback visualization with modern styling and animations
 */
const FallbackVisualization = ({ graphData }: { graphData: TagCenteredGraphData }) => {
  const events = graphData.nodes.filter((n: TagCenteredNode) => n.type === 'event');
  
  return (
    <div className="w-full h-[700px] bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/20 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5"></div>
      <div className="absolute top-4 left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-4 right-4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
        {/* Enhanced header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Events tagged with
            </h3>
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl text-xl md:text-2xl font-bold shadow-lg border border-purple-500/30 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl"></div>
            <span className="relative">{graphData.centralTag}</span>
          </div>
        </div>
        
        {/* Connection lines indicator */}
        <div className="flex items-center gap-2 mb-6 text-gray-400">
          <Link className="w-4 h-4" />
          <span className="text-sm">Showing {events.length} connected events</span>
        </div>
        
        {/* Enhanced events grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {events.map((node: TagCenteredNode, index: number) => {
            const event = node.data as EventNode;
            return (
              <div 
                key={node.id}
                className="group bg-gradient-to-br from-green-600/20 via-green-500/10 to-emerald-600/20 border border-green-500/30 text-white px-6 py-4 rounded-xl text-center hover:scale-105 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/20 relative"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-emerald-600/0 group-hover:from-green-600/10 group-hover:to-emerald-600/10 rounded-xl transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="font-bold text-sm md:text-base mb-2 line-clamp-2">
                    {event.title}
                  </div>
                  <div className="text-xs text-green-200 opacity-80">
                    {event.date}
                  </div>
                  {event.category && (
                    <div className="mt-2 text-xs bg-white/10 px-2 py-1 rounded-full inline-block">
                      {event.category}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Enhanced description */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <p className="text-gray-300 text-sm font-medium">
              Tag-centered visualization showing your vibe match
            </p>
          </div>
          <p className="text-gray-400 text-xs max-w-md">
            The central tag represents the best match for your search, with all related events displayed around it
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
  className = "w-full rounded-2xl border bg-card"
}: TagCenteredGraphProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Client-side check with loading animation
  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced loading state
  if (!isClient || !isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center h-[700px] bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm`}>
        <div className="flex flex-col items-center gap-4 text-gray-300">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">Preparing visualization...</p>
            <p className="text-sm text-gray-400 mt-1">Building your vibe graph</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FallbackVisualization graphData={graphData} />
      
      {/* Enhanced legend with better styling */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-2xl">
          <h4 className="text-white font-bold mb-4 text-center text-lg flex items-center justify-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            Visualization Legend
          </h4>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border-2 border-purple-400/50 shadow-lg"></div>
              <span className="text-gray-300">
                <span className="font-semibold text-white">Central Tag:</span> "{graphData.centralTag}"
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded border-2 border-green-500/50 shadow-lg"></div>
              <span className="text-gray-300">
                <span className="font-semibold text-white">Related Events</span> ({graphData.nodes.filter((n: TagCenteredNode) => n.type === 'event').length})
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              🎯 Your vibe search found events with the most similar tag. Each event card shows how it connects to your desired vibe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 