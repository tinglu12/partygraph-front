"use client";
import { useEffect, useState } from 'react';
import { TagCenteredGraphData, TagCenteredNode, EventNode } from '@/lib/sampleData';
import { Sparkles, Link, Eye, Brain, Zap } from 'lucide-react';

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
    <div className="w-full h-[800px] bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/20 flex flex-col items-center justify-center p-8 relative overflow-hidden">
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
            <div className="relative flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6" />
              <span>#{graphData.centralTag}</span>
              <Sparkles className="w-6 h-6" />
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
            return (
              <div 
                key={node.id}
                className="group bg-gradient-to-br from-green-600/25 via-emerald-500/15 to-teal-600/25 border border-green-500/40 text-white px-6 py-6 rounded-2xl text-center hover:scale-110 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-green-500/30 relative overflow-hidden cursor-pointer"
              >
                {/* Event number indicator */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-lg">
                  {index + 1}
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 via-emerald-600/0 to-teal-600/0 group-hover:from-green-600/15 group-hover:via-emerald-600/10 group-hover:to-teal-600/15 rounded-2xl transition-all duration-500"></div>
                
                <div className="relative z-10">
                  <div className="font-bold text-base md:text-lg mb-3 leading-tight group-hover:text-green-100 transition-colors">
                    {event.title}
                  </div>
                  <div className="text-xs text-green-200 opacity-90 mb-3 flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    {event.date}
                  </div>
                  {event.category && (
                    <div className="mt-3 text-xs bg-white/20 px-3 py-1 rounded-full inline-block border border-white/30 font-semibold">
                      {event.category}
                    </div>
                  )}
                  {event.tags && event.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {event.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-green-500/30 text-green-100 px-2 py-1 rounded-full border border-green-400/30">
                          #{tag}
                        </span>
                      ))}
                      {event.tags.length > 3 && (
                        <span className="text-xs text-green-200">+{event.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl"></div>
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
  className = "w-full rounded-3xl border bg-card"
}: TagCenteredGraphProps) => {
  const [mounted, setMounted] = useState(false);

  // Use effect to safely handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state only during SSR
  if (!mounted) {
    return (
      <div className={`${className} flex items-center justify-center h-[800px] bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm`}>
        <div className="flex flex-col items-center gap-6 text-gray-300">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-600 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-purple-400" />
              <p className="font-bold text-xl">AI Processing Your Vibe...</p>
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">LLaMA is analyzing semantic patterns and building your personalized graph</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FallbackVisualization graphData={graphData} />
      
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
                <span className="font-semibold text-white block">Central Tag:</span>
                <span className="text-gray-300">"{graphData.centralTag}" (AI-discovered)</span>
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