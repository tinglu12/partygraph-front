import { EventType } from "@/types/EventType";
import LlamaAPIClient from "llama-api-client";

class EventConverter {
  private client: LlamaAPIClient;
  private model: string;

  constructor() {
    this.client = new LlamaAPIClient({
      apiKey: process.env["LLAMA_API_KEY"],
    });
    this.model = "Llama-4-Maverick-17B-128E-Instruct-FP8";
  }

  async convertToStructuredEvent(rawText: string): Promise<EventData> {
    const prompt = `
You are an event classification assistant. Given a raw event description, extract structured metadata and tags based on the following ontology. Only choose from the listed values or return "unknown" if the data is missing. Return your response as JSON only.

---
Ontology:
- type: music, networking, comedy, art_show, popup, restaurant, workshop, miscellaneous, community_building, cultural_celebration, educational, professional_development, fundraiser, activism, wellness, film_screening, market, festival, conference
- goal: dancing, meeting_people, learning, relaxing, skill_sharing, knowledge_sharing, networking, community_building, creative_expression, professional_development, activism, wellness, entertainment
- vibe: casual, fancy, trashy, queer, bar, loud, quiet, seated, high_energy, cozy, romantic, introspective, underground, mainstream, hipster, bougie, gritty, polished, intimate, warehouse_party, rooftop_vibes, dive_bar_energy, gallery_opening, house_party
- genre:
  electronic, house, deep_house, tech_house, afro_house, techno, trance, drum_and_bass, dubstep, ambient, experimental_electronic,
  hip_hop, conscious_hip_hop, trap, boom_bap, drill, afrobeat_fusion,
  rock, indie_rock, alt_rock, punk, hardcore, shoegaze, garage_rock, post_punk,
  pop, bedroom_pop, dream_pop, synth_pop, indie_pop,
  jazz, traditional_jazz, contemporary_jazz, fusion, bebop, experimental_jazz,
  world, afrobeat, latin, reggaeton, cumbia, k_pop, bhangra, caribbean,
  folk, singer_songwriter, acoustic, americana, country,
  dance, disco, funk, soul, r_and_b,
  alternative, new_wave, industrial, goth,
  classical, opera, chamber_music,
  open_mic, spoken_word, poetry,
  culinary, queer_cinema
- audience: queer, students, families, tourists, art_kids, brownstone_locals, artists, tech_workers, finance_workers, activists, educators, musicians, dancers, writers, immigrants, seniors, young_professionals, creatives, entrepreneurs, community_organizers
- venue_type: club, rooftop, dive_bar, park, museum, restaurant, house_party, art_space, church_basement, warehouse, loft, speakeasy, gallery, community_center, library, school, hotel_rooftop, pier, beach, boat, bodega_backyard, fire_escape, basement, backyard, studio_space
- borough: Brooklyn, Manhattan, Queens, Bronx, Staten_Island
- neighborhood:
  East_Village, West_Village, SoHo, Tribeca, LES, Chelsea, Harlem, Washington_Heights, Midtown, Financial_District, Murray_Hill, Gramercy, Union_Square,
  Williamsburg, Bushwick, Park_Slope, Crown_Heights, Bed_Stuy, Red_Hook, Dumbo, Prospect_Heights, Greenpoint, Sunset_Park, Bay_Ridge, Flatbush, Fort_Greene,
  Astoria, Long_Island_City, Flushing, Jackson_Heights, Ridgewood, Sunnyside, Elmhurst, Corona, Woodside,
  South_Bronx, Fordham, Riverdale, Hunts_Point, Mott_Haven, Concourse,
  St_George, Stapleton, Port_Richmond
- price: free, unknown, under_10, under_25, under_50, under_100, over_100
- timeofday: morning, afternoon, evening, late_night, all_day, multi_day
- language: English, Spanish, Mandarin, multilingual, Portuguese, French, Arabic, Korean, Bengali, Russian, Italian
- accessibility: wheelchair, none, unknown, hearing_accessible, vision_accessible, neurodivergent_friendly, all_ages_friendly
- flexible_tags: sensory_friendly, BYOB, outdoor, low_light, experimental_visuals, analog_synths, all_ages, 21_plus, cash_only, sliding_scale, donation_based, members_only, invitation_only, recurring_series, pop_up, immersive, interactive, participatory, sustainable, local_artists, emerging_artists, established_artists, food_included, drinks_included, networking_focused, educational_component, hands_on_workshop

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
    "language": [...],
    "flexible_tags": [...]
  }
}
`;

    try {
      const response = await this.client.chat.completions.create({
        messages: [{ content: prompt, role: "user" }],
        model: this.model,
      });

      const content = response.completion_message?.content;
      if (!content) {
        throw new Error("No content returned from Llama API");
      }

      // Handle content type - it could be a string or an object with text property
      const textContent =
        typeof content === "string"
          ? content
          : (content as any).text || content;
      if (!textContent) {
        throw new Error("No text content found in response");
      }

      // Clean the response - remove markdown code blocks if present
      let cleanedContent = textContent.trim();

      // Remove ```json and ``` if present
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.slice(7); // Remove ```json
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.slice(3); // Remove ```
      }

      if (cleanedContent.endsWith("```")) {
        cleanedContent = cleanedContent.slice(0, -3); // Remove trailing ```
      }

      cleanedContent = cleanedContent.trim();

      // Parse the JSON response
      const eventData: EventType = JSON.parse(cleanedContent);
      return eventData;
    } catch (error) {
      console.error("Llama API error:", error);
      throw new Error("Failed to get structured event data from Llama API");
    }
  }
}

// Export the main function for backward compatibility
export async function getStructuredEvent(
  rawText: string,
  llamaApiKey?: string
): Promise<EventType> {
  const converter = new EventConverter();
  return converter.convertToStructuredEvent(rawText);
}
