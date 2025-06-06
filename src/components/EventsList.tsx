"use client";

import { EventNode } from "@/types/EventGraph";
import { EventType } from "@/types/EventType";
import {
  Calendar,
  // MapPin,
  Users,
  Tag,
  Sparkles,
  Clock,
  Star,
  MessageCircle,
} from "lucide-react";
import {
  convertDayOfWeekToDate,
  isDayOfWeekFormat,
} from "@/utils/dateConversion";

// Union type to handle both EventNode and EventType
type UnifiedEvent = EventNode | EventType;

// Type guard to check if event is EventNode
function isEventNode(event: UnifiedEvent): event is EventNode {
  return 'connections' in event;
}

// Helper to get event ID
function getEventId(event: UnifiedEvent): string {
  if (isEventNode(event)) {
    return event.id;
  }
  return event.id || event.title; // Fallback to title if no ID
}

// Helper to get event URL
function getEventUrl(event: UnifiedEvent): string | undefined {
  if (isEventNode(event)) {
    return event.url;
  }
  return event.link;
}

// Helper to format event date display
function formatEventDate(event: UnifiedEvent): string {
  try {
    // Handle events with dates array (new flexible format)
    if (event.dates && event.dates.length > 0) {
      // Sort dates to show range properly
      const sortedDates = event.dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
      
      if (sortedDates.length === 1) {
        // Single date
        return sortedDates[0].toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      } else if (sortedDates.length === 2) {
        // Two dates - show as range
        const startStr = sortedDates[0].toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        const endStr = sortedDates[1].toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        return `${startStr} - ${endStr}`;
      } else {
        // Multiple dates - show first and last with count
        const startStr = sortedDates[0].toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        const endStr = sortedDates[sortedDates.length - 1].toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        return `${startStr} - ${endStr} (${sortedDates.length} dates)`;
      }
    }
    
    // Fallback to original date field
    if (event.date) {
      // Check if it's a day-of-week format that can be converted
      if (isDayOfWeekFormat(event.date)) {
        const convertedDate = convertDayOfWeekToDate(event.date);
        if (convertedDate) {
          const eventDate = new Date(convertedDate);
          const timeInfo = event.date.match(/(\d{1,2}:\d{2}\s*(AM|PM))/i);
          const timeStr = timeInfo ? timeInfo[1] : '';
          
          return eventDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          }) + (timeStr ? ` at ${timeStr}` : '');
        }
      }
      
      // Try to parse the date if it's a proper date string
      if (event.date.includes('-') || event.date.includes('/')) {
        const eventDate = new Date(event.date);
        if (!isNaN(eventDate.getTime())) {
          return eventDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          });
        }
      }
      
      // Return the original string if it's not parseable (fallback)
      return event.date;
    }
    
    return "Date TBA";
  } catch (error) {
    console.error('Error formatting event date:', error);
    return event.date || "Date TBA";
  }
}

interface EventsListProps {
  events: UnifiedEvent[];
  highlightedIds?: string[];
  selectedEventId?: string;
  title?: string;
  subtitle?: string;
  onEventClick?: (event: UnifiedEvent) => void;
}

/**
 * Enhanced list view of events with beautiful styling and improved visual elements
 * Shows events in modern, interactive cards with rich visual hierarchy
 * Supports both EventNode and EventType, including date ranges
 */
export const EventsList = ({
  events,
  highlightedIds = [],
  selectedEventId,
  title = "Events",
  subtitle,
  onEventClick,
}: EventsListProps) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-white/10">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
            <Calendar className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">No Events Found</h3>
          <p className="text-gray-400 leading-relaxed">
            We couldn't find any events matching your search. Try a different
            vibe or browse our available tags.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced header */}
      {(title || subtitle) && (
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            {title}
            <Sparkles className="w-8 h-8 text-blue-400" />
          </h2>
          {subtitle && (
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Star className="w-4 h-4" />
            <span>
              Showing {events.length} event{events.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Enhanced events grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const eventId = getEventId(event);
          const eventUrl = getEventUrl(event);
          const isHighlighted = highlightedIds.includes(eventId);
          const isSelected = selectedEventId === eventId;

          return (
            <div
              key={eventId}
              onClick={() => onEventClick?.(event)}
              className={`
                group relative rounded-3xl p-8 border transition-all duration-500 backdrop-blur-sm hover:scale-[1.02] hover:shadow-2xl
                ${onEventClick ? 'cursor-pointer' : ''}
                ${
                  isSelected
                    ? "bg-gradient-to-br from-green-600/30 via-emerald-500/20 to-green-600/30 border-green-400/60 shadow-lg shadow-green-500/25 ring-2 ring-green-400/50"
                    : isHighlighted
                    ? "bg-gradient-to-br from-purple-600/30 via-purple-500/20 to-blue-600/30 border-purple-400/60 shadow-lg shadow-purple-500/25"
                    : "bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:from-white/15 hover:to-white/10 hover:border-white/40"
                }
              `}
            >
              {/* Highlighted indicator */}
              {isHighlighted && (
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Selected for chat indicator */}
              {isSelected && (
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Event title with enhanced typography */}
              <div className="mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors leading-tight">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>{formatEventDate(event)}</span>
                </div>
              </div>

              {/* Event description with better formatting */}
              <p className="text-gray-300 text-sm mb-6 leading-relaxed h-16 flex items-start group-hover:text-gray-200 transition-colors">
                <span className="line-clamp-3">
                  {event.description}
                </span>
              </p>

              {/* Enhanced connections indicator for EventNode */}
              {isEventNode(event) && event.connections && event.connections.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-4 border-t border-white/10">
                  <Users className="w-4 h-4 text-green-400" />
                  <span>
                    Connected to{" "}
                    <span className="font-semibold text-green-300">
                      {event.connections.length}
                    </span>{" "}
                    other event{event.connections.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* People indicator for EventType */}
              {!isEventNode(event) && event.people && event.people.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-4 border-t border-white/10">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>
                    <span className="font-semibold text-blue-300">
                      {event.people.length}
                    </span>{" "}
                    featured {event.people.length === 1 ? 'person' : 'people'}
                  </span>
                </div>
              )}

              {/* Event URL */}
              {eventUrl && (
                <div className="flex justify-center mt-4 pt-4 border-t border-white/10">
                  <a 
                    href={eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-200 text-sm font-medium rounded-full border border-purple-500/30 backdrop-blur-sm hover:scale-105 hover:from-purple-600/40 hover:to-blue-600/40 transition-all duration-200"
                  >
                    🔗 View Event
                  </a>
                </div>
              )}

              {/* Enhanced tags section - moved after View Event button */}
              {event.tags && event.tags.length > 0 && (
                <div className="mb-4 mt-4">
                  <div className="flex flex-wrap justify-center gap-1 opacity-60">
                    {event.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={`event-${getEventId(event)}-tag-${tagIndex}-${tag}`}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/80"
                      >
                        #{tag}
                      </span>
                    ))}
                    {event.tags.length > 2 && (
                      <span className="text-xs text-white/60">
                        +{event.tags.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Hover effect overlay with gradient */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/0 via-blue-600/0 to-purple-600/0 group-hover:from-purple-600/5 group-hover:via-blue-600/5 group-hover:to-purple-600/5 transition-all duration-500 pointer-events-none"></div>

              {/* Interactive glow effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-xl"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced AI-powered suggestions footer */}
      <div className="text-center text-gray-400 mt-12 pt-8 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>
            Events matched using AI semantic analysis and tag similarity
          </span>
          <Sparkles className="w-4 h-4 text-blue-400" />
        </div>
      </div>
    </div>
  );
};
