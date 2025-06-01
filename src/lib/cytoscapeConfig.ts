import cytoscape, { NodeSingular, Core } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { TagCenteredGraphData, GraphNode } from '@/lib/sampleData';

// Register the layout
cytoscape.use(coseBilkent);

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface Edge {
  source: string;
  target: string;
  label: string;
}

let isBoxSelecting = false;
let startX = 0;
let startY = 0;
let boxElement: HTMLDivElement | null = null;

const createBoxElement = () => {
  const box = document.createElement('div');
  box.style.position = 'absolute';
  box.style.border = '2px solid #4CAF50';
  box.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
  box.style.pointerEvents = 'none';
  box.style.display = 'none';
  return box;
};

const updateBox = (cy: Core, x1: number, y1: number, x2: number, y2: number) => {
  if (!boxElement) return;

  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  boxElement.style.left = `${left}px`;
  boxElement.style.top = `${top}px`;
  boxElement.style.width = `${width}px`;
  boxElement.style.height = `${height}px`;
  boxElement.style.display = 'block';
};

const getNodesInBox = (cy: Core, x1: number, y1: number, x2: number, y2: number) => {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);

  return cy.nodes().filter(node => {
    const pos = node.position();
    return pos.x >= left && pos.x <= right && pos.y >= top && pos.y <= bottom;
  });
};

/**
 * Initialize cytoscape with tag-centered layout
 * Shows a central tag node with events radiating out from it
 */
export const initializeTagCenteredCytoscape = (
  container: HTMLDivElement,
  graphData: TagCenteredGraphData
) => {
  console.log('Starting cytoscape initialization...');
  
  // Safety checks
  if (!container) {
    throw new Error('Container element is required');
  }
  
  if (!graphData || graphData.nodes.length === 0) {
    throw new Error('Graph data is required');
  }

  console.log('Graph data received:', graphData);

  try {
    const cy = cytoscape({
      container,
      style: [
        // Tag node styling - central, larger, distinctive
        {
          selector: 'node[type="tag"]',
          style: {
            'background-color': '#8B5CF6',
            'label': 'data(name)',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '120px',
            'font-size': '16px',
            'font-weight': 'bold',
            'color': 'white',
            'text-outline-color': '#5B21B6',
            'text-outline-width': '2px',
            'width': '80px',
            'height': '80px',
            'shape': 'hexagon',
            'border-width': '3px',
            'border-color': '#5B21B6'
          }
        },
        // Central tag node (even more prominent)
        {
          selector: 'node[type="tag"][isCenter="true"]',
          style: {
            'background-color': '#7C3AED',
            'width': '100px',
            'height': '100px',
            'border-width': '4px',
            'border-color': '#4C1D95',
            'font-size': '18px',
            'z-index': 999
          }
        },
        // Event node styling - smaller, around the tag
        {
          selector: 'node[type="event"]',
          style: {
            'background-color': '#10B981',
            'label': 'data(title)',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
            'font-size': '12px',
            'color': 'white',
            'text-outline-color': '#047857',
            'text-outline-width': '1px',
            'width': '60px',
            'height': '60px',
            'shape': 'roundrectangle',
            'border-width': '2px',
            'border-color': '#047857'
          }
        },
        // Edge styling
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#6B7280',
            'target-arrow-color': '#6B7280',
            'target-arrow-shape': 'triangle',
            'curve-style': 'straight',
            'opacity': 0.7
          }
        },
        // Hover effects
        {
          selector: 'node:hover',
          style: {
            'border-width': '4px',
            'opacity': 1
          }
        },
        // Selected state
        {
          selector: '.highlighted',
          style: {
            'border-color': '#F59E0B',
            'border-width': '4px',
            'opacity': 1
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#F59E0B',
            'target-arrow-color': '#F59E0B',
            'width': 4,
            'opacity': 1
          }
        }
      ]
    });

    // Verify cytoscape instance was created successfully
    if (!cy) {
      throw new Error('Failed to create cytoscape instance');
    }

    console.log('Cytoscape instance created, adding nodes and edges...');

    // Add nodes with proper data structure
    try {
      graphData.nodes.forEach((graphNode, index) => {
        console.log(`Adding node ${index + 1}:`, graphNode);
        
        if (graphNode.type === 'tag') {
          const tagData = graphNode.data as any;
          cy.add({
            group: 'nodes',
            data: {
              id: graphNode.id,
              type: 'tag',
              name: tagData.name,
              isCenter: tagData.isCenter || false
            }
          });
        } else {
          const eventData = graphNode.data as any;
          cy.add({
            group: 'nodes',
            data: {
              id: graphNode.id,
              type: 'event',
              title: eventData.title,
              date: eventData.date,
              description: eventData.description,
              category: eventData.category
            }
          });
        }
      });

      console.log(`Added ${graphData.nodes.length} nodes`);

      // Add edges
      graphData.edges.forEach((edge, index) => {
        console.log(`Adding edge ${index + 1}:`, edge);
        cy.add({
          group: 'edges',
          data: {
            source: edge.source,
            target: edge.target,
            label: edge.label
          }
        });
      });

      console.log(`Added ${graphData.edges.length} edges`);
    } catch (err) {
      console.error('Error adding nodes/edges:', err);
      throw err; // Re-throw to be caught by outer try-catch
    }

    console.log('Running layout...');

    // Use concentric layout to put tag in center with events around it
    setTimeout(() => {
      try {
        const layout = cy.layout({
          name: 'concentric',
          fit: true,
          padding: 50,
          concentric: (node: any) => {
            // Tag nodes go in the center (higher value = more central)
            return node.data('type') === 'tag' ? 2 : 1;
          },
          levelWidth: () => 1,
          minNodeSpacing: 100,
          spacingFactor: 1.5
        });
        layout.run();
        console.log('Layout applied successfully');
      } catch (layoutErr) {
        console.error('Error applying layout:', layoutErr);
      }
    }, 100);

    // Add interaction handlers
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      
      // Clear previous highlights
      cy.elements().removeClass('highlighted');
      
      // Highlight selected node
      node.addClass('highlighted');
      
      // Highlight connected elements
      node.connectedEdges().addClass('highlighted');
      node.neighborhood().addClass('highlighted');
    });

    // Clear highlights when clicking background
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted');
      }
    });

    // Add zoom and pan controls
    cy.on('mousewheel', (evt) => {
      const wheelEvent = evt.originalEvent as WheelEvent;
      if (wheelEvent.ctrlKey) {
        // Zoom with Ctrl + mousewheel
        const zoom = cy.zoom();
        const factor = wheelEvent.deltaY > 0 ? 0.9 : 1.1;
        cy.zoom({
          level: zoom * factor,
          renderedPosition: { x: evt.renderedPosition.x, y: evt.renderedPosition.y }
        });
        evt.preventDefault();
      }
    });

    console.log('Cytoscape initialization complete');
    return cy;
  } catch (err) {
    console.error('Error initializing tag-centered cytoscape:', err);
    throw err;
  }
};

