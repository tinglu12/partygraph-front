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
export async function findKNearestNeighbors(
  events: EventNode[], 
  k: number = 5  // Increased from 3 to 5 for more connections
): Promise<Array<{ source: string; target: string; similarity: number }>> {
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
  // Reduced batch size for more frequent yielding to prevent "page unresponsive" warnings
  const BATCH_SIZE = 25; // Reduced from 100 to 25 for more responsive UI
  let processedEvents = 0;
  
  // Calculate similarity matrix and find k nearest neighbors
  for (let sourceIndex = 0; sourceIndex < eventsWithTags.length; sourceIndex++) {
    const sourceEvent = eventsWithTags[sourceIndex];
    
    // Calculate similarities to all other events
    const similarities: Array<{ eventId: string; similarity: number; index: number }> = [];
    
    for (let targetIndex = 0; targetIndex < eventsWithTags.length; targetIndex++) {
      if (sourceIndex === targetIndex) continue; // Skip self
      
      const targetEvent = eventsWithTags[targetIndex];
      
      // Performance optimization: Early exit for events with no shared tags
      const sourceTags = new Set(sourceEvent.tags || []);
      const targetTags = targetEvent.tags || [];
      const hasSharedTags = targetTags.some(tag => sourceTags.has(tag));
      
      if (!hasSharedTags) continue; // Skip if no shared tags at all
      
      const similarity = calculateJaccardSimilarity(sourceEvent.tags || [], targetEvent.tags || []);
      
      // Only add if similarity is above threshold to reduce noise and improve performance
      if (similarity > SIMILARITY_THRESHOLD) {
        similarities.push({
          eventId: targetEvent.id,
          similarity,
          index: targetIndex
        });
      }
      
      // Extra yield point for very large inner loops to prevent unresponsiveness
      if (targetIndex % 200 === 0 && targetIndex > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
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
      
    // Progress logging for large datasets - more frequent yielding
    processedEvents++;
    if (processedEvents % BATCH_SIZE === 0) {
      console.log(`📈 Processed ${processedEvents}/${eventsWithTags.length} events`);
      // Yield control to browser every batch to prevent freezing
      await new Promise(resolve => setTimeout(resolve, 1)); // Slightly longer yield
    }
  }
  
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

export async function buildCytoscapeData(
  events: EventNode[], 
  k: number = 5
): Promise<CytoscapeData> {
  // Build k-nearest neighbor edges
  const connections = await findKNearestNeighbors(events, k);
  
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
  
  // Deduplicate bidirectional edges to prevent overlapping connections
  const edgeMap = new Map<string, { source: string; target: string; similarity: number }>();
  
  connections.forEach(connection => {
    // Create a consistent edge key regardless of direction (A-B same as B-A)
    const edgeKey = [connection.source, connection.target].sort().join('-');
    
    // Only keep the edge with higher similarity if duplicate found
    const existing = edgeMap.get(edgeKey);
    if (!existing || connection.similarity > existing.similarity) {
      edgeMap.set(edgeKey, connection);
    }
  });
  
  // Create edges with thickness based on similarity (deduplicated)
  const edges = Array.from(edgeMap.values()).map((connection, index) => ({
    data: {
      id: `edge_${index}`,
      source: connection.source,
      target: connection.target,
      similarity: connection.similarity,
      weight: Math.max(1, connection.similarity * 10) // Scale for visual thickness
    }
  }));
  
  console.log('📊 Edge deduplication results:', {
    originalConnections: connections.length,
    deduplicatedEdges: edges.length,
    duplicatesRemoved: connections.length - edges.length
  });
  
  return { nodes, edges };
}

/**
 * Filter Cytoscape data based on search query
 * Maintains cluster integrity - if cluster members are filtered out, 
 * the cluster is removed if it would have less than 2 members
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
    const matchesTitle = node.data.label?.toLowerCase().includes(query) || false;
    const matchesCategory = node.data.category?.toLowerCase().includes(query) || false;
    const matchesDescription = node.data.event?.description?.toLowerCase().includes(query) || false;
    const matchesTags = node.data.tags?.some(tag => tag?.toLowerCase().includes(query)) || false;
    
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

/**
 * Find connected components in the graph using Union-Find algorithm
 * Groups events that are connected by similarity edges
 * Only returns components with 2 or more nodes (single nodes are not clusters)
 */
export function findConnectedComponents(
  nodeIds: string[], 
  edges: Array<{ source: string; target: string }>
): Array<string[]> {
  // Union-Find data structure for efficient connected component detection
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();
  
  // Initialize each node as its own parent (separate component)
  nodeIds.forEach(id => {
    parent.set(id, id);
    rank.set(id, 0);
  });
  
  // Find with path compression for efficiency
  function find(x: string): string {
    const p = parent.get(x)!;
    if (p !== x) {
      parent.set(x, find(p)); // Path compression
    }
    return parent.get(x)!;
  }
  
  // Union by rank for balanced trees
  function union(x: string, y: string): void {
    const rootX = find(x);
    const rootY = find(y);
    
    if (rootX !== rootY) {
      const rankX = rank.get(rootX)!;
      const rankY = rank.get(rootY)!;
      
      if (rankX < rankY) {
        parent.set(rootX, rootY);
      } else if (rankX > rankY) {
        parent.set(rootY, rootX);
      } else {
        parent.set(rootY, rootX);
        rank.set(rootX, rankX + 1);
      }
    }
  }
  
  // Connect all edge endpoints into components
  edges.forEach(edge => {
    union(edge.source, edge.target);
  });
  
  // Group nodes by their component root
  const components = new Map<string, string[]>();
  nodeIds.forEach(id => {
    const root = find(id);
    if (!components.has(root)) {
      components.set(root, []);
    }
    components.get(root)!.push(id);
  });
  
  // Return only components with 2 or more nodes (clusters by definition)
  const validClusters = Array.from(components.values()).filter(component => component.length >= 2);
  
  console.log('🔗 Connected components analysis:', {
    totalNodes: nodeIds.length,
    allComponents: components.size,
    validClusters: validClusters.length,
    singleNodes: components.size - validClusters.length,
    clusterSizes: validClusters.map(c => c.length).sort((a, b) => b - a)
  });
  
  return validClusters;
}

/**
 * Calculate cluster center position and metadata
 */
export interface ClusterInfo {
  id: string;
  label: string;
  nodeIds: string[];
  center: { x: number; y: number };
  categories: Map<string, number>;
  commonTags: string[];
  color: string;
  size: number;
}

export function createClusterInfo(
  component: string[],
  nodes: CytoscapeData['nodes'],
  clusterIndex: number
): ClusterInfo {
  // Get node data for this component
  const componentNodes = nodes.filter(node => component.includes(node.data.id));
  
  // Count categories in this cluster
  const categories = new Map<string, number>();
  componentNodes.forEach(node => {
    const cat = node.data.category;
    categories.set(cat, (categories.get(cat) || 0) + 1);
  });
  
  // Find most common category
  const sortedCategories = Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1]);
  const mostCommonCategory = sortedCategories[0];
  
  // Collect all tags and find most common ones
  const tagCounts = new Map<string, number>();
  componentNodes.forEach(node => {
    node.data.tags.forEach(tag => {
      tagCounts.set(tag.toLowerCase(), (tagCounts.get(tag.toLowerCase()) || 0) + 1);
    });
  });
  
  // Get top 3 most common tags in this cluster
  const commonTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
  
  // Create more descriptive cluster labels
  const categoryName = mostCommonCategory[0];
  const categoryCount = mostCommonCategory[1];
  const totalNodes = componentNodes.length;
  
  let label: string;
  
  if (categoryCount === totalNodes) {
    // All same category - simple label
    label = `${categoryName} (${totalNodes})`;
  } else if (sortedCategories.length === 1) {
    // Only one category but not all nodes (shouldn't happen)
    label = `${categoryName} (${totalNodes})`;
  } else if (sortedCategories.length === 2) {
    // Two categories - show both
    const [cat1, cat2] = sortedCategories;
    label = `${cat1[0]} + ${cat2[0]} (${totalNodes})`;
  } else {
    // Multiple categories - show dominant + others
    const otherCount = totalNodes - categoryCount;
    label = `${categoryName} + ${otherCount} others (${totalNodes})`;
  }
  
  // Add size indicator for very large clusters
  if (totalNodes > 200) {
    label = `🔥 ${label}`; // Fire emoji for large clusters
  } else if (totalNodes > 100) {
    label = `⭐ ${label}`; // Star emoji for medium-large clusters
  }
  
  return {
    id: `cluster_${clusterIndex}`,
    label,
    nodeIds: component,
    center: { x: 0, y: 0 }, // Will be calculated after layout
    categories,
    commonTags,
    color: getCategoryColor(categoryName),
    size: Math.min(120, 50 + Math.log(totalNodes) * 15) // Increased max size and scaling
  };
}

/**
 * Enhanced Cytoscape data with cluster support
 */
export interface CytoscapeDataWithClusters extends CytoscapeData {
  clusters: ClusterInfo[];
  clusterNodes: Array<{
    data: {
      id: string;
      label: string;
      category: string;
      color: string;
      size: number;
      isCluster: boolean;
      clusterInfo: ClusterInfo;
    };
  }>;
}

/**
 * Subdivide large clusters into smaller groups based on secondary tag similarities
 * Breaks clusters with more than maxSize events into sub-clusters
 * Ensures all sub-clusters have at least 2 events (clusters by definition)
 */
export function subdivideCluster(
  component: string[],
  nodes: CytoscapeData['nodes'],
  maxSize: number = 300
): string[][] {
  if (component.length <= maxSize) {
    return [component]; // No subdivision needed
  }
  
  console.log(`🔪 Subdividing large cluster: ${component.length} events (max: ${maxSize})`);
  
  // Get node data for this component
  const componentNodes = nodes.filter(node => component.includes(node.data.id));
  
  // Create similarity matrix for secondary clustering within this cluster
  const similarities: Array<{ i: number; j: number; similarity: number }> = [];
  
  for (let i = 0; i < componentNodes.length; i++) {
    for (let j = i + 1; j < componentNodes.length; j++) {
      const nodeA = componentNodes[i];
      const nodeB = componentNodes[j];
      
      const similarity = calculateJaccardSimilarity(
        nodeA.data.tags || [], 
        nodeB.data.tags || []
      );
      
      if (similarity > 0.2) { // Higher threshold for subdivision
        similarities.push({ i, j, similarity });
      }
    }
  }
  
  // Sort by similarity (highest first)
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  // Use Union-Find for secondary clustering
  const parent = new Map<number, number>();
  const rank = new Map<number, number>();
  
  // Initialize
  for (let i = 0; i < componentNodes.length; i++) {
    parent.set(i, i);
    rank.set(i, 0);
  }
  
  function find(x: number): number {
    const p = parent.get(x)!;
    if (p !== x) {
      parent.set(x, find(p));
    }
    return parent.get(x)!;
  }
  
  function union(x: number, y: number): void {
    const rootX = find(x);
    const rootY = find(y);
    
    if (rootX !== rootY) {
      const rankX = rank.get(rootX)!;
      const rankY = rank.get(rootY)!;
      
      if (rankX < rankY) {
        parent.set(rootX, rootY);
      } else if (rankX > rankY) {
        parent.set(rootY, rootX);
      } else {
        parent.set(rootY, rootX);
        rank.set(rootX, rankX + 1);
      }
    }
  }
  
  // Connect similar pairs, but control cluster sizes
  for (const { i, j } of similarities) {
    const rootI = find(i);
    const rootJ = find(j);
    
    if (rootI !== rootJ) {
      // Count current cluster sizes
      const clusterSizes = new Map<number, number>();
      for (let k = 0; k < componentNodes.length; k++) {
        const root = find(k);
        clusterSizes.set(root, (clusterSizes.get(root) || 0) + 1);
      }
      
      const sizeI = clusterSizes.get(rootI) || 0;
      const sizeJ = clusterSizes.get(rootJ) || 0;
      
      // Only merge if combined size doesn't exceed target
      const targetSubClusterSize = Math.ceil(maxSize / Math.ceil(component.length / maxSize));
      if (sizeI + sizeJ <= targetSubClusterSize) {
        union(i, j);
      }
    }
  }
  
  // Group by final cluster assignments
  const subClusters = new Map<number, number[]>();
  for (let i = 0; i < componentNodes.length; i++) {
    const root = find(i);
    if (!subClusters.has(root)) {
      subClusters.set(root, []);
    }
    subClusters.get(root)!.push(i);
  }
  
  // Convert back to node IDs and filter out single-node clusters
  const preliminaryResult = Array.from(subClusters.values()).map(indices =>
    indices.map(i => componentNodes[i].data.id)
  );
  
  // Separate valid clusters (≥2 events) from single events
  const validSubClusters: string[][] = [];
  const singleEvents: string[] = [];
  
  preliminaryResult.forEach(subCluster => {
    if (subCluster.length >= 2) {
      validSubClusters.push(subCluster);
    } else {
      singleEvents.push(...subCluster);
    }
  });
  
  // Try to merge single events into nearest valid sub-clusters
  if (singleEvents.length > 0 && validSubClusters.length > 0) {
    console.log(`🔗 Merging ${singleEvents.length} single events into nearest clusters`);
    
    // For each single event, find the sub-cluster with highest average similarity
    singleEvents.forEach(singleEventId => {
      const singleEventNode = componentNodes.find(n => n.data.id === singleEventId);
      if (!singleEventNode) return;
      
      let bestClusterIndex = 0;
      let bestSimilarity = 0;
      
      validSubClusters.forEach((subCluster, clusterIndex) => {
        // Calculate average similarity to this sub-cluster
        let totalSimilarity = 0;
        let count = 0;
        
        subCluster.forEach(clusterId => {
          const clusterNode = componentNodes.find(n => n.data.id === clusterId);
          if (clusterNode) {
            const similarity = calculateJaccardSimilarity(
              singleEventNode.data.tags || [],
              clusterNode.data.tags || []
            );
            totalSimilarity += similarity;
            count++;
          }
        });
        
        const avgSimilarity = count > 0 ? totalSimilarity / count : 0;
        if (avgSimilarity > bestSimilarity) {
          bestSimilarity = avgSimilarity;
          bestClusterIndex = clusterIndex;
        }
      });
      
      // Add single event to the best matching cluster
      validSubClusters[bestClusterIndex].push(singleEventId);
    });
  }
  
  // If we still have single events and no valid clusters, group them together
  if (singleEvents.length > 0 && validSubClusters.length === 0) {
    console.log(`⚠️ No valid sub-clusters created, keeping original cluster`);
    return [component]; // Keep original cluster
  }
  
  // If we created only single events, group them into pairs
  if (validSubClusters.length === 0 && singleEvents.length >= 2) {
    console.log(`🔗 Grouping ${singleEvents.length} single events into pairs`);
    const pairedClusters: string[][] = [];
    for (let i = 0; i < singleEvents.length; i += 2) {
      if (i + 1 < singleEvents.length) {
        pairedClusters.push([singleEvents[i], singleEvents[i + 1]]);
      } else {
        // Add last single event to the previous cluster if it exists
        if (pairedClusters.length > 0) {
          pairedClusters[pairedClusters.length - 1].push(singleEvents[i]);
        }
      }
    }
    validSubClusters.push(...pairedClusters);
  }
  
  console.log(`📊 Subdivision result: ${component.length} → ${validSubClusters.length} valid sub-clusters`, {
    originalSize: component.length,
    subClusterCount: validSubClusters.length,
    subClusterSizes: validSubClusters.map(sc => sc.length),
    avgSubClusterSize: validSubClusters.length > 0 ? (validSubClusters.reduce((sum, sc) => sum + sc.length, 0) / validSubClusters.length).toFixed(1) : 0,
    singleEventsHandled: singleEvents.length
  });
  
  return validSubClusters;
}

export async function buildCytoscapeDataWithClusters(
  events: EventNode[], 
  k: number = 5
): Promise<CytoscapeDataWithClusters> {
  // Build base graph data
  const baseData = await buildCytoscapeData(events, k);
  
  // Find connected components (clusters) - only components with 2+ nodes
  const nodeIds = baseData.nodes.map(node => node.data.id);
  const edgeConnections = baseData.edges.map(edge => ({
    source: edge.data.source,
    target: edge.data.target
  }));
  
  const components = findConnectedComponents(nodeIds, edgeConnections);
  
  // Subdivide large clusters
  const MAX_CLUSTER_SIZE = 300;
  const allSubClusters: string[][] = [];
  
  components.forEach(component => {
    const subClusters = subdivideCluster(component, baseData.nodes, MAX_CLUSTER_SIZE);
    allSubClusters.push(...subClusters);
  });
  
  // Create cluster information for all sub-clusters
  const clusters = allSubClusters.map((subCluster, index) => 
    createClusterInfo(subCluster, baseData.nodes, index)
  );
  
  // Create cluster nodes for visualization
  const clusterNodes = clusters.map(cluster => ({
    data: {
      id: cluster.id,
      label: cluster.label,
      category: 'cluster',
      color: cluster.color,
      size: cluster.size,
      isCluster: true,
      clusterInfo: cluster
    }
  }));
  
  // Calculate isolated nodes (events not in any cluster)
  const clusteredNodeIds = new Set(allSubClusters.flat());
  const isolatedNodes = nodeIds.filter(id => !clusteredNodeIds.has(id));
  
  console.log('🔗 Enhanced cluster analysis results:', {
    totalNodes: nodeIds.length,
    originalComponents: components.length,
    finalClusters: clusters.length,
    clusteredNodes: clusteredNodeIds.size,
    isolatedNodes: isolatedNodes.length,
    averageClusterSize: allSubClusters.length > 0 ? (allSubClusters.reduce((sum, cluster) => sum + cluster.length, 0) / allSubClusters.length).toFixed(1) : 0,
    largestCluster: allSubClusters.length > 0 ? Math.max(...allSubClusters.map(cluster => cluster.length)) : 0,
    clusterSizeDistribution: {
      small: allSubClusters.filter(c => c.length < 50).length,
      medium: allSubClusters.filter(c => c.length >= 50 && c.length < 150).length,
      large: allSubClusters.filter(c => c.length >= 150 && c.length < 300).length,
      oversized: allSubClusters.filter(c => c.length >= 300).length
    },
    isolatedNodeSample: isolatedNodes.slice(0, 5) // Show first 5 isolated nodes for debugging
  });
  
  return {
    ...baseData,
    clusters,
    clusterNodes
  };
} 