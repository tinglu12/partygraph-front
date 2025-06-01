import { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import { initializeCytoscape } from '@/lib/cytoscapeConfig';
import { EventNode } from '@/types/EventGraph';
import { GraphData } from '@/types/EventGraph';
import { calculateNodePosition } from '@/lib/nodePositioning';

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

  // Memoize the tags to prevent unnecessary recalculations
  const allTags = useMemo(() => 
    Array.from(new Set(events.flatMap(event => event.tags || []))).map(tag => ({
      id: `tag-${tag}`,
      name: tag,
      type: 'tag'
    })), [events]);

  const fetchEventsByTag = async (tag: string) => {
    console.log('fetching events by tag', tag);
    try {
      const response = await fetch(`/api/events/tags?query=${encodeURIComponent(tag)}`);
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

    const tagName = nodeId.replace('tag-', '');

    const relatedEvents = await fetchEventsByTag(tagName);

    if (relatedEvents.length === 0) return;

    // Calculate the radius based on the number of nodes to place
    const radius = Math.max(200, relatedEvents.length * 50);
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
        setGraphEvents(prev => [...prev, event]);
        
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

    const event = events.find(e => e.id === nodeId);

    if (!event?.tags) return;

    const radius = Math.max(200, event.tags.length * 50);
    const existingNodes = cyRef.current.nodes();

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

      // Always create a new tag node
      const tagNode = cyRef.current?.add({
        group: 'nodes',
        data: {
          id: tagId,
          name: tag,
          type: 'tag',
          originalTag: tag // Store the original tag name for reference
        },
        position
      });

      if (tagNode) {
        // Check if either node is in a group
        const sourceGroup = clickedNode.data('group');
        const targetGroup = tagNode.data('group');
        
        // Only create edge if neither node is in a group
        if (!sourceGroup && !targetGroup) {
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
                label: 'tagged'
              }
            });
          }
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

        const centerX = cy.width() / 2;
        const centerY = cy.height() / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        randomTags.forEach((tag: string, index: number) => {
          const angle = (index * 2 * Math.PI) / randomTags.length;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          cy.add({
            group: 'nodes',
            data: {
              id: `tag-${tag}`,
              name: tag,
              type: 'tag'
            },
            position: { x, y }
          });
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
        console.log('graphEvents', graphEvents);
        const eventData = graphEvents.find((e: EventNode) => e.id === node.id());
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
  }, []);

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

  return {
    containerRef,
    selectedEvent,
    filteredEvents,
    filteredEdges,
    allTags,
    handleSearch,
    handleCategoryChange,
    setSelectedEvent
  };
}; 