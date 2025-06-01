"use server";

import { cleanTags, safeName } from "@/lib/utils";
import { EventType } from "@/types/EventType";
import axios from "axios";

class PerplexityService {
  private apiKey: string;
  private model: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env["PERPLEXITY_API_KEY"] ?? "";
    // this.model = "pplx-70b-online";
    this.model = "sonar";
    this.apiUrl = "https://api.perplexity.ai/chat/completions";
    if (!this.apiKey) {
      throw new Error("PERPLEXITY_API_KEY not set in environment");
    }
  }

  async searchEvent(query: string, count = 2): Promise<any[]> {
    const prompt = `
    Find ${count} events of type: ${query} in New York City in the next 30 days.
    return ${count} items as a JSON array of objects.

    DO not add any other text to the response.
    Do not add backticks or \`\`\` json to the response.
    `;

    // const categories = [
    //   "music",
    //   "art",
    //   "food",
    //   "drink",
    //   "party",
    //   "launch party",
    // ];
    // const categoriesString = categories.join(", ");

    const schema = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: {
                type: "string",
                description:
                  "a short description of the event, 1-2 sentences, no more than 100 words",
              },
              tags: {
                type: "array",
                items: {
                  type: "string",
                  description:
                    "a list of common tags associated with the event must be lowercase",
                },
              },
              url: {
                type: "string",
                description:
                  "the original url of the event, must be a valid url",
              },
              date: {
                type: "string",
                description: "the date of the event, must be a valid date",
              },
              venue: {
                type: "string",
                description: "the venue of the event",
              },
              neighborhood: {
                type: "string",
                description: "which small neighborhood of the city",
              },
              // category: {
              //   type: "string",
              //   description: `the category of the event, one of ${categoriesString} `,
              // },
              keywords: {
                type: "array",
                items: {
                  type: "string",
                  description:
                    "a list of unique keywords from the event description",
                },
              },
              // required: [
              //   "title",
              //   "tags",
              // "description",
              // "url",
              // "date",
              // "venue",
              // "neighborhood",
              // ],
            },
            required: ["title", "tags", "description", "url"],
          },
        },
      },
    };

    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        response_format: {
          type: "json_schema",
          json_schema: { schema: schema },
        },
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    console.log("Perplexity raw content:", content);
    // Try to parse the array of JSON objects from the response
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      throw new Error("Failed to parse Perplexity API response as JSON array");
    }
    return result.items;
  }
}

export async function plexSearchEvent(tag: string, count = 5) {
  const perplx = new PerplexityService();

  console.log("Perplexity searchEvent", { query: tag, count });
  let events = await perplx.searchEvent(tag, count);
  events = events.map((event) => {
    // const itemTags = [...(event?.tags ?? []), tag];
    const finalTags = cleanTags([...(event?.tags ?? [])], tag);

    return {
      ...event,
      tags: finalTags,
      category: tag,
      id: safeName(event.title),
    };
  });

  console.log("Perplexity searchEvent result", events);
  return events;
}

export async function plexSearchMany(maxCats?: number, eventCount?: number) {
  eventCount = eventCount ?? 5;
  const tags = [
    "book launch",
    "indie rock concert",
    "networking event",
    "jazz concert",
    "classical music concert",
    "hip hop concert",
    "edm rave",
    "open mic night",
    "product launch",
    "silent disco",
    "art gallery opening",
    "broadway",
    "drag show",
    "fashion show",
    "food festival",
    "restaurant opening",
    "tech meetup",
    "hackathon",
    "gala",
    "film festival",
    "holiday market",
  ];

  const activeTags = maxCats ? tags.slice(0, maxCats) : tags;

  // const promises = tags.map((tag) => plexSearchEvent(tag));

  // const results = await Promise.all(promises);
  let results: any[] = [];
  for (const tag of activeTags) {
    const catResults: any[] = await plexSearchEvent(tag, eventCount);
    console.log("Perplexity searchMany result =>", { tag, catResults });

    results.push(...catResults);
  }
  // console.log("Perplexity searchMany result", { tags, results });

  // TODO fs.writeFileSync("plex-results.json", JSON.stringify(results, null, 2));
  return results;
}
