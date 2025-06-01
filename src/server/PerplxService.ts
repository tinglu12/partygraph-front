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

  async searchEvent(query: string): Promise<any[]> {
    const count = 2;
    const prompt = `
    Help me find ${query} events in New York City.
    return ${count} best-matching events as a JSON array of objects.

    DO not add any other text to the response.
    Do not add backticks or \`\`\` json to the response.
    `;

    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        date: { type: "string" },
        time: { type: "string" },
        location: { type: "string" },
        neighborhood: { type: "string" },
        price: { type: "string" },
        accessibility: { type: "string" },
        link: { type: "string" },
        description: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        keywords: { type: "array", items: { type: "string" } },
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
    return result;
  }
}

export async function plexSearchEvent(query: string) {
  const perplx = new PerplexityService();
  const result = await perplx.searchEvent(query);
  console.log("Perplexity searchEvent result", { filter: query, result });
  return result;
}

export async function plexSearchMany() {
  const tags = ["book launch", "music concert"];
  const results = await Promise.all(tags.map((tag) => plexSearchEvent(tag)));
  console.log("Perplexity searchMany result", { tags, results });
  // TODO fs.writeFileSync("plex-results.json", JSON.stringify(results, null, 2));
  return results;
}
