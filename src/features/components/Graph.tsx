"use client";
import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!containerRef.current) return;

    // Use provided data or fallback to props
    const graphEvents = data?.nodes || events;
    const graphEdges = data?.edges || edges;

    const cy = initializeCytoscape(containerRef.current, graphEvents, graphEdges);

    return () => {
      cy.destroy();
    };
  }, [data, events, edges]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[600px] rounded-lg border bg-card"
    />
  );
};
