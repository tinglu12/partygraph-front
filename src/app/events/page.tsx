"use client";

import { useEffect, useState } from "react";
import { EventType } from "@/types/EventType";
import { EventsList } from "@/components/EventsList";

// Wrapper component that fetches EventType data from API
// and passes it to the unified EventsList component
function EventsWrapper() {
  const [eventData, setEventData] = useState<EventType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching EventType data from people API
        // const response = await fetch("/api/events/tags");
        const response = await fetch("/api/events/people");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const _eventData = await response.json();
        setEventData(_eventData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!eventData) return <div>No data available</div>;

  // Pass the EventType data to the unified EventsList component
  // The unified component will automatically detect it's EventType and render appropriately
  return <EventsList events={eventData} title="Events" />;
}

export default function Events() {
  return (
    <div className="p-4">
      <EventsWrapper />
    </div>
  );
}
