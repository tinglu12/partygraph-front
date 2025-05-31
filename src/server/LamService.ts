"use server";

import { EventType } from "@/types/EventType";
import LlamaAPIClient from "llama-api-client";

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
      .map((event) => `- ${event.name} ${event.description}`)
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

  async classifyImage(imagePath: string): Promise<string[]> {
    // TODO
    return ["party", "event", "other"];
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
  Name: ${event.name}
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
