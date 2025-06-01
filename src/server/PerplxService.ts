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
    Help me find book launches in New York City.
    You are a helpful assistant. Given a filter and a list of events,
    return the ${count} best-matching events as ${count} separate JSON objects, all following the same ontology.
    Return an array of JSON objects in this format:

    {
      "title": "...",
      "date": "...",
      "time": "...",
      "location": "...",
      "neighborhood": "...",
      "price": "...",
      "accessibility": "...",
      "link": "...",
      "description": "...",
      "tags": string[],
      "keywords": string[],
    }

    DO not add any other text to the response.
    Do not add backticks or \`\`\` json to the response.
    `;

    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
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
