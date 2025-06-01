// import { getCategory } from "@/server/LamService";
// import { EventType } from "@/types/EventType";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const event: EventType = {
//     title: "launch party",
//     tags: {},
//     description:
//       "We are launching a new product and we want to celebrate with a party.",
//   };
//   const category = await getCategory(event);
//   const tags = {
//     type: [category],
//   };
//   event.tags = tags;
//   console.log("event categorized", { category, event });
//   return NextResponse.json([event]);
// }
