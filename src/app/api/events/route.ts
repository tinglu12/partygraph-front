import { getCategory } from "@/server/LamService";
import { EventType } from "@/types/EventType";
import { NextResponse } from "next/server";

export async function GET() {
  const event: EventType = {
    name: "launch party",
    description:
      "We are launching a new product and we want to celebrate with a party.",
  };
  const category = await getCategory(event);
  event.tags = [category];
  console.log("event categorized", { category, event });
  return NextResponse.json([event]);
}
