import axios from 'axios';

const LLAMA_API_URL = 'https://api.meta.ai/llama-api-endpoint'; // Replace with actual endpoint
const LLAMA_MODEL = 'llama-4'; // or whatever model identifier Meta provides

export interface EventData {
  title: string;
  date: string;
  time: string;
  location: string;
  neighborhood: string;
  price: string;
  accessibility: string;
  link: string;
  description: string;
  tags: {
    type: string[];
    goal: string[];
    vibe: string[];
    genre: string[];
    audience: string[];
    venue_type: string[];
    borough: string[];
    neighborhood: string[];
    timeofday: string[];
    language: string[];
  };
}

export async function getStructuredEvent(rawText: string, llamaApiKey: string): Promise<EventData> {
  const prompt = `
You are an event classification assistant. Given a raw event description, extract structured metadata and tags based on the following ontology. Only choose from the listed values or return "unknown" if the data is missing. Return your response as JSON only.

---
Ontology:
- type: music, networking, comedy, art_show, popup, restaurant, workshop, miscellaneous
- goal: dancing, meeting_people, learning, relaxing, skill_sharing, knowledge_sharing
- vibe: casual, fancy, trashy, queer, bar, loud, quiet, seated
- genre: techno, jazz, open_mic, ambient, indie_rock, afrobeat, experimental, culinary
- audience: queer, students, families, tourists, art_kids, brownstone_locals
- venue_type: club, rooftop, dive_bar, park, museum, restaurant, house_party, art_space
- borough: Brooklyn, Manhattan, Queens, Bronx, Staten_Island
- price: free, unknown, under_10, under_25, under_50, under_100, over_100
- timeofday: morning, afternoon, evening, late_night
- language: English, Spanish, Mandarin, multilingual
- accessibility: wheelchair, none, unknown

---
Input Description:
${rawText}

---
Return JSON in this format:
{
  "title": "...",
  "date": "...",
  "time": "...",
  "location": "...",
  "neighborhood": "...",
  "price": "...",
  "accessibility": "...",
  "link": "...",
  "description": "...",
  "tags": {
    "type": [...],
    "goal": [...],
    "vibe": [...],
    "genre": [...],
    "audience": [...],
    "venue_type": [...],
    "borough": [...],
    "neighborhood": [...],
    "timeofday": [...],
    "language": [...]
  }
}
`;

  try {
    const response = await axios.post(
      LLAMA_API_URL,
      {
        model: LLAMA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${llamaApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    const eventData: EventData = JSON.parse(content);
    return eventData;
  } catch (error) {
    console.error('Llama API error:', error);
    throw new Error('Failed to get structured event data from Llama API');
  }
}
