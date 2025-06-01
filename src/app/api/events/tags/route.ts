import { sampleEvents } from "@/lib/sampleData";
import { getCategory } from "@/server/LamService";
import { EventType } from "@/types/EventType";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query: string | null = searchParams.get("query");
  if (!query) {
    console.error("No query provided");
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }

  const found = sampleEvents.filter((e) => e.tags?.includes(query));
  console.log("event found", { query, found });
  return NextResponse.json([found]);
}
