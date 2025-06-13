import { EventNode } from '@/types/EventGraph';

// Helper to create consistent semantic vectors for similar events
const createSemanticVector = (baseVector: number[], variation: number = 0.1) => {
  return baseVector.map(val => val + (Math.random() - 0.5) * variation);
};

// Base vectors for different vibe categories
const VIBE_VECTORS = {
  // Relaxed, sophisticated social events
  cozySocial: Array(384).fill(0).map(() => Math.random() * 0.3 + 0.4),
  // High-energy dance events
  energeticDance: Array(384).fill(0).map(() => Math.random() * 0.3 + 0.7),
  // Artistic, creative gatherings
  artisticCreative: Array(384).fill(0).map(() => Math.random() * 0.3 + 0.5),
  // Outdoor, casual social events
  outdoorCasual: Array(384).fill(0).map(() => Math.random() * 0.3 + 0.6),
  // Formal, cultural events
  formalCultural: Array(384).fill(0).map(() => Math.random() * 0.3 + 0.3)
};

// Create a type-safe event array with semantic analysis
const semanticEvents: EventNode[] = [
  // Group 1: Cozy, Sophisticated Social Events
  {
    id: "evt_001",
    title: "Cozy Jazz Night at Blue Note",
    description: "Intimate jazz performance in a classic venue with candlelit tables",
    date: "2024-03-20T20:00:00Z",
    category: "music",
    tags: ["jazz", "live-music", "nightlife"],
    venue: "Blue Note Jazz Club",
    neighborhood: "Greenwich Village",
    location: {
      name: "Blue Note Jazz Club",
      coordinates: { lat: 40.730610, lng: -74.000000 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.cozySocial),
      vibeScore: {
        energy: 0.4,
        formality: 0.7,
        social: 0.6,
        artistic: 0.8,
        outdoor: 0.1
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  },
  {
    id: "evt_002",
    title: "Intimate Classical Concert",
    description: "Chamber music performance in an elegant historic venue",
    category: "music",
    tags: ["classical", "concert", "arts"],
    venue: "Carnegie Hall",
    neighborhood: "Midtown",
    location: {
      name: "Carnegie Hall",
      coordinates: { lat: 40.764500, lng: -73.980100 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.cozySocial),
      vibeScore: {
        energy: 0.3,
        formality: 0.8,
        social: 0.5,
        artistic: 0.9,
        outdoor: 0.1
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  },
  {
    id: "evt_003",
    title: "Wine Tasting & Art Gallery Opening",
    description: "Sophisticated evening of fine wine and contemporary art",
    category: "arts",
    tags: ["art", "wine", "gallery"],
    venue: "Modern Art Gallery",
    neighborhood: "Chelsea",
    location: {
      name: "Modern Art Gallery",
      coordinates: { lat: 40.742100, lng: -73.991100 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.cozySocial),
      vibeScore: {
        energy: 0.3,
        formality: 0.6,
        social: 0.7,
        artistic: 0.8,
        outdoor: 0.2
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  },

  // Group 2: High-Energy Dance Events
  {
    id: "evt_004",
    title: "Underground Techno Night",
    description: "Late night techno party with international DJs",
    category: "music",
    tags: ["techno", "dance", "nightlife"],
    venue: "Basement Club",
    neighborhood: "Bushwick",
    location: {
      name: "Basement Club",
      coordinates: { lat: 40.718200, lng: -73.957100 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.energeticDance),
      vibeScore: {
        energy: 0.9,
        formality: 0.2,
        social: 0.8,
        artistic: 0.6,
        outdoor: 0.1
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  },
  {
    id: "evt_005",
    title: "Latin Dance Party",
    description: "High-energy salsa and bachata night with live band",
    category: "music",
    tags: ["latin", "dance", "live-music"],
    venue: "Salsa Club",
    neighborhood: "Upper West Side",
    location: {
      name: "Salsa Club",
      coordinates: { lat: 40.758900, lng: -73.985100 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.energeticDance),
      vibeScore: {
        energy: 0.8,
        formality: 0.3,
        social: 0.9,
        artistic: 0.5,
        outdoor: 0.2
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  },
  {
    id: "evt_006",
    title: "Funk Fusion Dance Night",
    description: "Live funk band with dance floor and light show",
    category: "music",
    tags: ["funk", "dance", "live-music"],
    venue: "Funk House",
    neighborhood: "Williamsburg",
    location: {
      name: "Funk House",
      coordinates: { lat: 40.728200, lng: -73.991200 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.energeticDance),
      vibeScore: {
        energy: 0.85,
        formality: 0.3,
        social: 0.8,
        artistic: 0.7,
        outdoor: 0.2
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  },

  // Group 3: Artistic, Creative Gatherings
  {
    id: "evt_007",
    title: "Interactive Art Installation",
    description: "Immersive art experience with interactive elements",
    category: "arts",
    tags: ["art", "interactive", "exhibition"],
    venue: "Modern Art Space",
    neighborhood: "Chelsea",
    location: {
      name: "Modern Art Space",
      coordinates: { lat: 40.742100, lng: -73.991100 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.artisticCreative),
      vibeScore: {
        energy: 0.5,
        formality: 0.4,
        social: 0.6,
        artistic: 0.9,
        outdoor: 0.3
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  },
  {
    id: "evt_008",
    title: "Creative Writing Workshop",
    description: "Collaborative writing session with published authors",
    category: "arts",
    tags: ["writing", "workshop", "creative"],
    venue: "Literary Center",
    neighborhood: "Greenwich Village",
    location: {
      name: "Literary Center",
      coordinates: { lat: 40.728200, lng: -73.991200 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.artisticCreative),
      vibeScore: {
        energy: 0.4,
        formality: 0.5,
        social: 0.7,
        artistic: 0.8,
        outdoor: 0.2
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  },

  // Group 4: Outdoor, Casual Social Events
  {
    id: "evt_009",
    title: "Rooftop Garden Party",
    description: "Casual gathering with city views and live acoustic music",
    category: "social",
    tags: ["outdoor", "music", "social"],
    venue: "Skyline Rooftop",
    neighborhood: "Midtown",
    location: {
      name: "Skyline Rooftop",
      coordinates: { lat: 40.758900, lng: -73.985100 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.outdoorCasual),
      vibeScore: {
        energy: 0.6,
        formality: 0.3,
        social: 0.8,
        artistic: 0.5,
        outdoor: 0.9
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  },
  {
    id: "evt_010",
    title: "Food Truck Festival",
    description: "Outdoor food festival with local vendors and live music",
    category: "food",
    tags: ["food", "outdoor", "music"],
    venue: "City Park",
    neighborhood: "Central Park",
    location: {
      name: "City Park",
      coordinates: { lat: 40.782900, lng: -73.965400 }
    },
    semantic: {
      vector: createSemanticVector(VIBE_VECTORS.outdoorCasual),
      vibeScore: {
        energy: 0.7,
        formality: 0.2,
        social: 0.9,
        artistic: 0.4,
        outdoor: 1.0
      },
      confidence: 0.9
    },
    graph_data: {
      position: { x: 0, y: 0 },
      connections: { events: [], tags: [] }
    }
  }
];

// Export the events
export const sampleEvents: EventNode[] = semanticEvents;
