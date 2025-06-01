import { getCategory, getPeople } from "@/server/LamService";
import { EventPerson } from "@/types/EventPerson";
import { EventType } from "@/types/EventType";
import { NextResponse } from "next/server";

export async function GET() {
  const event: EventType = {
    title: "launch party",
    tags: {},
    description:
      "We are launching a new product and we want to celebrate with a party.",
  };
  const people: EventPerson[] = await getPeople(event);
  event.people = people;
  console.log("event people", { event, people });
  return NextResponse.json([event]);
}
