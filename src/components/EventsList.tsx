"use client";

import { EventNode } from "@/types/EventGraph";
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

interface EventsListProps {
  events: EventNode[];
  highlightedIds?: string[];
  selectedEventId?: string;
  title?: string;
  subtitle?: string;
  onEventClick?: (event: EventNode) => void;
}

/**
 * Enhanced list view of events with beautiful styling and improved visual elements
 * Shows events in modern, interactive cards with rich visual hierarchy
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
          const isHighlighted = highlightedIds.includes(event.id);
          const isSelected = selectedEventId === event.id;

          return (
            <div
              key={event.id}
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

              {/* Event category badge */}
              {event.category && (
                <div className="absolute top-6 right-6">
                  <span className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30 backdrop-blur-sm">
                    {event.category}
                  </span>
                </div>
              )}

              {/* Event title with enhanced typography */}
              <div className="mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors leading-tight">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
              </div>

              {/* Event description with better formatting */}
              <p className="text-gray-300 text-sm mb-6 leading-relaxed line-clamp-3 group-hover:text-gray-200 transition-colors">
                {event.description}
              </p>

              {/* Enhanced tags section */}
              {event.tags && event.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      Tags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gradient-to-r from-blue-600/25 to-purple-600/25 text-blue-200 text-xs rounded-full border border-blue-500/20 backdrop-blur-sm font-medium hover:scale-105 transition-transform cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced connections indicator */}
              {event.connections && event.connections.length > 0 && (
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

      {/* Enhanced footer stats */}
      {events.length > 0 && (
        <div className="text-center pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>{events.length} total events</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" />
              <span>
                {new Set(events.flatMap((e) => e.tags || [])).size} unique tags
              </span>
            </div>
            {highlightedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{highlightedIds.length} highlighted</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
