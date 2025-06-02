import { searchEvent, classifyImage } from "@/server/LamService";
import {
  plexEnrichEvents,
  plexSearchEvent,
  plexSearchMany,
} from "@/server/PerplxService";
import { EventType } from "@/types/EventType";
import LlamaAPIClient from "llama-api-client";
import fs from "fs";
import { techWeekEvents } from "./data/tech-week";
import { techWeekAll } from "./data/raw/tech-week-all";
import { safeName } from "@/lib/utils";
import { sampleEvents } from "@/constants/sampleEvents";

const client = new LlamaAPIClient({
  apiKey: process.env["LLAMA_API_KEY"], // This is the default and can be omitted
});

async function main() {
  const cmd = process.argv[2];
  switch (cmd) {
    case "plex":
      await plexTest();
      break;
    case "plex-many":
      await plexManyTest();
      break;
    case "tech-week":
      await techWeekFormat();
      break;
    case "enrich-events":
      await enrichEvents();
      break;
    case "dedupe":
      await dedupeEvents();
      break;
    case "classify-image":
      // Pass the image path from the command line
      const imagePath = process.argv[3];
      if (!imagePath) {
        console.error("Please provide an image path.");
        process.exit(1);
      }
      const result = await classifyImage(imagePath);
      console.log("classifyImage result", result);
      break;
    case "search":
  }
}

async function plexTest() {
  const filter: string = "launch party";
  const events: EventType[] = [
    {
      title: "launch party",
      description:
        "We are launching a new product and we want to celebrate with a party.",
    },
  ];
  const result = await plexSearchEvent(filter);
  console.log("searchEvent result", { filter, result });
  return result;
}

async function plexManyTest() {
  const result = await plexSearchMany();
  console.log("plexManyTest result", { result });
  fs.writeFileSync(
    "./public/scraped/plex-many.json",
    JSON.stringify(result, null, 2)
  );

  return result;
}

async function techWeekFormat() {
  const raw = await techWeekAll;
  const out = raw.map((event) => {
    const item = {
      id: safeName(event.Title),
      title: event.Title,
      description: event.Title,
      neighborhood: event.Location,
      tags: ["nytechweek"],
      keywords: ["nytechweek"],
      category: "nytechweek",
      url: event.URL,
      date: `${event.Day} ${event.Time}`,
    };
    return item;
  });
  console.log("techWeekTest result", { out });

  fs.writeFileSync(
    "./public/scraped/tech-week-all.json",
    JSON.stringify(out, null, 2)
  );

  return out;
}

async function enrichEvents() {
  const maxEvents = 2;
  const events = await sampleEvents;
  const selected = events
    .filter((event) => event.category === "nytechweek")
    .slice(0, maxEvents);

  const enriched = await plexEnrichEvents(selected);
  console.log("enrichedEvents result", { enriched });
  fs.writeFileSync(
    "./public/scraped/enriched-events.json",
    JSON.stringify(enriched, null, 2)
  );
  return enriched;
}

async function dedupeEvents() {
  const events = await sampleEvents;
  const unique = events.filter(
    (event, index, self) => index === self.findIndex((t) => t.id === event.id)
  );
  console.log("dedupeEvents result", {
    before: events.length,
    unique: unique.length,
  });
  fs.writeFileSync(
    "./public/scraped/deduped-events.json",
    JSON.stringify(unique, null, 2)
  );
  return unique;
}

async function searchEventTest() {
  const filter: string = "launch party";
  const events: EventType[] = [
    {
      title: "launch party",
      description:
        "We are launching a new product and we want to celebrate with a party.",
    },
    {
      title: "restaurant dinner",
      description: "a nice dinner at a restaurant",
    },
  ];
  const result = await searchEvent(filter, events);
  console.log("searchEvent result", { filter, result });
  return result;
}

async function lamTest() {
  const model = "Llama-4-Maverick-17B-128E-Instruct-FP8";

  const event = `
  Party: launch party for new product
  Date: 2025-06-01
  Location: 123 Main St, Anytown, USA
  Description: We are launching a new product and we want to celebrate with a party.
  Attendees: 100
  Cost: $1000
  Budget: $1000
  `;

  const prompt = `
  You are a helpful assistant.
  Categorize the following event into one of the following categories:
  - "party"
  - "event"
  - "other"

  Do not include any other text in your response, just the category.

  Event: ${event}
  `;

  const createChatCompletionResponse = await client.chat.completions.create({
    messages: [{ content: prompt, role: "user" }],
    model: model,
  });
  const content = createChatCompletionResponse.completion_message?.content;
  console.log("Llama classifyImage raw content:", content);

  let result;
  try {
    // If content is an object with a 'text' property, use that
    let text = typeof content === "string" ? content : content?.text;
    if (!text) throw new Error("No text content in Llama API response");

    // Try to extract JSON from a code block
    const match =
      text.match(/```json\\s*([\\s\\S]*?)```/i) ||
      text.match(/```([\\s\\S]*?)```/i);
    const jsonString = match ? match[1] : text;

    result = JSON.parse(jsonString);
  } catch (e) {
    throw new Error("Failed to parse Llama API response as JSON");
  }
  return result;
}

(async () => {
  await main();
})();
