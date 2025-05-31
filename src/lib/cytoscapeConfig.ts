import cytoscape from 'cytoscape';

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

export const initializeCytoscape = (
  container: HTMLDivElement,
  events: Event[],
  edges: Edge[]
) => {
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
      }
    ],
    layout: {
      name: 'cose',
      idealEdgeLength: () => 100,
      nodeOverlap: 20,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: () => 400000,
      edgeElasticity: () => 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    }
  });

  // Add nodes and edges
  cy.add(events.map(event => ({
    group: 'nodes',
    data: {
      id: event.id,
      title: event.title,
      date: event.date,
      description: event.description
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

  // Enable node dragging
  cy.on('dragfree', 'node', (evt) => {
    const node = evt.target;
    node.position('x', node.position('x'));
    node.position('y', node.position('y'));
  });

  // Add edge creation on node drag
  let sourceNode: any = null;
  
  cy.on('dragstart', 'node', (evt) => {
    sourceNode = evt.target;
  });

  cy.on('dragend', 'node', (evt) => {
    const targetNode = evt.target;
    
    if (sourceNode && targetNode && sourceNode.id() !== targetNode.id()) {
      // Check if edge already exists
      const existingEdge = cy.edges().filter(edge => 
        (edge.source().id() === sourceNode.id() && edge.target().id() === targetNode.id()) ||
        (edge.source().id() === targetNode.id() && edge.target().id() === sourceNode.id())
      );

      if (existingEdge.length === 0) {
        // Create new edge
        cy.add({
          group: 'edges',
          data: {
            source: sourceNode.id(),
            target: targetNode.id(),
            label: 'Related'
          }
        });
      }
    }
    
    sourceNode = null;
  });

  return cy;
}; 