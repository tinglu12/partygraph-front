export interface EventNode {
  id: string;
  title: string;
  description: string;
  date?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  venue?: string;
  address?: string;
  neighborhood?: string;
  url?: string;
  connections?: string[]; // IDs of connected nodes
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
