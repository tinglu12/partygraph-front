"use client";
import { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import { initializeCytoscape } from '@/lib/cytoscapeConfig';
import { EventNode, GraphData, sampleEvents, generateEdgesFromConnections } from '@/lib/sampleData';
import { EventDetails } from './EventDetails';
import { FilterBar } from './FilterBar';

interface GraphProps {
  data?: GraphData;
  events?: EventNode[];
  edges?: Array<{
    source: string;
    target: string;
    label: string;
  }>;
}

export const Graph = ({ 
  data,
  events = sampleEvents, 
  edges = generateEdgesFromConnections(sampleEvents)
}: GraphProps) => {
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

    // Get the clicked node's position
    const clickedNode = cyRef.current.getElementById(nodeId);
    const clickedPos = clickedNode.position();
    const tagName = nodeId.replace('tag-', '');

    // Find events that have this tag
    const relatedEvents = events.filter(event => 
      event.tags?.includes(tagName)
    ).slice(0, 4); // Limit to 4 events

    if (relatedEvents.length === 0) return;

    // Add new nodes in a circular pattern around the clicked node
    const radius = 150; // Distance from clicked node
    relatedEvents.forEach((event, index) => {
      const angle = (index * 2 * Math.PI) / relatedEvents.length;
      const x = clickedPos.x + radius * Math.cos(angle);
      const y = clickedPos.y + radius * Math.sin(angle);

      // Check if node already exists
      const existingNode = cyRef.current?.getElementById(event.id);
      if (!existingNode) {
        // Add the new node and wait for it to be added
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

      // Ensure the node exists before creating the edge
      const targetNode = cyRef.current?.getElementById(event.id);
      if (targetNode) {
        // Check if edge already exists
        const existingEdges = cyRef.current?.edges().filter(edge => 
          (edge.source().id() === nodeId && edge.target().id() === event.id) ||
          (edge.source().id() === event.id && edge.target().id() === nodeId)
        ) || [];

        if (existingEdges.length === 0) {
          // Add edge from tag to event
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
    });

    // Mark node as expanded
    setExpandedNodes(prev => new Set([...prev, nodeId]));
  };

  const expandEventNode = (nodeId: string) => {
    if (!cyRef.current || expandedNodes.has(nodeId)) return;

    // Get the clicked node's position
    const clickedNode = cyRef.current.getElementById(nodeId);
    const clickedPos = clickedNode.position();
    const event = events.find(e => e.id === nodeId);
    console.log(event);
    if (!event?.tags) return;

    // Add tag nodes in a circular pattern around the clicked node
    const radius = 150; // Distance from clicked node
    event.tags.forEach((tag, index) => {
      const angle = (index * 2 * Math.PI) / event.tags!.length;
      const x = clickedPos.x + radius * Math.cos(angle);
      const y = clickedPos.y + radius * Math.sin(angle);
      const tagId = `tag-${tag}`;

      // Check if node already exists
      console.log(tagId);
      const existingNode = cyRef.current?.getElementById(tagId);
      console.log("existing node", existingNode);
      if (existingNode?.length === 0) {
        // Add the tag node and wait for it to be added
        const tagNode = cyRef.current?.add({
          group: 'nodes',
          data: {
            id: tagId,
            name: tag,
            type: 'tag'
          },
          position: { x, y }
        });

        // Wait for the node to be added
        console.log(tagNode);
        if (tagNode) {
          // Ensure the node exists before creating the edge
          const targetNode = cyRef.current?.getElementById(tagId);
          if (targetNode) {
            // Check if edge already exists
            const existingEdges = cyRef.current?.edges().filter(edge => 
              (edge.source().id() === nodeId && edge.target().id() === tagId) ||
              (edge.source().id() === tagId && edge.target().id() === nodeId)
            ) || [];
            console.log(targetNode);
            if (existingEdges.length === 0) {
              // Add edge from event to tag
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
      } else {
        // If node exists, just create the edge
        const existingEdges = cyRef.current?.edges().filter(edge => 
          (edge.source().id() === nodeId && edge.target().id() === tagId) ||
          (edge.source().id() === tagId && edge.target().id() === nodeId)
        ) || [];
        console.log(existingEdges);
        if (existingEdges.length === 0) {
          // Add edge from event to tag
          
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
    });

    // Mark node as expanded
    setExpandedNodes(prev => new Set([...prev, nodeId]));
  };

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;

    const graphEvents = data?.nodes || filteredEvents;
    const graphEdges = data?.edges || filteredEdges;

    const cy = initializeCytoscape(containerRef.current, graphEvents, graphEdges);
    cyRef.current = cy;

    // Add click handler for nodes
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

    // Clear selection when clicking on background
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
  }, []); // Only run on mount

  // Update graph when filtered data changes
  useEffect(() => {
    if (!cyRef.current) return;

    const graphEvents = data?.nodes || filteredEvents;
    const graphEdges = data?.edges || filteredEdges;

    // Remove existing elements
    cyRef.current.elements().remove();

    // Add event nodes only
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

    // Add initial edges
    cyRef.current.add(graphEdges.map(edge => ({
      group: 'edges',
      data: {
        source: edge.source,
        target: edge.target,
        label: edge.label
      }
    })));

    // Run layout
    cyRef.current.layout({
      name: 'cose-bilkent',
      idealEdgeLength: 250,
      nodeOverlap: 100,
      refresh: 20,
      fit: true,
      padding: 100,
      randomize: true,
      componentSpacing: 400,
      nodeRepulsion: 1000000,
      edgeElasticity: 400,
      nestingFactor: 0.1,
      gravity: 0.1,
      numIter: 5000,
      initialTemp: 2000,
      coolingFactor: 0.99,
      minTemp: 1.0,
      quality: 'proof'
    } as any).run();

    // Reset expanded nodes when filter changes
    setExpandedNodes(new Set());
  }, [data, filteredEvents, filteredEdges]);

  const handleSearch = (query: string) => {
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredEvents(filtered);
    setFilteredEdges(generateEdgesFromConnections(filtered));
  };

  const handleCategoryChange = (category: string) => {
    const filtered = category 
      ? events.filter(event => event.category === category)
      : events;
    setFilteredEvents(filtered);
    setFilteredEdges(generateEdgesFromConnections(filtered));
  };

  return (
    <div className="flex flex-col h-[600px]">
      <FilterBar 
        events={events}
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
      />
      <div className="flex flex-1">
        <div 
          ref={containerRef} 
          className="flex-1 rounded-lg border bg-card"
        />
        {selectedEvent && (
          <div className="absolute top-0 right-0 h-full w-[350px] z-50 bg-background/95 shadow-lg">
            <EventDetails 
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
