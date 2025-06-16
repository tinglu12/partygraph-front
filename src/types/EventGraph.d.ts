// Define the semantic analysis type
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

export interface EventNode {
  id: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  tags?: string[];
  venue?: string;
  address?: string;
  neighborhood?: string;
  location?: {
    lat: number;
    lng: number;
  };
  semantic?: SemanticAnalysis;
  connections?: string[]; // IDs of connected events
  graph_data?: {
    connections: Array<{
      id: string;
      similarity: number;
    }>;
    tags: string[];
  };
}

export interface GraphData {
  nodes: EventNode[];
  edges?: Array<{
    source: string;
    target: string;
    label: string;
  }>;
}

// Enhanced interfaces for tag-centered visualization
export interface TagCenteredNode {
  id: string;
  type: "tag" | "event";
  data: EventNode | { tag: string };
}

export interface TagCenteredGraphData {
  centralTag: string;
  similarTags?: string[]; // The 5 most similar tags found during search
  nodes: TagCenteredNode[];
  edges: Array<{
    source: string;
    target: string;
    label: string;
  }>;
}

export interface Tag {
  id: string;
  name: string;
  type: string;
}
