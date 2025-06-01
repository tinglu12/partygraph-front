import { getPeople } from "@/server/LamService";
import { EventPerson } from "@/types/EventPerson";
import { EventType } from "@/types/EventType";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query: string | null = searchParams.get("query");
  if (!query) {
    console.error("No query provided");
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }

  const event: EventType = {
    title: query,
    description: query,
  };
  const people: EventPerson[] = await getPeople(event);
  event.people = people;
  console.log("event people", { event, people });
  return NextResponse.json([event]);
}
