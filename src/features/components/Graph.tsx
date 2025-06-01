"use client";
import { useState } from "react";
import { generateEdgesFromConnections } from "@/lib/sampleData";
import { sampleEvents } from "@/constants/sampleEvents-v1";
import { EventDetails } from "./EventDetails";
import { FilterBar } from "./FilterBar";
import { useGraph } from "../hooks/useGraph";
import { X, Pin, RotateCcw } from "lucide-react";
import { safeName } from "@/lib/utils";
import { GraphData } from "@/types/EventGraph";

import { EventNode } from "@/types/EventGraph";
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
}: // events = sampleEvents,
// edges = generateEdgesFromConnections(sampleEvents),
GraphProps) => {
  const {
    containerRef,
    selectedEvent,
    filteredEvents,
    filteredEdges,
    allTags,
    handleSearch,
    handleCategoryChange,
    setSelectedEvent,
    resetView,
  } = useGraph({ data });

  const [pinnedEvents, setPinnedEvents] = useState<EventNode[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Handle pinning an event
  const handlePinEvent = (event: EventNode) => {
    if (!pinnedEvents.find((e) => e.id === event.id)) {
      setPinnedEvents((prev) => [...prev, event]);
      setActiveTab(event.id);
    }
  };

  // Handle unpinning an event
  const handleUnpinEvent = (eventId: string) => {
    setPinnedEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (activeTab === eventId) {
      const remaining = pinnedEvents.filter((e) => e.id !== eventId);
      setActiveTab(
        remaining.length > 0 ? remaining[remaining.length - 1].id : null
      );
    }
  };

  // Get the currently displayed event (either selected or active pinned)
  const displayedEvent = activeTab
    ? pinnedEvents.find((e) => e.id === activeTab)
    : selectedEvent;

  const isPinned = displayedEvent
    ? pinnedEvents.some((e) => e.id === displayedEvent.id)
    : false;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative h-[calc(100%-48px)]">
        <div
          ref={containerRef}
          className="absolute inset-0 rounded-lg border bg-card h-full w-full"
        />

        {/* Reset View Button */}
        <button
          onClick={resetView}
          className="absolute top-4 right-4 z-30 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-lg text-gray-300 hover:text-white transition-all duration-200 shadow-lg"
          title="Reset view to show all nodes"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Tab Navigation for Pinned Events */}
        {pinnedEvents.length > 0 && (
          <div className="absolute top-0 left-0 w-[400px] z-40 bg-gradient-to-r from-slate-900/90 via-purple-900/80 to-slate-900/90 backdrop-blur-xl border-r border-white/20 rounded-tl-lg">
            <div className="flex items-center gap-1 p-2 overflow-x-auto">
              <div className="flex items-center gap-1 mr-2 text-xs text-gray-400">
                <Pin className="w-3 h-3" />
                <span>Pinned:</span>
              </div>
              {pinnedEvents.map((event) => (
                <div key={event.id} className="flex items-center">
                  <button
                    onClick={() => setActiveTab(event.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === event.id
                        ? "bg-purple-600/40 text-white border border-purple-400/50"
                        : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20"
                    }`}
                  >
                    {event.title.length > 20
                      ? `${event.title.slice(0, 20)}...`
                      : event.title}
                  </button>
                  <button
                    onClick={() => handleUnpinEvent(event.id)}
                    className="ml-1 p-1 rounded-full bg-white/10 hover:bg-red-500/30 text-gray-400 hover:text-red-300 transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Details Panel */}
        {(selectedEvent || activeTab) && displayedEvent && (
          <div
            className={`absolute left-0 h-full w-[400px] z-50 ${
              pinnedEvents.length > 0 ? "top-[2.875rem]" : "top-0"
            }`}
          >
            <EventDetails
              event={displayedEvent}
              onClose={() => {
                if (activeTab) {
                  setActiveTab(null);
                } else {
                  setSelectedEvent(null);
                }
              }}
              onPin={handlePinEvent}
              isPinned={isPinned}
              hasTabNavigation={pinnedEvents.length > 0}
            />
          </div>
        )}
      </div>
    </div>
  );
};
