import { EventNode } from "@/types/EventGraph";
import axios from "axios";
import { formatRawEventData } from "./LamService";

class JinaService {
  private baseUrl = "https://r.jina.ai";
  private bearerToken: string | undefined;

  constructor() {
    this.baseUrl = "https://r.jina.ai";
    this.bearerToken = process.env.JINA_READER_API_KEY;
  }

  async readUrl(url: string) {
    const fullUrl = `${this.baseUrl}/${url}`;
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${this.bearerToken}`,
        "X-Md-Link-Style": "discarded", // remove links
        "X-Retain-Images": "none",
        "X-Return-Format": "markdown",
      },
    });
    return response.data;

    // .then((response) => {
    //   console.log(response.data);
    //   return response.data;
    // })
    // .catch((error) => {
    //   console.error(error);
    // });
  }
}

export async function jinaScrapeEvent(event: EventNode) {
  const jina = new JinaService();
  const url = event.url;
  const response = await jina.readUrl(url!);
  console.log("jina response:", response);
  return response;
}

export async function scrapeAndFormatEvent(event: EventNode) {
  const jina = new JinaService();
  const url = event.url;
  const response = await jina.readUrl(url!);
  console.log("raw response:", response);
  const formatted = await formatRawEventData(response);
  return formatted;
}
