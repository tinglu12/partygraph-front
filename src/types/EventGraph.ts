// New types for semantic analysis
export interface VibeScore {
  energy: number;      // 0-1 scale of event energy
  formality: number;   // 0-1 scale of formality (0=casual, 1=formal)
  social: number;      // 0-1 scale of social interaction
  artistic: number;    // 0-1 scale of artistic/creative focus
  outdoor: number;     // 0-1 scale of outdoor vs indoor
}

export interface SemanticAnalysis {
  vector: number[];  // 384-dimensional semantic vector
  vibeScore: {
    energy: number;      // 0-1 scale of event energy level
    formality: number;   // 0-1 scale of event formality
    social: number;      // 0-1 scale of social interaction
    artistic: number;    // 0-1 scale of artistic/creative elements
    outdoor: number;     // 0-1 scale of outdoor elements
  };
  confidence: number;    // 0-1 scale of confidence in the analysis
}

// Update EventNode to include semantic analysis
export interface EventNode {
  id: string;
  title: string;
  description?: string;
  date?: string;
  dates?: string[];
  category?: string;
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  tags?: string[];
  keywords?: string[];
  venue?: string;
  address?: string;
  neighborhood?: string;
  url?: string;
  semantic?: SemanticAnalysis;
  graph_data: {
    position: { x: number; y: number };
    connections: {
      events: Array<{
        id: string;
        similarity: number;
        semanticSimilarity: number;
        vibeSimilarity: number;
      }>;
      tags: Array<{
        id: string;
        weight: number;
      }>;
    };
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  semanticSimilarity: number;
  vibeSimilarity: number;
  label?: string;  // Optional for backward compatibility
}

export interface TagCenteredGraphData {
  nodes: Array<{
    id: string;
    type: 'event' | 'tag';
    data: EventNode | { id: string; name: string };
    position: { x: number; y: number };
  }>;
  edges: GraphEdge[];
  centralTag: string;
  similarTags: string[];
} 