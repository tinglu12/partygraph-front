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
  const [selectedEvent, setSelectedEvent] = useState<EventNode | null>(null);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filteredEdges, setFilteredEdges] = useState(edges);

  useEffect(() => {
    if (!containerRef.current) return;

    // Use provided data or fallback to props
    const graphEvents = data?.nodes || filteredEvents;
    const graphEdges = data?.edges || filteredEdges;

    const cy = initializeCytoscape(containerRef.current, graphEvents, graphEdges);

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
      cy.destroy();
    };
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
