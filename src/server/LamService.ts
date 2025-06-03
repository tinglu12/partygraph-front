"use server";

import { getPrompt } from "@/constants/PromptLib";
import { EventPerson } from "@/types/EventPerson";
import { EventPeopleSchema } from "@/types/EventPersonSchema";
import { EventType } from "@/types/EventType";
import LlamaAPIClient from "llama-api-client";
import fs from "fs/promises";
import { EventNodeSchema } from "@/types/EventNodeSchema";
import { EventNode } from "@/types/EventGraph";

class LamService {
  private client: LlamaAPIClient;
  private model: string;

  constructor() {
    const client = new LlamaAPIClient({
      apiKey: process.env["LLAMA_API_KEY"], // This is the default and can be omitted
    });

    this.client = client;
    this.model = "Llama-4-Maverick-17B-128E-Instruct-FP8";
  }

  /**
   * Enhanced tag-based search that constrains LLaMA to existing tag vocabulary
   * This ensures consistent results and prevents hallucinated tags
   * 
   * @param filter - User's search query/vibe description
   * @param events - Available events with their tags
   * @returns Array of the 5 most relevant existing tags
   */
  async searchEventTags(filter: string, events: EventType[]): Promise<string[]> {
    // Extract all unique tags from the event dataset
    // This creates our "vocabulary" that LLaMA must choose from
    const allTags = Array.from(new Set(
      events.flatMap(event => event.tags || [])
    )).filter((tag: string) => tag && tag.length > 0); // Remove empty/null tags

    // Limit tags for LLaMA context window (too many tags can overwhelm the model)
    const tagLimit = 500;
    const limitedTags = allTags.slice(0, tagLimit);

    console.log(`Providing ${limitedTags.length} existing tags to LLaMA for selection`);

    const prompt = `
You are a semantic tag matching assistant. Given a user's search description, find the 5 most relevant tags from the provided tag vocabulary.

IMPORTANT CONSTRAINTS:
- You MUST only return tags that exist in the provided vocabulary
- Return exactly 5 tags (or fewer if less than 5 are relevant)
- Return ONLY the tag names, comma-separated, no explanations
- Do NOT create new tags or modify existing ones
- Focus on semantic similarity, not just keyword matching

User's search: "${filter}"

Available tag vocabulary:
${limitedTags.join(', ')}

Return the 5 most relevant tags:`;

    try {
      const response = await this.client.chat.completions.create({
        messages: [{ content: prompt, role: "user" }],
        max_completion_tokens: 200, // Short response expected
        model: this.model,
        temperature: 0.3, // Lower temperature for more consistent results
      });

      const content = response.completion_message?.content;
      // @ts-expect-error - Llama model types are not properly typed
      const tagsText = content?.text?.trim() || "";
      
      if (!tagsText) {
        console.log("LLaMA returned empty response for tag search");
        return [];
      }

      // Parse the comma-separated tags and validate they exist in our vocabulary
      const selectedTags = tagsText
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)
        .filter((tag: string) => limitedTags.includes(tag)) // Ensure tag exists in vocabulary
        .slice(0, 5); // Limit to 5 tags max

      console.log(`LLaMA selected tags for "${filter}":`, selectedTags);
      return selectedTags;

    } catch (error) {
      console.error("Error in LLaMA tag search:", error);
      return [];
    }
  }

  /**
   * Legacy event search method - now updated to use tag-based approach
   * This maintains backward compatibility while using the improved tag system
   * 
   * @param filter - User's search query
   * @param events - Available events
   * @returns Single event title (for backward compatibility) or null
   */
  async searchEvent(filter: string, events: EventType[]) {
    // Use the new tag-based search approach
    const selectedTags = await this.searchEventTags(filter, events);
    
    if (selectedTags.length === 0) {
      console.log("No relevant tags found, falling back to title-based search");
      // Fallback to original title-based search if no tags found
      return this.searchEventByTitle(filter, events);
    }

    // Find events that have any of the selected tags
    // This matches the logic used in the fallback search for consistency
    const matchingEvents = events.filter(event => 
      event.tags && event.tags.some(tag => selectedTags.includes(tag))
    );

    if (matchingEvents.length === 0) {
      console.log("No events found with selected tags, falling back to title search");
      return this.searchEventByTitle(filter, events);
    }

    // Return the first matching event's title for backward compatibility
    // The calling code expects a single event title, not an array
    console.log(`Found ${matchingEvents.length} events matching tags: [${selectedTags.join(', ')}]`);
    return matchingEvents[0].title;
  }

  /**
   * Original title-based search method (extracted for fallback use)
   * This is the legacy approach that only looks at titles and descriptions
   */
  private async searchEventByTitle(filter: string, events: EventType[]) {
    const eventString = events
      .map((event) => `- ${event.title} ${event.description}`)
      .join("\n");

    const prompt = `
    You are a helpful assistant.
    Find the closest matching event for the following filter in a list of events.
    Return just the name of the event.

    Filter:${filter}

    Events:
    ${eventString}

    `;

    const createChatCompletionResponse =
      await this.client.chat.completions.create({
        messages: [{ content: prompt, role: "user" }],
        max_completion_tokens: 2000,
        model: this.model,
      });
    const content = createChatCompletionResponse.completion_message?.content;
    console.log(content);

    // @ts-expect-error - Llama model types are not properly typed
    const event = content?.text.trim();
    return event;
  }

  async classifyImage(imagePath: string): Promise<any> {
    // Read and encode the image as base64
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const promptText = `
You are an event flyer analysis assistant. Given an image of an event flyer or poster, use OCR to extract the text and then parse the following information. Return your response as JSON only, with no extra text.

Return JSON in this format:
{
  "title": "...",
  "tags": [ "..." ],
}
`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
    });

    const content = response.completion_message?.content;
    console.log("Llama classifyImage raw content:", content);

    const text = typeof content === "string" ? content : content?.text;
    if (!text) throw new Error("No text content in Llama API response");

    // Try to extract JSON from a code block
    const match =
      text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
    const jsonString = match ? match[1] : text;

    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (e) {
      throw new Error("Failed to parse Llama API response as JSON");
    }
    return result;
  }

  async getPeople(event: EventType): Promise<EventPerson[]> {
    const prompt = await getPrompt("getPeople", {
      event: event.description,
    });

    // console.log("schema", EventPeopleSchema);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ content: prompt, role: "user" }],
      response_format: {
        type: "json_schema",
        json_schema: EventPeopleSchema,
      },
    });

    const content = response.completion_message?.content;
    // @ts-expect-error - Llama model types are not properly typed
    const blob = JSON.parse(content?.text?.trim() || "{}");
    console.log("getPeople", blob);
    return blob?.people;
  }

  async formatRawEventData(raw: string, retry = 0): Promise<EventNode | null> {
    const prompt = `format this event info into the JSON structure provided: ${raw}`;
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ content: prompt, role: "user" }],
      max_completion_tokens: 3000, // needed
      response_format: {
        type: "json_schema",
        json_schema: EventNodeSchema,
      },
    });
    const content = response.completion_message?.content;

    try {
      // @ts-expect-error - Llama model types are not properly typed
      const blob = JSON.parse(content?.text?.trim() || "{}");
      console.log("formatRawEventData", blob);
      return blob;
    } catch (e) {
      // const text = typeof content === "string" ? content : content?.text;
      console.error("Failed to parse Llama API response as JSON", {
        error: e,
        raw,
        content,
      });
      if (retry < 3) {
        return this.formatRawEventData(raw, retry + 1);
      }
      return null;
    }
  }

  async getCategory(event: string) {
    const prompt = `
    You are a helpful assistant.
    Categorize the following event into one of the following categories:
    - "party"
    - "event"
    - "other"

    Do not include any other text in your response, just the category.

    Event: ${event}
    `;

    const createChatCompletionResponse =
      await this.client.chat.completions.create({
        messages: [{ content: prompt, role: "user" }],
        model: this.model,
      });
    const content = createChatCompletionResponse.completion_message?.content;
    console.log(content);

    // @ts-expect-error - Llama model types are not properly typed
    const category = content?.text.trim();

    return category;
  }
}

