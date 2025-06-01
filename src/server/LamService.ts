"use server";

import { getPrompt } from "@/constants/PromptLib";
import { EventPerson } from "@/types/EventPerson";
import { EventType } from "@/types/EventType";
import LlamaAPIClient from "llama-api-client";
import fs from "fs/promises";

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

  async searchEvent(filter: string, events: EventType[]) {
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
        model: this.model,
      });
    const content = createChatCompletionResponse.completion_message?.content;
    console.log(content);

    // @ts-ignore
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

    let text = typeof content === "string" ? content : content?.text;
    if (!text) throw new Error("No text content in Llama API response");

    // Try to extract JSON from a code block
    const match = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
    const jsonString = match ? match[1] : text;

    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (e) {
      throw new Error("Failed to parse Llama API response as JSON");
    }
    return result;
  }

  async getPeople(event: EventType) {
    const prompt = await getPrompt("getPeople", {
      event: event.description,
    });
    const response = await this.client.chat.completions.create({
      messages: [{ content: prompt, role: "user" }],
      model: this.model,
    });
    const content = response.completion_message?.content;
    const person: EventPerson = {
      name: "John Doe",
      age: 30,
      gender: "male",
      interests: ["music", "art", "food"],
    };
    console.log("getPeople", { content });
    return [person];
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

    // @ts-ignore
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

export async function getPeople(event: EventType): Promise<EventPerson[]> {
  const lam = new LamService();
  const result = await lam.getPeople(event);
  console.log("getPeople result", { event, result });
  return result;
}
