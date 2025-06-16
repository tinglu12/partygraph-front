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
 * Calculate semantic similarity between two events using their titles and descriptions
 * Uses a simple word overlap approach for now, can be enhanced with embeddings later
 */
export function calculateSemanticSimilarity(eventA: EventNode, eventB: EventNode): number {
  // Combine title and description for better semantic matching
  const textA = `${eventA.title} ${eventA.description || ''}`.toLowerCase();
  const textB = `${eventB.title} ${eventB.description || ''}`.toLowerCase();
  
  // Split into words and create sets
  const wordsA = new Set(textA.split(/\W+/).filter(w => w.length > 2));
  const wordsB = new Set(textB.split(/\W+/).filter(w => w.length > 2));
  
  // Calculate Jaccard similarity for words
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Calculate hybrid similarity score combining tag and semantic similarity
 * @param tagSimilarity - Jaccard similarity of tags (0-1)
 * @param semanticSimilarity - Semantic similarity of content (0-1)
 * @param tagWeight - Weight for tag similarity (0-1)
 * @param semanticWeight - Weight for semantic similarity (0-1)
 */
export function calculateHybridSimilarity(
  tagSimilarity: number,
  semanticSimilarity: number,
  tagWeight: number = 0.6,
  semanticWeight: number = 0.4
): number {
  // Normalize weights to sum to 1
  const totalWeight = tagWeight + semanticWeight;
  const normalizedTagWeight = tagWeight / totalWeight;
  const normalizedSemanticWeight = semanticWeight / totalWeight;
  
  // Calculate weighted average
  return (tagSimilarity * normalizedTagWeight) + (semanticSimilarity * normalizedSemanticWeight);
}

/**
 * Find k nearest neighbors for each event based on hybrid similarity
 * Combines tag similarity and semantic similarity
 */
export async function findKNearestNeighbors(
  events: EventNode[], 
  k: number = 5,
  tagWeight: number = 0.6,
  semanticWeight: number = 0.4
): Promise<Array<{ source: string; target: string; similarity: number; tagSimilarity: number; semanticSimilarity: number }>> {
  const startTime = performance.now();
  const edges: Array<{ 
    source: string; 
    target: string; 
    similarity: number;
    tagSimilarity: number;
    semanticSimilarity: number;
  }> = [];
  
  // Safety limit to prevent crashes
  const MAX_EVENTS = 1500;
  const limitedEvents = events.slice(0, MAX_EVENTS);
  
  console.log(`🔬 Starting hybrid KNN analysis for ${limitedEvents.length} events (limited from ${events.length})`);
  
  // Pre-filter events that have content
  const eventsWithContent = limitedEvents.filter(event => 
    (event.tags && event.tags.length > 0) || 
    (event.title && event.title.length > 0)
  );
  console.log(`📊 Events with content: ${eventsWithContent.length}/${limitedEvents.length}`);
  
  // Performance optimization: Higher similarity threshold
  const SIMILARITY_THRESHOLD = 0.15;
  
  // Process in batches for better memory management
  const BATCH_SIZE = 25;
  let processedEvents = 0;
  
  // Calculate similarity matrix and find k nearest neighbors
  for (let sourceIndex = 0; sourceIndex < eventsWithContent.length; sourceIndex++) {
    const sourceEvent = eventsWithContent[sourceIndex];
    
    // Calculate similarities to all other events
    const similarities: Array<{ 
      eventId: string; 
      similarity: number;
      tagSimilarity: number;
      semanticSimilarity: number;
      index: number 
    }> = [];
    
    for (let targetIndex = 0; targetIndex < eventsWithContent.length; targetIndex++) {
      if (sourceIndex === targetIndex) continue;
      
      const targetEvent = eventsWithContent[targetIndex];
      
      // Calculate both similarities
      const tagSimilarity = calculateJaccardSimilarity(
        sourceEvent.tags || [], 
        targetEvent.tags || []
      );
      
      const semanticSimilarity = calculateSemanticSimilarity(sourceEvent, targetEvent);
      
      // Calculate hybrid similarity
      const hybridSimilarity = calculateHybridSimilarity(
        tagSimilarity,
        semanticSimilarity,
        tagWeight,
        semanticWeight
      );
      
      // Only add if hybrid similarity is above threshold
      if (hybridSimilarity > SIMILARITY_THRESHOLD) {
        similarities.push({
          eventId: targetEvent.id,
          similarity: hybridSimilarity,
          tagSimilarity,
          semanticSimilarity,
          index: targetIndex
        });
      }
      
      // Yield point for large inner loops
      if (targetIndex % 200 === 0 && targetIndex > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Sort by hybrid similarity and take k nearest
    similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .forEach(neighbor => {
        edges.push({
          source: sourceEvent.id,
          target: neighbor.eventId,
          similarity: neighbor.similarity,
          tagSimilarity: neighbor.tagSimilarity,
          semanticSimilarity: neighbor.semanticSimilarity
        });
      });
      
    // Progress logging and yielding
    processedEvents++;
    if (processedEvents % BATCH_SIZE === 0) {
      console.log(`📈 Processed ${processedEvents}/${eventsWithContent.length} events`);
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }
  
  const endTime = performance.now();
  console.log(`⏱️ Hybrid KNN analysis completed in ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`📈 Generated ${edges.length} connections (avg ${(edges.length / eventsWithContent.length).toFixed(1)} per event)`);
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
      tagSimilarity: number;
      semanticSimilarity: number;
      weight: number;
    };
  }>;
}

export async function buildCytoscapeData(
  events: EventNode[], 
  k: number = 5,
  tagWeight: number = 0.6,
  semanticWeight: number = 0.4
): Promise<CytoscapeData> {
  // Build k-nearest neighbor edges with hybrid similarity
  const connections = await findKNearestNeighbors(events, k, tagWeight, semanticWeight);
  
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
  
  // Deduplicate bidirectional edges
  const edgeMap = new Map<string, { 
    source: string; 
    target: string; 
    similarity: number;
    tagSimilarity: number;
    semanticSimilarity: number;
  }>();
  
  connections.forEach(connection => {
    const edgeKey = [connection.source, connection.target].sort().join('-');
    const existing = edgeMap.get(edgeKey);
    if (!existing || connection.similarity > existing.similarity) {
      edgeMap.set(edgeKey, connection);
    }
  });
  
  // Create edges with metadata
  const edges = Array.from(edgeMap.values()).map((connection, index) => ({
    data: {
      id: `edge_${index}`,
      source: connection.source,
      target: connection.target,
      similarity: connection.similarity,
      tagSimilarity: connection.tagSimilarity,
      semanticSimilarity: connection.semanticSimilarity,
      weight: Math.max(1, connection.similarity * 10) // Scale for visual thickness
    }
  }));
  
  console.log('📊 Edge deduplication results:', {
    originalConnections: connections.length,
    deduplicatedEdges: edges.length,
    duplicatesRemoved: connections.length - edges.length,
    avgTagSimilarity: (edges.reduce((sum, e) => sum + e.data.tagSimilarity, 0) / edges.length).toFixed(2),
    avgSemanticSimilarity: (edges.reduce((sum, e) => sum + e.data.semanticSimilarity, 0) / edges.length).toFixed(2)
  });
  
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
export async function buildProgressiveGraph(
  events: EventNode[], 
  currentSize: number = 500,
  batchSize: number = 200,
  k: number = 5
): Promise<{ data: CytoscapeData; hasMore: boolean; nextSize: number }> {
  const maxEvents = Math.min(events.length, currentSize);
  const eventsToProcess = events.slice(0, maxEvents);
  
  console.log(`📈 Building progressive graph: ${maxEvents}/${events.length} events`);
  
  const data = await buildCytoscapeData(eventsToProcess, k);
  
  return {
    data,
    hasMore: maxEvents < events.length,
    nextSize: Math.min(events.length, currentSize + batchSize)
  };
} 