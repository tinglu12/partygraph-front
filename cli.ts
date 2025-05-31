import LlamaAPIClient from "llama-api-client";

const client = new LlamaAPIClient({
  apiKey: process.env["LLAMA_API_KEY"], // This is the default and can be omitted
});

async function main() {
  const model = "Llama-4-Maverick-17B-128E-Instruct-FP8";

  const event = `
  Party: launch party for new product
  Date: 2025-06-01
  Location: 123 Main St, Anytown, USA
  Description: We are launching a new product and we want to celebrate with a party.
  Attendees: 100
  Cost: $1000
  Budget: $1000
  `;

  const prompt = `
  You are a helpful assistant.
  Categorize the following event into one of the following categories:
  - "party"
  - "event"
  - "other"

  Do not include any other text in your response, just the category.

  Event: ${event}
  `;

  const createChatCompletionResponse = await client.chat.completions.create({
    messages: [{ content: prompt, role: "user" }],
    model: model,
  });

  console.log(createChatCompletionResponse.completion_message);
}

(async () => {
  await main();
})();
