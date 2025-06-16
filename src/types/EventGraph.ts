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

// Add Tag type for backward compatibility
export interface Tag {
  id: string;
  name: string;
}

// Add GraphData type for backward compatibility
export interface GraphData {
  nodes: EventNode[];
  edges: GraphEdge[];
  tags?: Tag[];
}

// Update EventNode to include legacy fields for backward compatibility
export interface EventNode {
  id: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  tags?: string[];
  venue?: string;
  address?: {
    lat: number;
    lng: number;
  };
  neighborhood?: string;
  url?: string;  // Keep URL for event links
  semantic?: SemanticAnalysis;
  connections?: string[]; // IDs of connected events
  graph_data?: {
    connections: Array<{
      id: string;
      similarity: number;
    }>;
    tags: string[];
  };
  // Legacy fields for backward compatibility
  keywords?: string[];  // Legacy keywords field (use tags instead)
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

// Add TagCenteredNode type for backward compatibility
export interface TagCenteredNode {
  id: string;
  type: 'event' | 'tag';
  data: EventNode | Tag;
  position: { x: number; y: number };
}

// Update TagCenteredGraphData to use TagCenteredNode
export interface TagCenteredGraphData {
  nodes: TagCenteredNode[];
  edges: GraphEdge[];
  centralTag: string;
  similarTags: string[];
} 