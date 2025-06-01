export interface EventNode {
  id: string;
  title: string;
  date: string;
  description: string;
  category?: string;
  tags?: string[];
  connections?: string[]; // IDs of connected nodes
}

export interface TagNode {
  id: string;
  name: string;
  type: 'tag';
  isCenter?: boolean;
}

export interface GraphNode {
  id: string;
  type: 'event' | 'tag';
  data: EventNode | TagNode;
}

export interface GraphData {
  nodes: EventNode[];
  edges?: Array<{
    source: string;
    target: string;
    label: string;
  }>;
}

export interface TagCenteredGraphData {
  nodes: GraphNode[];
  edges: Array<{
    source: string;
    target: string;
    label: string;
  }>;
  centralTag: string;
}

export const sampleEvents: EventNode[] = [
  {
    id: "1",
    title: "Summer Music Festival",
    date: "2024-07-15",
    description: "Annual music festival featuring top artists",
    category: "Music",
    tags: ["festival", "outdoor", "music", "energetic", "dancing"],
    connections: ["2", "3"]
  },
  {
    id: "2",
    title: "Food & Wine Expo",
    date: "2024-07-16",
    description: "Culinary delights and wine tasting",
    category: "Food",
    tags: ["food", "wine", "tasting", "sophisticated", "relaxing"],
    connections: ["1", "4"]
  },
  {
    id: "3",
    title: "Art Gallery Opening",
    date: "2024-07-17",
    description: "Contemporary art exhibition",
    category: "Art",
    tags: ["art", "exhibition", "gallery", "creative", "quiet", "thoughtful"],
    connections: ["1", "5"]
  },
  {
    id: "4",
    title: "Tech Conference",
    date: "2024-07-18",
    description: "Latest innovations in technology",
    category: "Technology",
    tags: ["tech", "conference", "innovation", "learning", "networking"],
    connections: ["2", "5"]
  },
  {
    id: "5",
    title: "Fashion Show",
    date: "2024-07-19",
    description: "Spring/Summer collection showcase",
    category: "Fashion",
    tags: ["fashion", "show", "design", "trendy", "stylish"],
    connections: ["3", "4"]
  },
  {
    id: "6",
    title: "Jazz Night at Blue Note",
    date: "2024-07-20",
    description: "Intimate jazz performance with local musicians",
    category: "Music",
    tags: ["jazz", "intimate", "chill", "music", "drinks", "romantic"],
    connections: ["7", "8"]
  },
  {
    id: "7",
    title: "Rooftop Sunset Yoga",
    date: "2024-07-21",
    description: "Relaxing yoga session with city views",
    category: "Wellness",
    tags: ["yoga", "relaxing", "outdoor", "peaceful", "zen", "sunset"],
    connections: ["6", "9"]
  },
  {
    id: "8",
    title: "Underground Techno Rave",
    date: "2024-07-22",
    description: "High-energy electronic music until dawn",
    category: "Music",
    tags: ["techno", "rave", "dancing", "energetic", "loud", "underground"],
    connections: ["6", "10"]
  },
  {
    id: "9",
    title: "Farmers Market & Brunch",
    date: "2024-07-23",
    description: "Fresh local produce and casual dining",
    category: "Food",
    tags: ["farmers market", "brunch", "healthy", "outdoor", "casual", "community"],
    connections: ["7", "11"]
  },
  {
    id: "10",
    title: "Stand-up Comedy Night",
    date: "2024-07-24",
    description: "Hilarious local comedians and open mic",
    category: "Comedy",
    tags: ["comedy", "funny", "entertainment", "casual", "laughs", "social"],
    connections: ["8", "11"]
  },
  {
    id: "11",
    title: "Craft Beer Tasting",
    date: "2024-07-25",
    description: "Sample local brewery selections",
    category: "Food",
    tags: ["beer", "tasting", "craft", "social", "casual", "drinks"],
    connections: ["9", "10", "12"]
  },
  {
    id: "12",
    title: "Poetry Reading Cafe",
    date: "2024-07-26",
    description: "Intimate poetry session with coffee and pastries",
    category: "Literature",
    tags: ["poetry", "intimate", "thoughtful", "coffee", "literary", "quiet"],
    connections: ["11"]
  }
];

export const generateEdgesFromConnections = (nodes: EventNode[]) => {
  const edges: Array<{ source: string; target: string; label: string }> = [];
  
  nodes.forEach(node => {
    if (node.connections) {
      node.connections.forEach(targetId => {
        // Only create edge if it doesn't already exist
        if (!edges.some(edge => 
          (edge.source === node.id && edge.target === targetId) ||
          (edge.source === targetId && edge.target === node.id)
        )) {
          edges.push({
            source: node.id,
            target: targetId,
            label: 'Connected'
          });
        }
      });
    }
  });
  
  return edges;
};

/**
 * Create a tag-centered graph structure with a central tag node
 * and event nodes radiating out from it
 */
export const createTagCenteredGraph = (
  centralTag: string, 
  relatedEvents: EventNode[]
): TagCenteredGraphData => {
  const nodes: GraphNode[] = [];
  const edges: Array<{ source: string; target: string; label: string }> = [];

  // Create the central tag node
  const tagNodeId = `tag-${centralTag}`;
  nodes.push({
    id: tagNodeId,
    type: 'tag',
    data: {
      id: tagNodeId,
      name: centralTag,
      type: 'tag',
      isCenter: true
    }
  });

  // Add event nodes and connect them to the central tag
  relatedEvents.forEach(event => {
    // Add event node
    nodes.push({
      id: event.id,
      type: 'event',
      data: event
    });

    // Connect event to central tag
    edges.push({
      source: tagNodeId,
      target: event.id,
      label: 'has tag'
    });
  });

  return {
    nodes,
    edges,
    centralTag
  };
}; 