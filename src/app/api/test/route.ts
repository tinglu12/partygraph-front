import { EventType } from "@/types/EventType";
import { NextResponse } from "next/server";

export async function GET() {
  const events: EventType[] = [
    {
      name: "event 1",
      date: new Date().toISOString(),
      location: "venue 1",
      description: "description 1",
      attendees: 100,
      cost: 100,
      budget: 100,
      tags: ["party", "bar"],
    },
    {
      name: "event 2",
      date: new Date().toISOString(),
      location: "venue 2",
      description: "description 2",
      attendees: 200,
      cost: 200,
      budget: 200,
      tags: ["party", "music"],
    },
  ];

  return NextResponse.json(events);
}
