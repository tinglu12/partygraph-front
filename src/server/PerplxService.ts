"use server";

import { cleanTags, safeName } from "@/lib/utils";
import { EventType } from "@/types/EventType";
import axios from "axios";

const eventSingleSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: {
      type: "string",
      description:
        "a short description of the event, 1-2 sentences, no more than 100 words",
    },
    tags: {
      type: "array",
      items: {
        type: "string",
        description:
          "a list of common tags associated with the event must be lowercase",
      },
    },
    url: {
      type: "string",
      description: "the original url of the event, must be a valid url",
    },
    date: {
      type: "string",
      description: "the date of the event, must be a valid date",
    },
    venue: {
      type: "string",
      description: "the name of the venue of the event",
    },
    address: {
      type: "string",
      description: "the address of the event",
    },
    neighborhood: {
      type: "string",
      description:
        "the neighborhood of the city for the event, eg SoHo, Williamsburg, East Village, LES etc.",
    },
    keywords: {
      type: "array",
      items: {
        type: "string",
        description: "a list of unique keywords from the event description",
      },
    },
  },
  required: [
    "title",
    "tags",
    "description",
    "url",
    "date",
    "venue",
    "neighborhood",
    "keywords",
  ],
};

const eventListSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: {
            type: "string",
            description:
              "a short description of the event, 1-2 sentences, no more than 100 words",
          },
          tags: {
            type: "array",
            items: {
              type: "string",
              description:
                "a list of common tags associated with the event must be lowercase",
            },
          },
          url: {
            type: "string",
            description: "the original url of the event, must be a valid url",
          },
          date: {
            type: "string",
            description: "the date of the event, must be a valid date",
          },
          venue: {
            type: "string",
            description: "the name of the venue of the event",
          },
          address: {
            type: "string",
            description: "the address of the event",
          },
          neighborhood: {
            type: "string",
            description:
              "the neighborhood of the city for the event, eg SoHo, Williamsburg, East Village, LES etc.",
          },
          keywords: {
            type: "array",
            items: {
              type: "string",
              description:
                "a list of unique keywords from the event description",
            },
          },
        },
        required: [
          "title",
          "tags",
          "description",
          "url",
          "date",
          "venue",
          "neighborhood",
          "keywords",
        ],
      },
    },
  },
};

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

  async post(prompt: string, schema?: any) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        response_format: {
          type: "json_schema",
          json_schema: { schema },
        },
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
    return content;
  }

  async searchEvent(query: string, count = 2): Promise<any[]> {
    const prompt = `
    Find ${count} events of type: ${query} in New York City in the next 30 days.
    return ${count} items as a JSON array of objects.

    DO not add any other text to the response.
    Do not add backticks or \`\`\` json to the response.
    `;

    const content = await this.post(prompt, eventListSchema);

    // console.log("Perplexity raw content:", content);
    // Try to parse the array of JSON objects from the response
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      throw new Error("Failed to parse Perplexity API response as JSON array");
    }
    return result.items;
  }

  async enrichEventFromUrl(event: EventType) {
    // @ts-ignore
    const url = event.link || event.url;
    // TODO fix why we have 'link' and not 'url'
    // normalize types so we dont have EventType and EventNode
    const prompt = `
Tell me about the event on this page including
- title
- location
- description
- date
- location
- 5 tags
- 5 keywords
return the info in json format
    URL: ${url}

    `;

    const content = await this.post(prompt, eventSingleSchema);
    console.log("Perplexity searchEventByUrl content:", content, prompt);
    return content;
  }
}

export async function plexSearchEvent(tag: string, count = 5, retry = 0) {
  const perplx = new PerplexityService();

  console.log("Perplexity searchEvent", { query: tag, count });
  let events = await perplx.searchEvent(tag, count);

  // sometimes the response is empty, so we retry
  if (!events || events.length === 0) {
    if (retry < 3) {
      console.log("Perplexity searchEvent failed, retrying", {
        query: tag,
        count,
        retry,
      });
      return plexSearchEvent(tag, count, retry + 1);
    }
    console.error("failed on event");
  }

  events = events.map((event) => {
    // const itemTags = [...(event?.tags ?? []), tag];
    const finalTags = cleanTags([...(event?.tags ?? [])], tag);

    return {
      ...event,
      tags: finalTags,
      category: tag,
      id: safeName(event.title),
    };
  });

  // console.log("Perplexity searchEvent result", events);
  return events;
}

export async function plexEnrichEvents(events: EventType[]) {
  const perplx = new PerplexityService();
  for (const event of events) {
    console.log("enrich one", event);
    const enriched = await perplx.enrichEventFromUrl(event);
    console.log("enrich one", enriched);
  }
}

export async function plexSearchMany(maxCats?: number, eventCount?: number) {
  eventCount = eventCount ?? 10;
  const tags = [
    "book launch",
    "indie rock concert",
    "networking event",
    "tech meetup",
    "hackathon",
    "jazz concert",
    "classical music concert",
    "hip hop concert",
    "rave",
    "product launch",
    "silent disco",
    "art gallery opening",
    "broadway show",
    "off broadway show",
    "drag show",
    "fashion show",
    "food festival",
    "gala",
    "film festival",
    "night market",
    // "open mic night",
    // "restaurant opening",
  ];

  const activeTags = maxCats ? tags.slice(0, maxCats) : tags;

  // const promises = tags.map((tag) => plexSearchEvent(tag));

  // const results = await Promise.all(promises);
  const results: any[] = [];
  for (const tag of activeTags) {
    const catResults: any[] = await plexSearchEvent(tag, eventCount);
    console.log("Perplexity searchMany result =>", { tag, catResults });

    results.push(...catResults);
  }
  // console.log("Perplexity searchMany result", { tags, results });

  // TODO fs.writeFileSync("plex-results.json", JSON.stringify(results, null, 2));
  return results;
}
