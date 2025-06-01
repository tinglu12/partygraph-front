"use client";
import { useEffect, useRef, useState } from 'react';
import { TagCenteredGraphData } from '@/lib/sampleData';

interface TagCenteredGraphProps {
  graphData: TagCenteredGraphData;
  className?: string;
}

/**
 * Simple fallback visualization when cytoscape fails
 */
const FallbackVisualization = ({ graphData }: { graphData: TagCenteredGraphData }) => {
  const events = graphData.nodes.filter(n => n.type === 'event');
  
  return (
    <div className="w-full h-[600px] bg-slate-800 rounded-lg border border-white/20 flex flex-col items-center justify-center p-8">
      <h3 className="text-2xl font-bold text-white mb-6">
        Events tagged with "{graphData.centralTag}"
      </h3>
      
      {/* Central tag */}
      <div className="bg-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-8 border-4 border-purple-800">
        {graphData.centralTag}
      </div>
      
      {/* Events around it */}
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {events.map((node) => {
          const event = node.data as any;
          return (
            <div 
              key={node.id}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-center border-2 border-green-800"
            >
              <div className="font-semibold text-sm">{event.title}</div>
            </div>
          );
        })}
      </div>
      
      <p className="text-gray-400 text-sm mt-6">
        Tag-centered visualization showing your vibe match
      </p>
    </div>
  );
};

/**
 * Tag-centered graph component
 * Shows a central tag node with event nodes radiating out from it
 */
export const TagCenteredGraph = ({ 
  graphData,
  className = "w-full h-[600px] rounded-lg border bg-card"
}: TagCenteredGraphProps) => {
  const [isClient, setIsClient] = useState(false);

  // Simple client-side check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server side
  if (!isClient) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>Preparing graph...</span>
        </div>
      </div>
    );
  }

  // Show fallback visualization immediately
  return (
    <div>
      <FallbackVisualization graphData={graphData} />
      
      {/* Legend */}
      <div className="mt-4 flex justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-2 text-center">Visualization Legend</h4>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded-full border border-purple-800"></div>
              <span className="text-gray-300">Central Tag: "{graphData.centralTag}"</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded border border-green-800"></div>
              <span className="text-gray-300">Related Events</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Your vibe search found events with the most similar tag
          </p>
        </div>
      </div>
    </div>
  );
}; 