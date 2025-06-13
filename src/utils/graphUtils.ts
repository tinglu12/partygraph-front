import { EventNode, TagCenteredGraphData } from '@/types/EventGraph';

/**
 * Extract tag nodes from events based on semantic analysis
 */
export function extractTagNodes(events: EventNode[]) {
  const tagMap = new Map<string, number>();
  
  // Count tag occurrences
  events.forEach(event => {
    if (event.tags) {
      event.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    }
  });

  // Convert to nodes
  return Array.from(tagMap.entries()).map(([tag, count]) => ({
    id: `tag_${tag}`,
    type: 'tag' as const,
    data: { id: tag, name: tag },
    position: { x: 0, y: 0 } // Position will be calculated by layout algorithm
  }));
}

/**
 * Find the central concept based on semantic analysis
 */
export function findCentralConcept(events: EventNode[]): string {
  // First try to find a common tag
  const tagFrequency = new Map<string, number>();
  events.forEach(event => {
    if (event.tags) {
      event.tags.forEach(tag => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      });
    }
  });

  // Find most frequent tag
  let centralTag = '';
  let maxFrequency = 0;
  tagFrequency.forEach((frequency, tag) => {
    if (frequency > maxFrequency) {
      maxFrequency = frequency;
      centralTag = tag;
    }
  });

  // If no tags found, use category of first event
  if (!centralTag && events.length > 0) {
    centralTag = events[0].category || 'event';
  }

  return centralTag;
}

/**
 * Extract similar tags based on semantic analysis
 */
export function extractSimilarTags(events: EventNode[]): string[] {
  const tagSet = new Set<string>();
  
  // Collect all unique tags
  events.forEach(event => {
    if (event.tags) {
      event.tags.forEach(tag => tagSet.add(tag));
    }
  });

  // Convert to array and sort by frequency
  const tagFrequency = new Map<string, number>();
  events.forEach(event => {
    if (event.tags) {
      event.tags.forEach(tag => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      });
    }
  });

  return Array.from(tagSet)
    .sort((a, b) => (tagFrequency.get(b) || 0) - (tagFrequency.get(a) || 0))
    .slice(0, 5); // Return top 5 tags
} 