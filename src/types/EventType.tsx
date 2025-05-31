export type EventType = {
  title: string;
  date?: string;
  time?: string;
  location?: string;
  neighborhood?: string;
  price?: string;
  accessibility?: string;
  link?: string;
  description?: string;
  tags?: {
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
    flexible_tags: string[];
  };
};
