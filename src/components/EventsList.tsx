"use client";
import { EventNode } from '@/lib/sampleData';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

interface EventsListProps {
  events: EventNode[];
  highlightedIds?: string[];
}

/**
 * Enhanced list view of events with improved styling and visual elements
 * Shows events in a clean, modern card format with better visual hierarchy
 */
export const EventsList = ({ events, highlightedIds = [] }: EventsListProps) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/10">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium">No events to display</p>
          <p className="text-sm text-gray-500 mt-2">Try a different search term</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const isHighlighted = highlightedIds.includes(event.id);
        
        return (
          <div 
            key={event.id}
            className={`
              group relative rounded-2xl p-6 border transition-all duration-300 backdrop-blur-sm hover:scale-[1.02] hover:shadow-2xl
              ${isHighlighted 
                ? 'bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-blue-600/20 border-purple-400/50 shadow-lg shadow-purple-500/20' 
                : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
              }
            `}
          >
            {/* Highlighted indicator */}
            {isHighlighted && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-lg"></div>
            )}
            
            {/* Event title with better typography */}
            <h4 className="text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors line-clamp-2">
              {event.title}
            </h4>
            
            {/* Event description with better spacing */}
            <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
              {event.description}
            </p>
            
            {/* Enhanced tags with better styling */}
            {event.tags && event.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400 font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-200 text-xs rounded-full border border-blue-500/20 backdrop-blur-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Enhanced event details with icons */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{event.date}</span>
              </div>
              
              {event.category && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-gray-300 border border-white/20">
                    {event.category}
                  </span>
                </div>
              )}
            </div>
            
            {/* Enhanced connections indicator */}
            {event.connections && event.connections.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-400 pt-3 border-t border-white/10">
                <Users className="w-3 h-3" />
                <span>
                  Connected to <span className="font-medium text-gray-300">{event.connections.length}</span> other event{event.connections.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/5 group-hover:to-blue-600/5 transition-all duration-300 pointer-events-none"></div>
          </div>
        );
      })}
    </div>
  );
}; 