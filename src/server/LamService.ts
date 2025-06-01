"use server";

import { getPrompt } from "@/constants/PromptLib";
import { EventPerson } from "@/types/EventPerson";
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

  async classifyImage(imagePath: string): Promise<string[]> {
    // TODO
    return ["party", "event", "other"];
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
