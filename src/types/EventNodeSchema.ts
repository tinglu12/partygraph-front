// format scraped events from jina

import { BaseSchema } from "./BaseSchema";

export const EventNodeSchema: BaseSchema = {
  name: "EventNode",
  schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "the title of the event" },
      description: {
        type: "string",
        description: "A short description of the event in twenty words or less",
      },

      tags: {
        type: "array",
        items: { type: "string" },
        description: `five keywords extracted from the event description that describe the event.
          these can be any words that describe the event, do NOT have to be hashtags`,
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        description:
          "a list of unique or distinctive keywords extracted from the event description that describe the event",
      },

      date: {
        type: "string",
        description: `the date of the event. Assume year is 2025 if no year is found. Just the date with no extra text.`,
      },
      // category: { type: "string" },
      // venue: { type: "string" },
      // address: { type: "string" },
      // neighborhood: { type: "string" },
    },
    required: ["title", "description", "tags", "keywords", "date"],
    additionalProperties: false,
  },
};
