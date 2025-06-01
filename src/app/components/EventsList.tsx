"use client";

import { useEffect, useState } from "react";
import { EventType } from "@/types/EventType";

export default function EventsList() {
  const [eventData, setEventData] = useState<EventType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  return (
    <div className="p-4">
      <div className="space-y-2">
        <ul className="list-disc pl-5">
          {eventData.map((event) => (
            <div key={event.title}>
              <p>{event.title}</p>
              <p>{event.description}</p>
              <p>type: {event.tags?.type?.join(", ")}</p>
              <p>keywords: {event.keywords?.join(", ")}</p>
              <p>people.names: {event.people?.map((p) => p.name).join(", ")}</p>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