export async function getCategory(event: EventType) {
  const lam = new LamService();

  const eventString = `
  Name: ${event.title}
  Description: ${event.description}
  `;

  const category = await lam.getCategory(eventString);
  console.log("got category", { event, category });
  return category;
}

export async function searchEvent(filter: string, events: EventType[]) {
  const lam = new LamService();
  const result = await lam.searchEvent(filter, events);
  console.log("searchEvent result", { filter, result });
  return result;
}

export async function classifyImage(imagePath: string) {
  const lam = new LamService();
  const result = await lam.classifyImage(imagePath);
  console.log("classifyImage result", { imagePath, result });
  return result;
}

/**
 * @param event
 * @returns list of people in the event
 */
export async function getPeople(event: EventType): Promise<EventPerson[]> {
  const lam = new LamService();
  const result = await lam.getPeople(event);
  console.log("getPeople result", { event, result });
  return result;
}

export async function formatRawEventData(raw: string) {
  const lam = new LamService();
  const result = await lam.formatRawEventData(raw);
  console.log("formatRawEventData result", { raw, result });
  return result;
}

/**
 * Enhanced search that returns both LLaMA-selected tags and matching events
 * This provides the full context needed for UI display and consistent search logic
 * 
 * @param filter - User's search query
 * @param events - Available events with tags
 * @returns Object containing selected tags and matching events
 */
export async function searchEventsByTags(filter: string, events: EventType[]) {
  const lam = new LamService();
  
  try {
    // Get LLaMA's tag recommendations
    const selectedTags = await lam.searchEventTags(filter, events);
    
    if (selectedTags.length === 0) {
      console.log("LLaMA found no relevant tags for search");
      return { selectedTags: [], matchingEvents: [] };
    }

    // Find all events that match any of the selected tags
    // This uses the same logic as our fallback search for consistency
    const matchingEvents = events.filter(event => 
      event.tags && event.tags.some(tag => selectedTags.includes(tag))
    );

    // Score and rank events by number of matching tags (same as fallback logic)
    const scoredEvents = matchingEvents.map(event => {
      const eventMatchingTags = event.tags?.filter(tag => selectedTags.includes(tag)) || [];
      const score = eventMatchingTags.reduce((total, tag) => {
        const tagIndex = selectedTags.indexOf(tag);
        // Higher weight for tags that ranked higher in LLaMA's selection
        const weight = 1 - (tagIndex / selectedTags.length) * 0.5;
        return total + weight;
      }, 0);
      
      return { event, score, matchingTags: eventMatchingTags };
    });

    // Sort by score descending (events with more/better tags first)
    const rankedEvents = scoredEvents
      .sort((a, b) => b.score - a.score)
      .map(item => item.event);

    console.log(`LLaMA search for "${filter}": found ${selectedTags.length} tags, ${rankedEvents.length} events`);
    return { 
      selectedTags, 
      matchingEvents: rankedEvents,
      searchMethod: 'llama-tags' as const
    };

  } catch (error) {
    console.error("Error in LLaMA tag-based search:", error);
    return { selectedTags: [], matchingEvents: [], searchMethod: 'error' as const };
  }
}
