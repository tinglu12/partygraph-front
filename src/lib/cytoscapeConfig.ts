import cytoscape, { NodeSingular, Core } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

// Register the layout
cytoscape.use(coseBilkent);

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  tags?: string[];
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

export const initializeCytoscape = (
  container: HTMLDivElement,
  events: Event[],
  edges: Edge[]
) => {
  // Add custom CSS for dark background that matches the purple UI
  const style = document.createElement('style');
  style.textContent = `
    .cytoscape-container {
      background: linear-gradient(135deg, 
        rgba(15, 23, 42, 0.95) 0%, 
        rgba(30, 41, 59, 0.90) 100%
      );
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .cytoscape-container canvas {
      border-radius: 12px;
      filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.4)) 
              drop-shadow(0 0 20px rgba(76, 175, 80, 0.2)) 
              drop-shadow(0 0 30px rgba(76, 175, 80, 0.1));
    }
  `;
  document.head.appendChild(style);
  
  // Add styling class to container
  container.classList.add('cytoscape-container');

  const cy = cytoscape({
    container,
    style: [
      {
        selector: 'node[type="event"]',
        style: {
          'background-color': 'rgba(0, 0, 0, 0.1)',
          'background-opacity': 0.1,
          'border-width': 4,
          'border-color': '#4CAF50',
          'border-opacity': 1,
          'label': 'data(title)',
          'text-valign': 'bottom',
          'text-halign': 'center',
          'text-wrap': 'wrap',
          'text-max-width': '120px',
          'color': '#ffffff',
          'font-size': 12,
          'font-weight': 'bold',
          'width': 50,
          'height': 50,
          'shape': 'ellipse',
          'overlay-opacity': 0,
          'ghost': 'yes',
          'ghost-offset-x': 0,
          'ghost-offset-y': 0,
          'ghost-opacity': 0.3
        }
      },
      // Luminescent ring color variations
      {
        selector: 'node[type="event"][colorIndex="1"]',
        style: {
          'border-color': '#EC4899'
        }
      },
      {
        selector: 'node[type="event"][colorIndex="2"]',
        style: {
          'border-color': '#22C55E'
        }
      },
      {
        selector: 'node[type="event"][colorIndex="3"]',
        style: {
          'border-color': '#FBbf24'
        }
      },
      {
        selector: 'node[type="event"][colorIndex="4"]',
        style: {
          'border-color': '#8B5CF6'
        }
      },
      {
        selector: 'node[type="event"][colorIndex="5"]',
        style: {
          'border-color': '#EF4444'
        }
      },
      {
        selector: 'node[type="event"][colorIndex="6"]',
        style: {
          'border-color': '#06B6D4'
        }
      },
      {
        selector: 'node[type="event"][colorIndex="7"]',
        style: {
          'border-color': '#F59E0B'
        }
      },
      {
        selector: 'node[type="tag"]',
        style: {
          'background-color': 'rgba(0, 0, 0, 0.1)',
          'background-opacity': 0.1,
          'border-width': 3,
          'border-color': '#8B5CF6',
          'border-opacity': 1,
          'label': 'data(name)',
          'text-valign': 'center',
          'text-halign': 'center',
          'text-wrap': 'wrap',
          'text-max-width': '100px',
          'color': '#ffffff',
          'font-size': 11,
          'font-weight': 'bold',
          'width': 'label',
          'height': 'label',
          'padding': '8px',
          'shape': 'round-rectangle',
          'text-justification': 'center',
          'text-margin-y': 0,
          'text-margin-x': 0,
          'min-width': '50px',
          'min-height': '25px'
        }
      },
      {
        selector: 'node:hover',
        style: {
          'border-width': 6,
          'border-opacity': 1,
          'width': 60,
          'height': 60,
          'z-index': 999,
          'ghost-opacity': 0.5
        }
      },
      {
        selector: 'node:active',
        style: {
          'border-width': 7,
          'border-opacity': 1
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
        selector: '.highlighted',
        style: {
          'background-color': 'rgba(245, 158, 11, 0.2)',
          'background-opacity': 0.2,
          'border-width': 6,
          'border-color': '#F59E0B',
          'border-opacity': 1,
          'z-index': 999,
          'opacity': 1,
          'width': 65,
          'height': 65,
          'ghost-opacity': 0.6
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

  // Add nodes and edges
  cy.add(events.map(event => ({
    group: 'nodes',
    data: {
      id: event.id,
      title: event.title,
      date: event.date,
      description: event.description,
      type: 'event'
    }
  })));

  cy.add(edges.map(edge => ({
    group: 'edges',
    data: {
      source: edge.source,
      target: edge.target,
      label: edge.label
    }
  })));

  // Initialize box selection
  boxElement = createBoxElement();
  container.appendChild(boxElement);

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
        
        // Check if any of the selected nodes are already in a group
        const existingGroups = new Set<string>();
        selectedNodes.forEach(node => {
          const group = node.data('group');
          if (group) {
            existingGroups.add(group);
          }
        });

        // If nodes are from different groups, don't create new connections
        if (existingGroups.size > 1) {
          console.log('Nodes are from different groups, skipping connection creation');
        } else {
          // Add group class to selected nodes
          selectedNodes.forEach(node => {
            node.addClass('grouped');
            node.data('group', groupId);
          });
        }
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
}; 