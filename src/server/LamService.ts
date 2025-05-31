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
