"use server";

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
    Find ${count} events of type: ${query} in New York City.
    return ${count} items as a JSON array of objects.

    DO not add any other text to the response.
    Do not add backticks or \`\`\` json to the response.
    `;

    const categories = [
      "music",
      "art",
      "food",
      "drink",
      "party",
      "launch party",
    ];
    const categoriesString = categories.join(", ");

    const schema = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              tags: {
                type: "array",
                items: {
                  type: "string",
                  description:
                    "a list of common tags associated with the event must be lowercase",
                },
              },
              category: {
                type: "string",
                description: `the category of the event, one of ${categoriesString} `,
              },
              keywords: {
                type: "array",
                items: {
                  type: "string",
                  description:
                    "a list of unique keywords from the event description",
                },
              },
            },
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

export async function plexSearchEvent(query: string, count = 5) {
  const perplx = new PerplexityService();
  const safeName = (name: string) => name.toLowerCase().replace(/ /g, "-");
  console.log("Perplexity searchEvent", { query, count });
  let events = await perplx.searchEvent(query, count);
  events = events.map((event) => {
    return {
      ...event,
      id: safeName(event.title),
    };
  });

  console.log("Perplexity searchEvent result", events);
  return events;
}

export async function plexSearchMany() {
  const tags = ["book launch", "music concert"];

  // const promises = tags.map((tag) => plexSearchEvent(tag));

  // const results = await Promise.all(promises);
  let results: any[] = [];
  for (const tag of tags) {
    const catResults: any[] = await plexSearchEvent(tag);
    console.log("Perplexity searchMany result", catResults);

    const enrichedResults = catResults?.map((result) => {
      // inject original tag into the tags array
      const tags = [...(result?.tags ?? []), tag];
      const item = {
        ...result,
        tags,
      };
      return item;
    });
    results.push(...enrichedResults);
  }
  // console.log("Perplexity searchMany result", { tags, results });

  // TODO fs.writeFileSync("plex-results.json", JSON.stringify(results, null, 2));
  return results;
}
