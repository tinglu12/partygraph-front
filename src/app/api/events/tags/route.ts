import { sampleEvents } from "@/constants/sampleEvents";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query: string | null = searchParams.get("query");
  console.log('query', query);
  if (!query) {
    console.error("No query provided");
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }

  const found = sampleEvents
    .filter((e) => e.tags?.includes(query))
    .slice(0, 4); // Limit to 4 results

  console.log("events found", { query, found });
  return NextResponse.json(found);
}
