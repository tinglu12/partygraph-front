import {
  EventNode,
  TagCenteredGraphData,
  TagCenteredNode,
} from "@/types/EventGraph";

// export const sampleEvents: EventNode[] = [
//   {
//     id: "1",
//     title: "Summer Music Festival",
//     date: "2024-07-15",
//     description: "Annual music festival featuring top artists",
//     category: "Music",
//     tags: ["festival", "outdoor", "music"],
//     connections: ["2", "3"],
//   },
//   {
//     id: "1.1",
//     title: "Downtown Jam",
//     date: "2024-07-15",
//     description: "music and jamming",
//     category: "Music",
//     tags: ["festival", "indoor", "music"],
//     connections: ["2", "3"],
//   },

//   {
//     id: "2",
//     title: "Food & Wine Expo",
//     date: "2024-07-16",
//     description: "Culinary delights and wine tasting",
//     category: "Food",
//     tags: ["food", "wine", "tasting"],
//     connections: ["1", "4"],
//   },
//   {
//     id: "3",
//     title: "Art Gallery Opening",
//     date: "2024-07-17",
//     description: "Contemporary art exhibition",
//     category: "Art",
//     tags: ["art", "exhibition", "gallery"],
//     connections: ["1", "5"],
//   },
//   {
//     id: "4",
//     title: "Tech Conference",
//     date: "2024-07-18",
//     description: "Latest innovations in technology",
//     category: "Technology",
//     tags: ["tech", "conference", "innovation"],
//     connections: ["2", "5"],
//   },
//   {
//     id: "5",
//     title: "Fashion Show",
//     date: "2024-07-19",
//     description: "Spring/Summer collection showcase",
//     category: "Fashion",
//     tags: ["fashion", "show", "design"],
//     connections: ["3", "4"],
//   },
// ];

export const generateEdgesFromConnections = (nodes: EventNode[]) => {
  const edges: Array<{ source: string; target: string; label: string }> = [];
  const nodeIds = new Set(nodes.map((node) => node.id));

  nodes.forEach((node) => {
    if (node.connections) {
      node.connections.forEach((targetId) => {
        // Only create edge if target node exists and edge doesn't already exist
        if (
          nodeIds.has(targetId) &&
          !edges.some(
            (edge) =>
              (edge.source === node.id && edge.target === targetId) ||
              (edge.source === targetId && edge.target === node.id)
          )
        ) {
          edges.push({
            source: node.id,
            target: targetId,
            label: "",
          });
        }
      });
    }
  });

  return edges;
};

/**
 * Creates a tag-centered graph structure for visualization
 * Places the central tag in the middle with related events around it
 */
export const createTagCenteredGraph = (
  centralTag: string,
  relatedEvents: EventNode[]
): TagCenteredGraphData => {
  const nodes: TagCenteredNode[] = [];
  const edges: Array<{ source: string; target: string; label: string }> = [];

  // Create central tag node
  const tagNodeId = `tag-${centralTag}`;
  nodes.push({
    id: tagNodeId,
    type: "tag",
    data: { tag: centralTag },
  });

  // Create event nodes and connect them to the central tag
  relatedEvents.forEach((event) => {
    nodes.push({
      id: event.id,
      type: "event",
      data: event,
    });

    // Connect each event to the central tag
    edges.push({
      source: tagNodeId,
      target: event.id,
      label: "tagged with",
    });
  });

  return {
    centralTag,
    nodes,
    edges,
  };
};
