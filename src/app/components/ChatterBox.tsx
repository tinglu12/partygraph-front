"use client";

import { useEffect, useState } from "react";
import { EventType } from "@/types/EventType";

export default function ChatterBox() {
  const [eventData, setEventData] = useState<EventType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/events");
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
            <li key={event.name}>
              <h4>{event.name}</h4>
              <p>{event.description}</p>
              <p>{event.location}</p>
              <p>{event.date}</p>
              <p>{event.attendees}</p>
              <p>tags: {event.tags?.join(", ")}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
