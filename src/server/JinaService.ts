import { EventNode } from "@/types/EventGraph";

class JinaService {}

export async function jinaScrapeEvent(event: EventNode) {
  const jina = new JinaService();
  const url = event.url;
  // const response = await fetch(url);
  // const html = await response.text();
  // return html;
}
