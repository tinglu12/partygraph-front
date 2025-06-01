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

    // If there's an overlap, try a new position with increased radius
    angle += Math.PI / 4; // Rotate by 45 degrees
    const newRadius = radius + (attempts * 20); // Increase radius with each attempt
    x = centerPos.x + newRadius * Math.cos(angle);
    y = centerPos.y + newRadius * Math.sin(angle);
    attempts++;
  }

  return { x, y };
}; 