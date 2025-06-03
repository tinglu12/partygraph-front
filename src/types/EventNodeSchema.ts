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
        description: "the description of the event",
      },
      date: { type: "string", description: "the date of the event" },
      // category: { type: "string" },
      tags: {
        type: "array",
        items: { type: "string" },
        description:
          "five tags that describe the event. Do NOT have to be hashtags",
      },
      keywords: {
        type: "array",
        items: { type: "string" },
        description:
          "a list of keywords extracted from the event description that describe the event",
      },
      venue: { type: "string" },
      address: { type: "string" },
      neighborhood: { type: "string" },
    },
    required: ["title", "description", "tags", "keywords"],
    additionalProperties: false,
  },
};
