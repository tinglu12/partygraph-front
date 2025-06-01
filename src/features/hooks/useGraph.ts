import { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import { initializeCytoscape } from '@/lib/cytoscapeConfig';
import { EventNode, TagCenteredNode } from '@/types/EventGraph';
import { GraphData } from '@/types/EventGraph';
import { calculateNodePosition } from '@/lib/nodePositioning';
import { Tag } from '@/types/EventGraph';

interface UseGraphProps {
  data?: GraphData;
  events?: EventNode[];
  edges?: Array<{
    source: string;
    target: string;
    label: string;
  }>;
}

interface UseGraphReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  selectedEvent: EventNode | null;
  filteredEvents: EventNode[];
  filteredEdges: Array<{ source: string; target: string; label: string; }>;
  allTags: Array<{ id: string; name: string; type: string; }>;
  handleSearch: (query: string) => void;
  handleCategoryChange: (category: string) => void;
  setSelectedEvent: (event: EventNode | null) => void;
  resetView: () => void;
}

export const useGraph = ({ 
  data,
  events = [],
  edges = []
}: UseGraphProps): UseGraphReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventNode | null>(null);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filteredEdges, setFilteredEdges] = useState(edges);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [graphEvents, setGraphEvents] = useState<EventNode[]>([]);
  const [graphTags, setGraphTags] = useState<Tag[]>([]);
  const graphEventsRef = useRef<EventNode[]>([]);
  const graphTagsRef = useRef<Tag[]>([]);

  // Memoize the tags to prevent unnecessary recalculations
  const allTags = useMemo(() => 
    Array.from(new Set(events.flatMap(event => event.tags || []))).map(tag => ({
      id: `tag-${tag}`,
      name: tag,
      type: 'tag'
    })), [events]);

  // Update ref whenever graphEvents changes
  useEffect(() => {
    graphEventsRef.current = graphEvents;
    graphTagsRef.current = graphTags;
  }, [graphEvents, graphTags]);

  const fetchEventsByTag = async (tag: string | undefined) => {
    console.log('fetching events by tag', tag);
    console.log('graphTags', graphTags);
    try {
      const response = await fetch(`/api/events/tags?query=${encodeURIComponent(tag || '')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  };

  const isEventNodeExists = (nodeId: string): boolean => {
    if (!cyRef.current) return false;
    const node = cyRef.current.getElementById(nodeId);
    return node.length > 0;
  };

  const expandTagNode = async (nodeId: string) => {
    if (!cyRef.current || expandedNodes.has(nodeId)) return;

    const clickedNode = cyRef.current.getElementById(nodeId);
    const clickedPos = clickedNode.position();
    console.log('clickedNode', nodeId);
    console.log('graphTagsRef.current', graphTagsRef.current);

    const tagName = graphTagsRef.current.find(tag => tag.id === nodeId);
    console.log('graphTagsRef.current', tagName);
    console.log('tagName', tagName);
    const relatedEvents = await fetchEventsByTag(tagName?.name);

    if (relatedEvents.length === 0) return;

    // Calculate the radius based on the number of nodes to place
    const radius = Math.max(250, relatedEvents.length * 50);
    const existingNodes = cyRef.current.nodes();

    relatedEvents.forEach((event: EventNode, index: number) => {
      // Check if the event node already exists
      if (isEventNodeExists(event.id)) return;

      const position = calculateNodePosition({
        centerPos: clickedPos,
        radius,
        index,
        totalNodes: relatedEvents.length,
        existingNodes
      });
      
      const existingNode = cyRef.current?.getElementById(event.id);
      if (existingNode && existingNode.length === 0) {
        cyRef.current?.add({
          group: 'nodes',
          data: {
            id: event.id,
            title: event.title,
            description: event.description,
            type: 'event',
          },
          position
        });
        console.log('event', event);
        setGraphEvents(prev => {
          // Check if event already exists in state
          if (prev.some(e => e.id === event.id)) {
            return prev;
          }
          return [...prev, event];
        });
      }

      const targetNode = cyRef.current?.getElementById(event.id);
      if (targetNode) {
        // Check if either node is in a group
        const sourceGroup = clickedNode.data('group');
        const targetGroup = targetNode.data('group');
        
        // Only create edge if neither node is in a group
        if (!sourceGroup && !targetGroup) {
          const existingEdges = cyRef.current?.edges().filter(edge => 
            (edge.source().id() === nodeId && edge.target().id() === event.id) ||
            (edge.source().id() === event.id && edge.target().id() === nodeId)
          ) || [];

          if (existingEdges.length === 0) {
            cyRef.current?.add({
              group: 'edges',
              data: {
                source: nodeId,
                target: event.id,
                label: 'has'
              }
            });
          }
        }
      }
    });

    setExpandedNodes(prev => new Set([...prev, nodeId]));
  };

  const expandEventNode = (nodeId: string) => {
    if (!cyRef.current || expandedNodes.has(nodeId)) return;

    const clickedNode = cyRef.current.getElementById(nodeId);
    const clickedPos = clickedNode.position();

    const event = graphEventsRef.current.find(e => e.id === nodeId);

    if (!event?.tags) return;

    const radius = Math.max(200, event.tags.length * 50);
    const existingNodes = cyRef.current.nodes();
    console.log(event.tags);
    event.tags.forEach((tag: string, index: number) => {
      const position = calculateNodePosition({
        centerPos: clickedPos,
        radius,
        index,
        totalNodes: event.tags!.length,
        existingNodes
      });
      
      // Create a unique ID for this tag instance
      const tagId = `tag-${tag}-${nodeId}-${index}`;
      const existingTagNode = cyRef.current?.getElementById(tagId);
      if(existingTagNode?.length === 0) {
        // Always create a new tag node
        const tagNode = cyRef.current?.add({
          group: 'nodes',
          data: {
            id: tagId,
            name: tag,
            type: 'tag',
          },
          position
        });
        setGraphTags(prev => [...prev, { id: tagId, name: tag, type: 'tag' }]);

        const existingEdges = cyRef.current?.edges().filter(edge => 
          (edge.source().id() === nodeId && edge.target().id() === tagId) ||
          (edge.source().id() === tagId && edge.target().id() === nodeId)
        ) || [];

        if (existingEdges.length === 0) {
          cyRef.current?.add({
            group: 'edges',
            data: {
              source: nodeId,
              target: tagId,
              label: ''
            }
          });
        }
      }
      
    });

    setExpandedNodes(prev => new Set([...prev, nodeId]));
  };

  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;

    const cy = initializeCytoscape(containerRef.current, [], []);
    cyRef.current = cy;

    // Fetch random tags and initialize the graph
    const initializeGraph = async () => {
      try {
        const response = await fetch('/api/tags/random');
        if (!response.ok) {
          throw new Error('Failed to fetch random tags');
        }
        const randomTags = await response.json();
        console.log('randomTags', randomTags);

        const centerX = cy.width() / 2;
        const centerY = cy.height() / 2;
        const minDistance = 200; // Minimum distance between nodes
        const maxAttempts = 50; // Maximum attempts to find non-overlapping position

        const placedPositions: { x: number; y: number }[] = [];

        randomTags.forEach((tag: string, index: number) => {
          let position;
          let attempts = 0;
          let isOverlapping = true;

          while (isOverlapping && attempts < maxAttempts) {
            // Generate random position within the viewport
            const x = Math.random() * (cy.width() - 200) + 100; // Keep some margin from edges
            const y = Math.random() * (cy.height() - 200) + 100;

            // Check if this position overlaps with any existing nodes
            isOverlapping = placedPositions.some(pos => {
              const dx = pos.x - x;
              const dy = pos.y - y;
              return Math.sqrt(dx * dx + dy * dy) < minDistance;
            });

            if (!isOverlapping) {
              position = { x, y };
              placedPositions.push(position);
            }

            attempts++;
          }

          // If we couldn't find a non-overlapping position, use a fallback position
          if (!position) {
            const angle = (index * 2 * Math.PI) / randomTags.length;
            position = {
              x: centerX + (cy.width() * 0.4) * Math.cos(angle),
              y: centerY + (cy.height() * 0.4) * Math.sin(angle)
            };
          }

          const tagId = `tag-${tag}-${index}`;
          cy.add({
            group: 'nodes',
            data: {
              id: tagId,
              name: tag,
              type: 'tag'
            },
            position
          });
          setGraphTags(prev => [...prev, { id: tagId, name: tag, type: 'tag' }]);
        });
      } catch (error) {
        console.error('Error initializing graph with random tags:', error);
      }
    };

    initializeGraph();

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeType = node.data('type');
      console.log('nodeType', nodeType);
      
      if (nodeType === 'event') {
        console.log('graphEvents', graphEventsRef.current);
        const eventData = graphEventsRef.current.find((e: EventNode) => e.id === node.id());
        console.log('eventData', eventData);
        if (eventData) {
          setSelectedEvent(eventData);
          expandEventNode(node.id());
        }
      } else if (nodeType === 'tag') {
        expandTagNode(node.id());
      }
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedEvent(null);
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphTags, expandedNodes, graphEvents]);

  useEffect(() => {
    if (!cyRef.current) return;

    const graphEvents = data?.nodes || filteredEvents;
    const graphEdges = data?.edges || filteredEdges;

    cyRef.current.elements().remove();

    cyRef.current.add(graphEvents.map((event: EventNode) => ({
      group: 'nodes',
      data: {
        id: event.id,
        title: event.title,
        description: event.description,
        type: 'event'
      }
    })));

    cyRef.current.add(graphEdges.map((edge) => ({
      group: 'edges',
      data: {
        source: edge.source,
        target: edge.target,
        label: edge.label
      }
    })));

    // Updated layout parameters for better node spacing
    cyRef.current.layout({
      name: 'cose-bilkent',
      idealEdgeLength: 300,
      nodeOverlap: 50,
      refresh: 20,
      fit: true,
      padding: 150,
      randomize: true,
      componentSpacing: 500,
      nodeRepulsion: 2000000,
      edgeElasticity: 200,
      nestingFactor: 0.2,
      gravity: 0.2,
      numIter: 6000,
      initialTemp: 2500,
      coolingFactor: 0.95,
      minTemp: 1.0,
      quality: 'proof'
    } as any).run();

    setExpandedNodes(new Set());
  }, [data, filteredEvents, filteredEdges]);

  const handleSearch = (query: string) => {
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredEvents(filtered);
    setFilteredEdges(edges.filter(edge => 
      filtered.some(event => event.id === edge.source || event.id === edge.target)
    ));
  };

  const handleCategoryChange = (category: string) => {
    const filtered = category 
      ? events.filter(event => event.category === category)
      : events;
    setFilteredEvents(filtered);
    setFilteredEdges(edges.filter(edge => 
      filtered.some(event => event.id === edge.source || event.id === edge.target)
    ));
  };

  const resetView = () => {
    if (!cyRef.current) return;
    cyRef.current.fit();
  };

  return {
    containerRef,
    selectedEvent,
    filteredEvents,
    filteredEdges,
    allTags,
    handleSearch,
    handleCategoryChange,
    setSelectedEvent,
    resetView
  };
}; 