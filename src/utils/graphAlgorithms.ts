import { EventNode } from '@/types/EventGraph';

/**
 * Calculate Jaccard similarity between two tag sets
 * Jaccard = |intersection| / |union|
 * No duplicate tags per event, pure tag overlap analysis
 */
export function calculateJaccardSimilarity(tagsA: string[], tagsB: string[]): number {
  if (!tagsA.length || !tagsB.length) return 0;
  
  // Ensure no duplicates and normalize to lowercase
  const setA = new Set(tagsA.map(tag => tag.toLowerCase().trim()));
  const setB = new Set(tagsB.map(tag => tag.toLowerCase().trim()));
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

/**
 * Find k nearest neighbors for each event based on tag similarity
 * Optimized version with performance monitoring and limits
 */
export function findKNearestNeighbors(
  events: EventNode[], 
  k: number = 5  // Increased from 3 to 5 for more connections
): Array<{ source: string; target: string; similarity: number }> {
  const startTime = performance.now();
  const edges: Array<{ source: string; target: string; similarity: number }> = [];
  
  // Safety limit to prevent crashes - increased for better coverage
  const MAX_EVENTS = 1500;
  const limitedEvents = events.slice(0, MAX_EVENTS);
  
  console.log(`🔬 Starting KNN analysis for ${limitedEvents.length} events (limited from ${events.length})`);
  
  // Pre-filter events that have tags
  const eventsWithTags = limitedEvents.filter(event => event.tags && event.tags.length > 0);
  console.log(`📊 Events with tags: ${eventsWithTags.length}/${limitedEvents.length}`);
  
  // Performance optimization: Higher similarity threshold to reduce noise and computation
  const SIMILARITY_THRESHOLD = 0.15; // Increased from 0.1 to 0.15 for better quality connections
  
  // Performance optimization: Process in batches for better memory management
  const BATCH_SIZE = 100;
  let processedEvents = 0;
  
  // Calculate similarity matrix and find k nearest neighbors
  eventsWithTags.forEach((sourceEvent, sourceIndex) => {
    // Calculate similarities to all other events
    const similarities: Array<{ eventId: string; similarity: number; index: number }> = [];
    
    eventsWithTags.forEach((targetEvent, targetIndex) => {
      if (sourceIndex === targetIndex) return; // Skip self
      
      // Performance optimization: Early exit for events with no shared tags
      const sourceTags = new Set(sourceEvent.tags || []);
      const targetTags = targetEvent.tags || [];
      const hasSharedTags = targetTags.some(tag => sourceTags.has(tag));
      
      if (!hasSharedTags) return; // Skip if no shared tags at all
      
      const similarity = calculateJaccardSimilarity(sourceEvent.tags || [], targetEvent.tags || []);
      
      // Only add if similarity is above threshold to reduce noise and improve performance
      if (similarity > SIMILARITY_THRESHOLD) {
        similarities.push({
          eventId: targetEvent.id,
          similarity,
          index: targetIndex
        });
      }
    });
    
    // Sort by similarity (descending) and take k nearest
    similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .forEach(neighbor => {
        // Add edge with similarity as weight
        edges.push({
          source: sourceEvent.id,
          target: neighbor.eventId,
          similarity: neighbor.similarity
        });
      });
      
    // Progress logging for large datasets
    processedEvents++;
    if (processedEvents % BATCH_SIZE === 0) {
      console.log(`📈 Processed ${processedEvents}/${eventsWithTags.length} events`);
    }
  });
  
  const endTime = performance.now();
  console.log(`⏱️ KNN analysis completed in ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`📈 Generated ${edges.length} connections (avg ${(edges.length / eventsWithTags.length).toFixed(1)} per event)`);
  console.log(`🚀 Performance: ${(edges.length / (endTime - startTime) * 1000).toFixed(0)} connections/second`);
  
  return edges;
}

/**
 * Get color for a category (Obsidian-like color scheme)
 */
export function getCategoryColor(category: string): string {
  const categoryLower = category?.toLowerCase() || 'general';
  
  // Category-based colors (Obsidian-inspired dark theme)
  const colorMap: { [key: string]: string } = {
    // Music & Entertainment
    music: '#8B5CF6', // Purple
    concert: '#A855F7',
    party: '#C084FC',
    nightlife: '#DDD6FE',
    entertainment: '#A78BFA',
    
    // Food & Drink
    food: '#F59E0B', // Amber
    drink: '#FBBF24',
    restaurant: '#FCD34D',
    bar: '#FDE68A',
    dining: '#FEF3C7',
    
    // Art & Culture
    art: '#10B981', // Emerald
    gallery: '#34D399',
    museum: '#6EE7B7',
    culture: '#A7F3D0',
    creative: '#34D399',
    
    // Sports & Outdoor
    sports: '#EF4444', // Red
    outdoor: '#F87171',
    fitness: '#FCA5A5',
    recreation: '#FECACA',
    
    // Tech & Business
    tech: '#3B82F6', // Blue
    technology: '#60A5FA',
    business: '#93C5FD',
    networking: '#BFDBFE',
    professional: '#DBEAFE',
    
    // Social & Community
    social: '#EC4899', // Pink
    community: '#F472B6',
    meetup: '#F9A8D4',
    gathering: '#FBCFE8',
    
    // Education & Learning
    education: '#8B5F65', // Brown-ish
    workshop: '#A16B73',
    learning: '#B87A81',
    training: '#CF8F8F',
    
    // Default
    general: '#6B7280', // Gray
    other: '#9CA3AF',
    event: '#D1D5DB'
  };
  
  // Find exact match first
  if (colorMap[categoryLower]) {
    return colorMap[categoryLower];
  }
  
  // Find partial match
  for (const [cat, color] of Object.entries(colorMap)) {
    if (categoryLower.includes(cat) || cat.includes(categoryLower)) {
      return color;
    }
  }
  
  // Generate hash-based color for unknown categories
  return generateHashColor(category || 'general');
}

/**
 * Generate a consistent color from string hash
 */
function generateHashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to HSL for better color distribution
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash) % 30); // 60-90%
  const lightness = 50 + (Math.abs(hash) % 20); // 50-70%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Convert events to Cytoscape.js data format with KNN connections
 */
export interface CytoscapeData {
  nodes: Array<{
    data: {
      id: string;
      label: string;
      category: string;
      color: string;
      event: EventNode;
      tags: string[];
    };
  }>;
  edges: Array<{
    data: {
      id: string;
      source: string;
      target: string;
      similarity: number;
      weight: number;
    };
  }>;
}

export function buildCytoscapeData(
  events: EventNode[], 
  k: number = 5
): CytoscapeData {
  // Build k-nearest neighbor edges
  const connections = findKNearestNeighbors(events, k);
  
  // Create nodes with consistent styling
  const nodes = events.map(event => ({
    data: {
      id: event.id,
      label: event.title,
      category: event.category || 'general',
      color: getCategoryColor(event.category || 'general'),
      event: event,
      tags: event.tags || []
    }
  }));
  
  // Create edges with thickness based on similarity
  const edges = connections.map((connection, index) => ({
    data: {
      id: `edge_${index}`,
      source: connection.source,
      target: connection.target,
      similarity: connection.similarity,
      weight: Math.max(1, connection.similarity * 10) // Scale for visual thickness
    }
  }));
  
  return { nodes, edges };
}

/**
 * Filter Cytoscape data based on search query
 */
export function filterCytoscapeData(
  data: CytoscapeData, 
  searchQuery?: string
): CytoscapeData {
  if (!searchQuery) {
    return data;
  }
  
  // Filter nodes based on search query
  const filteredNodes = data.nodes.filter(node => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = node.data.label.toLowerCase().includes(query);
    const matchesCategory = node.data.category.toLowerCase().includes(query);
    const matchesDescription = node.data.event.description?.toLowerCase().includes(query);
    const matchesTags = node.data.tags.some(tag => tag.toLowerCase().includes(query));
    
    return matchesTitle || matchesCategory || matchesDescription || matchesTags;
  });
  
  // Get IDs of filtered nodes
  const filteredNodeIds = new Set(filteredNodes.map(node => node.data.id));
  
  // Filter edges to only include connections between filtered nodes
  const filteredEdges = data.edges.filter(edge => 
    filteredNodeIds.has(edge.data.source) && filteredNodeIds.has(edge.data.target)
  );
  
  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
}

/**
 * Progressive graph building for better performance
 * Allows loading more events incrementally
 */
export function buildProgressiveGraph(
  events: EventNode[], 
  currentSize: number = 500,
  batchSize: number = 200,
  k: number = 5
): { data: CytoscapeData; hasMore: boolean; nextSize: number } {
  const maxEvents = Math.min(events.length, currentSize);
  const eventsToProcess = events.slice(0, maxEvents);
  
  console.log(`📈 Building progressive graph: ${maxEvents}/${events.length} events`);
  
  const data = buildCytoscapeData(eventsToProcess, k);
  
  return {
    data,
    hasMore: maxEvents < events.length,
    nextSize: Math.min(events.length, currentSize + batchSize)
  };
} 