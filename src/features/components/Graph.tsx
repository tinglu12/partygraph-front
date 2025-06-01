"use client";
import { EventNode, GraphData, sampleEvents, generateEdgesFromConnections } from '@/lib/sampleData';
import { EventDetails } from './EventDetails';
import { FilterBar } from './FilterBar';
import { useGraph } from '../hooks/useGraph';

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
  const {
    containerRef,
    selectedEvent,
    filteredEvents,
    filteredEdges,
    allTags,
    handleSearch,
    handleCategoryChange,
    setSelectedEvent
  } = useGraph({ data, events, edges });

  return (
    <div className="flex flex-col h-full">
      <FilterBar 
        events={events}
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
      />
      <div className="flex flex-1 h-full">
        <div 
          ref={containerRef} 
          className="flex-1 rounded-lg border bg-card w-full h-full"
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
