import { sampleEvents } from "@/constants/sampleEvents";
import { NextResponse } from "next/server";

export function GET() {
  // Get all unique tags from sampleEvents
  const allTags = Array.from(
    new Set(sampleEvents.flatMap((event) => event.tags || []))
  );

  // Shuffle the tags array
  const shuffled = allTags.sort(() => 0.5 - Math.random());

  // Get first 4 tags (or all if less than 4)
  const randomTags = shuffled.slice(0, 4);

  console.log("Random tags selected:", randomTags);
  return NextResponse.json(randomTags);
} 