export const initializeCytoscape = (
  container: HTMLDivElement,
  events: Event[],
  edges: Edge[]
) => {
  // Safety checks
  if (!container) {
    throw new Error('Container element is required');
  }
  
  if (!events || events.length === 0) {
    throw new Error('At least one event is required');
  }

  try {
    const cy = cytoscape({
      container,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4CAF50',
            'label': 'data(title)',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
            'padding': '10px',
            'shape': 'roundrectangle'
          }
        },
        {
          selector: 'node:active',
          style: {
            'background-color': '#45a049'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#666',
            'target-arrow-color': '#666',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'text-rotation': 'autorotate'
          }
        },
        {
          selector: '.grouped',
          style: {
            'background-color': '#8B5CF6',
            'border-width': 2,
            'border-color': '#6D28D9'
          }
        },
        {
          selector: '.highlighted',
          style: {
            'background-color': '#F59E0B',
            'border-width': 3,
            'border-color': '#D97706',
            'z-index': 999,
            'opacity': 1
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#F59E0B',
            'target-arrow-color': '#F59E0B',
            'width': 3,
            'z-index': 999,
            'opacity': 1
          }
        }
      ]
    });

    // Verify cytoscape instance was created successfully
    if (!cy) {
      throw new Error('Failed to create cytoscape instance');
    }

    // Add nodes and edges with error handling
    try {
      cy.add(events.map(event => ({
        group: 'nodes',
        data: {
          id: event.id,
          title: event.title,
          date: event.date,
          description: event.description
        }
      })));

      if (edges && edges.length > 0) {
        cy.add(edges.map(edge => ({
          group: 'edges',
          data: {
            source: edge.source,
            target: edge.target,
            label: edge.label
          }
        })));
      }
    } catch (err) {
      console.error('Error adding nodes/edges:', err);
      // Continue with layout even if some elements failed to add
    }

    // Initialize box selection with error handling
    try {
      boxElement = createBoxElement();
      if (container && boxElement) {
        container.appendChild(boxElement);
      }
    } catch (err) {
      console.warn('Could not initialize box selection:', err);
    }

    // Box selection events
    cy.on('mousedown', (evt) => {
      // Only start box selection if Shift key is pressed
      if (evt.target === cy && evt.originalEvent.shiftKey) {
        isBoxSelecting = true;
        const pos = evt.renderedPosition;
        startX = pos.x;
        startY = pos.y;
        updateBox(cy, startX, startY, startX, startY);
        evt.originalEvent.preventDefault(); // Prevent panning when box selecting
      }
    });

    cy.on('mousemove', (evt) => {
      if (isBoxSelecting) {
        const pos = evt.renderedPosition;
        updateBox(cy, startX, startY, pos.x, pos.y);
        evt.originalEvent.preventDefault(); // Prevent panning when box selecting
      }
    });

    cy.on('mouseup', (evt) => {
      if (isBoxSelecting) {
        const pos = evt.renderedPosition;
        const selectedNodes = getNodesInBox(cy, startX, startY, pos.x, pos.y);
        
        if (selectedNodes.length > 1) {
          // Create a group ID
          const groupId = `group-${Date.now()}`;
          
          // Add group class to selected nodes
          selectedNodes.forEach(node => {
            node.addClass('grouped');
            node.data('group', groupId);
          });

          // Create edges between all nodes in the group
          selectedNodes.forEach((node1, i) => {
            selectedNodes.forEach((node2, j) => {
              if (i < j) {
                cy.add({
                  group: 'edges',
                  data: {
                    source: node1.id(),
                    target: node2.id(),
                    label: 'Grouped'
                  }
                });
              }
            });
          });
        }

        isBoxSelecting = false;
        if (boxElement) {
          boxElement.style.display = 'none';
        }
        evt.originalEvent.preventDefault(); // Prevent panning when box selecting
      }
    });

    // Add panning controls
    cy.on('mousewheel', (evt) => {
      const wheelEvent = evt.originalEvent as WheelEvent;
      if (wheelEvent.ctrlKey) {
        // Zoom with Ctrl + mousewheel
        const zoom = cy.zoom();
        const factor = wheelEvent.deltaY > 0 ? 0.9 : 1.1;
        cy.zoom({
          level: zoom * factor,
          renderedPosition: { x: evt.renderedPosition.x, y: evt.renderedPosition.y }
        });
      } else {
        // Pan with mousewheel
        cy.panBy({
          x: -wheelEvent.deltaX,
          y: -wheelEvent.deltaY
        });
      }
    });

    // First layout: grid to spread nodes
    cy.layout({
      name: 'grid',
      rows: Math.ceil(Math.sqrt(events.length)),
      cols: Math.ceil(Math.sqrt(events.length)),
      padding: 100
    }).run();

    // After grid layout completes, run cose-bilkent
    setTimeout(() => {
      const layout = cy.layout({
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
      } as any);
      layout.run();
    }, 1000);

    // Enable node dragging
    cy.on('dragfree', 'node', (evt) => {
      const node = evt.target;
      node.position('x', node.position('x'));
      node.position('y', node.position('y'));
    });

    // Add edge creation on node drag
    let sourceNode: NodeSingular | null = null;
    
    cy.on('dragstart', 'node', (evt) => {
      sourceNode = evt.target;
    });

    cy.on('dragend', 'node', (evt) => {
      const targetNode = evt.target;
      
      if (sourceNode && targetNode && sourceNode.id() !== targetNode.id()) {
        // Check if edge already exists
        const existingEdge = cy.edges().filter(edge => 
          (edge.source().id() === sourceNode!.id() && edge.target().id() === targetNode.id()) ||
          (edge.source().id() === targetNode.id() && edge.target().id() === sourceNode!.id())
        );

        if (existingEdge.length === 0) {
          // Create new edge
          cy.add({
            group: 'edges',
            data: {
              source: sourceNode!.id(),
              target: targetNode.id(),
              label: 'Related'
            }
          });
        }
      }
      
      sourceNode = null;
    });

    // Add selection highlighting
    cy.on('select', 'node', (evt) => {
      const node = evt.target;
      node.addClass('highlighted');
      
      // Highlight connected edges
      node.connectedEdges().addClass('highlighted');
      
      // Highlight connected nodes
      node.neighborhood('node').addClass('highlighted');
    });

    cy.on('unselect', 'node', (evt) => {
      const node = evt.target;
      node.removeClass('highlighted');
      
      // Remove highlight from connected edges
      node.connectedEdges().removeClass('highlighted');
      
      // Remove highlight from connected nodes
      node.neighborhood('node').removeClass('highlighted');
    });

    // Clear highlights when clicking on the background
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted');
      }
    });

    return cy;
  } catch (err) {
    console.error('Error initializing cytoscape:', err);
    throw err;
  }
}; 