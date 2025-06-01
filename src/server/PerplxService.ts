"use server";

import { EventType } from "@/types/EventType";
import axios from "axios";

class PerplexityService {
  private apiKey: string;
  private model: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env["PERPLEXITY_API_KEY"] ?? "";
    this.model = "pplx-70b-online";
    this.apiUrl = "https://api.perplexity.ai/v1/chat/completions";
    if (!this.apiKey) {
      throw new Error("PERPLEXITY_API_KEY not set in environment");
    }
  }

  async searchEvent(filter: string, events: EventType[]): Promise<any[]> {
    const eventString = events
      .map((event, i) => `Event ${i + 1}: ${event.title} - ${event.description}`)
      .join("\n");

    const prompt = `
    Help me find book launches in New York City.
    You are a helpful assistant. Given a filter and a list of events, 
    return the 10 best-matching events as 10 separate JSON objects, each all following the same ontology.
    Return "unknown" if the data is missing. Return your response as JSON only.
    
    \n\nReturn 10 JSON objects, one for each best-matching event, in an array.
    
    ---
    Return JSON in this format:
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
    "tags": {
        "type": [...],
        "goal": [...],
        "vibe": [...],
        "genre": [...],
        "audience": [...],
        "venueType": [...],
        "borough": [...],
        "neighborhood": [...],
        "timeOfDay": [...],
        "language": [...],
        "keywords": [...]
    }
    }
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

export async function searchEvent(filter: string, events: EventType[]) {
  const perplx = new PerplexityService();
  const result = await perplx.searchEvent(filter, events);
  console.log("Perplexity searchEvent result", { filter, result });
  return result;
}
