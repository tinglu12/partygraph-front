import { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import { initializeCytoscape } from '@/lib/cytoscapeConfig';
import { EventNode, GraphData } from '@/lib/sampleData';

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

  // Memoize the tags to prevent unnecessary recalculations
  const allTags = useMemo(() => 
    Array.from(new Set(events.flatMap(event => event.tags || []))).map(tag => ({
      id: `tag-${tag}`,
      name: tag,
      type: 'tag'
    })), [events]);

  const expandTagNode = (nodeId: string) => {
    if (!cyRef.current || expandedNodes.has(nodeId)) return;

    const clickedNode = cyRef.current.getElementById(nodeId);
    const clickedPos = clickedNode.position();
    const tagName = nodeId.replace('tag-', '');

    const relatedEvents = events.filter(event => 
      event.tags?.includes(tagName)
    ).slice(0, 4);

    if (relatedEvents.length === 0) return;

    // Calculate the radius based on the number of nodes to place
    const radius = Math.max(200, relatedEvents.length * 50);
    const existingNodes = cyRef.current.nodes();
    const nodeSize = 60; // Approximate node size including padding

    relatedEvents.forEach((event, index) => {
      let angle = (index * 2 * Math.PI) / relatedEvents.length;
      let x = clickedPos.x + radius * Math.cos(angle);
      let y = clickedPos.y + radius * Math.sin(angle);
      let attempts = 0;
      const maxAttempts = 10;

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
        x = clickedPos.x + newRadius * Math.cos(angle);
        y = clickedPos.y + newRadius * Math.sin(angle);
        attempts++;
      }

      const existingNode = cyRef.current?.getElementById(event.id);
      if (!existingNode) {
        cyRef.current?.add({
          group: 'nodes',
          data: {
            id: event.id,
            title: event.title,
            date: event.date,
            description: event.description,
            type: 'event'
          },
          position: { x, y }
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
    const event = events.find(e => e.id === nodeId);

    if (!event?.tags) return;

    const radius = Math.max(200, event.tags.length * 50);
    const existingNodes = cyRef.current.nodes();
    const nodeSize = 60; // Approximate node size including padding

    event.tags.forEach((tag, index) => {
      let angle = (index * 2 * Math.PI) / event.tags!.length;
      let x = clickedPos.x + radius * Math.cos(angle);
      let y = clickedPos.y + radius * Math.sin(angle);
      let attempts = 0;
      const maxAttempts = 10;
      
      // Create a unique ID for this tag instance
      const tagId = `tag-${tag}-${nodeId}-${index}`;

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
        x = clickedPos.x + newRadius * Math.cos(angle);
        y = clickedPos.y + newRadius * Math.sin(angle);
        attempts++;
      }

      // Always create a new tag node
      const tagNode = cyRef.current?.add({
        group: 'nodes',
        data: {
          id: tagId,
          name: tag,
          type: 'tag',
          originalTag: tag // Store the original tag name for reference
        },
        position: { x, y }
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

    const graphEvents = data?.nodes || filteredEvents;
    const graphEdges = data?.edges || filteredEdges;

    const cy = initializeCytoscape(containerRef.current, graphEvents, graphEdges);
    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeType = node.data('type');
      
      if (nodeType === 'event') {
        const eventData = graphEvents.find(e => e.id === node.id());
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

    cyRef.current.add(graphEvents.map(event => ({
      group: 'nodes',
      data: {
        id: event.id,
        title: event.title,
        date: event.date,
        description: event.description,
        type: 'event'
      }
    })));

    cyRef.current.add(graphEdges.map(edge => ({
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
      idealEdgeLength: 300, // Increased edge length
      nodeOverlap: 50, // Reduced overlap
      refresh: 20,
      fit: true,
      padding: 150, // Increased padding
      randomize: true,
      componentSpacing: 500, // Increased component spacing
      nodeRepulsion: 2000000, // Increased repulsion
      edgeElasticity: 200, // Reduced elasticity
      nestingFactor: 0.2, // Increased nesting factor
      gravity: 0.2, // Increased gravity
      numIter: 6000, // More iterations
      initialTemp: 2500, // Higher initial temperature
      coolingFactor: 0.95, // Slower cooling
      minTemp: 1.0,
      quality: 'proof'
    } as any).run();

    setExpandedNodes(new Set());
  }, [data, filteredEvents, filteredEdges]);

  const handleSearch = (query: string) => {
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
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