"use client";
import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { initializeCytoscape } from '@/lib/cytoscapeConfig';
import { EventNode, GraphData, sampleEvents, generateEdgesFromConnections } from '@/lib/sampleData';

interface GraphProps {
  data?: GraphData;
  events?: EventNode[];
  edges?: Array<{
    source: string;
    target: string;
    label: string;
  }>;
}

export const Graph = ({ 
  data,
  events = sampleEvents, 
  edges = generateEdgesFromConnections(sampleEvents)
}: GraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup function to destroy previous cytoscape instance
    const cleanup = () => {
      if (cyRef.current) {
        try {
          cyRef.current.destroy();
        } catch (err) {
          console.warn('Error destroying cytoscape instance:', err);
        }
        cyRef.current = null;
      }
    };

    // Initialize cytoscape when container is ready
    const initGraph = async () => {
      if (!containerRef.current) {
        console.warn('Container not ready yet');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Small delay to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if container still exists (component might have unmounted)
        if (!containerRef.current) {
          return;
        }

        // Use provided data or fallback to props
        const graphEvents = data?.nodes || events;
        const graphEdges = data?.edges || edges;

        // Validate data
        if (!graphEvents || graphEvents.length === 0) {
          setError('No events to display');
          setIsLoading(false);
          return;
        }

        // Initialize cytoscape
        const cy = initializeCytoscape(containerRef.current, graphEvents, graphEdges);
        cyRef.current = cy;

        // Handle any cytoscape errors
        cy.on('error', (evt) => {
          console.error('Cytoscape error:', evt);
          setError('Graph rendering error');
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing cytoscape:', err);
        setError('Failed to initialize graph');
        setIsLoading(false);
      }
    };

    // Cleanup previous instance
    cleanup();

    // Initialize with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initGraph, 50);

    // Cleanup on unmount or dependency change
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [data, events, edges]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-[600px] rounded-lg border bg-card flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading graph...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-[600px] rounded-lg border bg-card flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="mb-2 text-lg font-semibold">Graph Error</div>
          <div className="text-sm">{error}</div>
          <button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[600px] rounded-lg border bg-card"
      style={{ minHeight: '600px' }}
    />
  );
};
