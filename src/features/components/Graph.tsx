"use client";
import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { initializeCytoscape } from '@/lib/cytoscapeConfig';
import { EventNode, GraphData, sampleEvents, generateEdgesFromConnections } from '@/lib/sampleData';
import { EventDetails } from './EventDetails';
import { FilterBar } from './FilterBar';

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
  const [selectedEvent, setSelectedEvent] = useState<EventNode | null>(null);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filteredEdges, setFilteredEdges] = useState(edges);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;

    // Use provided data or fallback to props
    const graphEvents = data?.nodes || filteredEvents;
    const graphEdges = data?.edges || filteredEdges;

    const cy = initializeCytoscape(containerRef.current, graphEvents, graphEdges);
    cyRef.current = cy;

    // Add click handler for nodes
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const eventData = graphEvents.find(e => e.id === node.id());
      if (eventData) {
        setSelectedEvent(eventData);
      }
    });

    // Clear selection when clicking on background
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedEvent(null);
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []); // Only run on mount

  // Update graph when filtered data changes
  useEffect(() => {
    if (!cyRef.current) return;

    const graphEvents = data?.nodes || filteredEvents;
    const graphEdges = data?.edges || filteredEdges;

    // Remove existing elements
    cyRef.current.elements().remove();

    // Add new elements
    cyRef.current.add(graphEvents.map(event => ({
      group: 'nodes',
      data: {
        id: event.id,
        title: event.title,
        date: event.date,
        description: event.description
      }
    })));

    cyRef.current.add(graphEdges.map(edge => ({
      group: 'edges',
      data: {
        source: edge.source,
        target: edge.target,
        label: edge.label
      }
    })));

    // Run layout
    cyRef.current.layout({
      name: 'cose-bilkent',
      idealEdgeLength: 250,
      nodeOverlap: 100,
      refresh: 20,
      fit: true,
      padding: 100,
      randomize: true,
      componentSpacing: 400,
      nodeRepulsion: 1000000,
      edgeElasticity: 400,
      nestingFactor: 0.1,
      gravity: 0.1,
      numIter: 5000,
      initialTemp: 2000,
      coolingFactor: 0.99,
      minTemp: 1.0,
      quality: 'proof'
    } as any).run();
  }, [data, filteredEvents, filteredEdges]);

  const handleSearch = (query: string) => {
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredEvents(filtered);
    setFilteredEdges(generateEdgesFromConnections(filtered));
  };

  const handleCategoryChange = (category: string) => {
    const filtered = category 
      ? events.filter(event => event.category === category)
      : events;
    setFilteredEvents(filtered);
    setFilteredEdges(generateEdgesFromConnections(filtered));
  };

  return (
    <div className="flex flex-col h-[600px]">
      <FilterBar 
        events={events}
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
      />
      <div className="flex flex-1">
        <div 
          ref={containerRef} 
          className="flex-1 rounded-lg border bg-card"
        />
        {selectedEvent && (
        <div className="absolute top-0 right-0 h-full w-[350px] z-50 bg-background/95 shadow-lg">
            <EventDetails 
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            />
        </div>
        )}
      </div>
    </div>
  );
};
