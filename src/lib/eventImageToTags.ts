import axios from 'axios';
import fs from 'fs/promises';

const LLAMA_API_URL = 'https://api.meta.ai/llama-api-endpoint'; // Replace with actual endpoint
const LLAMA_MODEL = 'llama-4'; // or whatever model identifier Meta provides

export interface EventTags {
  type: string[];
  goal: string[];
  vibe: string[];
  genre: string[];
  audience: string[];
  venue_type: string[];
  borough: string[];
  price: string[];
  timeofday: string[];
  language: string[];
  accessibility: string[];
}

export async function getImageTagsFromOntology(imagePath: string, llamaApiKey: string): Promise<EventTags> {
  // Read and encode the image as base64
  const imageBuffer = await fs.readFile(imagePath);
  const imageBase64 = imageBuffer.toString('base64');

  const prompt = `
You are an event image classification assistant. Given an event flyer or poster image, extract only the relevant tags based on the following ontology. Only choose from the listed values or return "unknown" if the data is missing. Return your response as JSON only.

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
Analyze the provided image and return JSON in this format:
{
  "tags": {
    "type": [...],
    "goal": [...],
    "vibe": [...],
    "genre": [...],
    "audience": [...],
    "venue_type": [...],
    "borough": [...],
    "price": [...],
    "timeofday": [...],
    "language": [...],
    "accessibility": [...]
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
        temperature: 0.3,
        // Assuming the API accepts images as base64 in a field called 'image'
        image: imageBase64
      },
      {
        headers: {
          Authorization: `Bearer ${llamaApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    const tagsObj = JSON.parse(content);
    return tagsObj.tags;
  } catch (error) {
    console.error('Llama API error:', error);
    throw new Error('Failed to get tags from Llama API for image');
  }
} 