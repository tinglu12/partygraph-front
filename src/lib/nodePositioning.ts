import { Core } from 'cytoscape';

interface Position {
  x: number;
  y: number;
}

interface NodePositioningOptions {
  centerPos: Position;
  radius: number;
  index: number;
  totalNodes: number;
  existingNodes: any;
  nodeSize?: number;
  maxAttempts?: number;
}

export const calculateNodePosition = ({
  centerPos,
  radius,
  index,
  totalNodes,
  existingNodes,
  nodeSize = 60,
  maxAttempts = 10
}: NodePositioningOptions): Position => {
  // Start with a base angle that's more spread out
  let angle = (index * 2 * Math.PI) / totalNodes;
  let x = centerPos.x + radius * Math.cos(angle);
  let y = centerPos.y + radius * Math.sin(angle);
  let attempts = 0;

  // Try to find a non-overlapping position
  while (attempts < maxAttempts) {
    let hasOverlap = false;
    
    // Check for overlaps with existing nodes
    for (const node of existingNodes) {
      const nodePos = node.position();
      const distance = Math.sqrt(
        Math.pow(nodePos.x - x, 2) + Math.pow(nodePos.y - y, 2)
      );
      
      if (distance < nodeSize * 2) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) break;

    // If there's an overlap, try a new position with increased radius and dynamic angle
    // Use a golden ratio based angle increment for better distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    angle += (Math.PI * 2) / goldenRatio; // This creates a more natural spiral pattern
    
    // Increase radius more gradually
    const newRadius = radius + (attempts * 15); // Reduced from 20 to 15 for smoother expansion
    x = centerPos.x + newRadius * Math.cos(angle);
    y = centerPos.y + newRadius * Math.sin(angle);
    attempts++;
  }

  return { x, y };
}; 