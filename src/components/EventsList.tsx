"use client";
import { EventNode } from '@/lib/sampleData';

interface EventsListProps {
  events: EventNode[];
  highlightedIds?: string[];
}

/**
 * Simple list view of events as a fallback when graph fails
 * Shows events in a clean, readable format
 */
export const EventsList = ({ events, highlightedIds = [] }: EventsListProps) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No events to display</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const isHighlighted = highlightedIds.includes(event.id);
        
        return (
          <div 
            key={event.id}
            className={`
              rounded-lg p-4 border transition-all
              ${isHighlighted 
                ? 'bg-purple-600/20 border-purple-400 shadow-lg' 
                : 'bg-white/10 border-white/20 hover:bg-white/15'
              }
            `}
          >
            <h4 className="text-lg font-semibold text-white mb-2">
              {event.title}
            </h4>
            
            <p className="text-gray-300 text-sm mb-3">
              {event.description}
            </p>
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {event.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-blue-600/30 text-blue-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Event details */}
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{event.date}</span>
              {event.category && (
                <span className="bg-white/10 px-2 py-1 rounded text-xs">
                  {event.category}
                </span>
              )}
            </div>
            
            {/* Connections indicator */}
            {event.connections && event.connections.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Connected to {event.connections.length} other event{event.connections.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}; 