"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { EventNode } from '@/types/EventGraph';
import { 
  buildCytoscapeDataWithClusters, 
  filterCytoscapeData, 
  CytoscapeDataWithClusters 
} from '@/utils/graphAlgorithms';
import { 
  Search, 
  Settings, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Brain,
  Network,
  Eye,
  Layers,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';

// Dynamically import cytoscape to avoid SSR issues
let cytoscape: any = null;
let coseBilkent: any = null;

interface CytoscapeGraphProps {
  events: EventNode[];
  onEventClick?: (event: EventNode) => void;
  selectedEventId?: string;
  height?: number;
  className?: string;
}

/**
 * Obsidian-like force-directed graph using Cytoscape.js
 * K-nearest neighbor connections based on tag similarity
 */
export const CytoscapeGraph = ({
  events,
  onEventClick,
  selectedEventId,
  height = 600,
  className = ""
}: CytoscapeGraphProps) => {
  const [graphData, setGraphData] = useState<CytoscapeDataWithClusters>({ 
    nodes: [], 
    edges: [], 
    clusters: [], 
    clusterNodes: [] 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [k, setK] = useState(3); // K for k-nearest neighbors
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [cyInstance, setCyInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showLabels, setShowLabels] = useState(true); // Track label visibility state
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Track initial loading state
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Add performance optimization state
  const [nodeCountCache, setNodeCountCache] = useState(0);
  const [isLayoutRunning, setIsLayoutRunning] = useState(false);

  // Optimize node count calculation - cache it instead of recalculating constantly
  const updateNodeCountCache = useCallback((cy: any) => {
    if (cy && !cy.destroyed?.()) {
      const count = cy.nodes().not('[isCluster]').length;
      setNodeCountCache(count);
      return count;
    }
    return nodeCountCache;
  }, [nodeCountCache]);

  // Get dynamic node size based on cached count (much faster)
  const getDynamicNodeSize = useCallback((isWidth: boolean = true) => {
    if (nodeCountCache > 500) return isWidth ? 28 : 28;  // Reduced from 32
    if (nodeCountCache > 200) return isWidth ? 32 : 32;  // Reduced from 36
    if (nodeCountCache > 100) return isWidth ? 36 : 36;  // Reduced from 40
    return isWidth ? 40 : 40;                           // Reduced from 44
  }, [nodeCountCache]);

  // Get dynamic font size based on cached count
  const getDynamicFontSize = useCallback(() => {
    if (nodeCountCache > 500) return '9px';   // Reduced from 10px
    if (nodeCountCache > 200) return '10px';  // Reduced from 11px
    if (nodeCountCache > 100) return '11px';  // Reduced from 12px
    return '12px';                           // Reduced from 13px
  }, [nodeCountCache]);

  // Debounce search query to prevent constant updates
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 500); // Increased to 500ms for better stability

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, debouncedSearchQuery]);

  // Handle client-side mounting and dynamic imports
  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import cytoscape and layout
    const loadCytoscape = async () => {
      try {
        if (typeof window !== 'undefined') {
          const [cytoscapeModule, coseBilkentModule] = await Promise.all([
            import('cytoscape'),
            import('cytoscape-cose-bilkent')
          ]);
          
          cytoscape = cytoscapeModule.default;
          coseBilkent = coseBilkentModule.default;
          
          // Register the layout
          cytoscape.use(coseBilkent);
        }
      } catch (error) {
        console.error('Error loading Cytoscape:', error);
        setError('Failed to load graph library. Please refresh the page.');
        setIsInitialLoading(false);
      }
    };
    
    loadCytoscape();
  }, []);

  // Reset loading state when events change
  useEffect(() => {
    if (events.length > 0) {
      setIsInitialLoading(true);
    }
  }, [events.length]);

  // Build graph data when events change
  useEffect(() => {
    if (events.length === 0 || !isClient) return;
    
    setIsBuilding(true);
    setError(null);
    
    // Make graph building asynchronous to prevent UI freezing
    const buildGraphAsync = async () => {
      try {
        const startTime = performance.now();
        
        console.log('🔬 Building Cytoscape graph data:', {
          eventCount: events.length,
          k,
          sampleEvents: events.slice(0, 3).map(e => ({ id: e.id, title: e.title, tags: e.tags, category: e.category }))
        });
        
        // Yield control to browser before heavy computation
        await new Promise(resolve => setTimeout(resolve, 50)); // Longer initial delay for better UI responsiveness
        
        // Always use full dataset - no artificial limits
        const data = await buildCytoscapeDataWithClusters(events, k);
        
        // Yield control again after computation
        await new Promise(resolve => setTimeout(resolve, 50)); // Longer delay after computation
        
        const endTime = performance.now();
        const buildTime = endTime - startTime;
        
        setGraphData(data);
        setIsInitialLoading(false); // Hide initial loading when graph is ready
        
        console.log('📊 Cytoscape data built:', {
          nodeCount: data.nodes.length,
          edgeCount: data.edges.length,
          avgConnections: (data.edges.length / data.nodes.length).toFixed(1),
          buildTime: `${buildTime.toFixed(2)}ms`,
          performance: `${(data.nodes.length / buildTime * 1000).toFixed(0)} nodes/second`,
          categories: [...new Set(data.nodes.map(n => n.data.category))]
        });
        
        // Performance warnings (informational only)
        if (buildTime > 3000) {
          console.warn(`⚠️ Slow graph build: ${buildTime.toFixed(2)}ms for ${events.length} events.`);
        }
        if (data.edges.length > 2000) {
          console.warn(`⚠️ High edge count: ${data.edges.length}. Graph may be dense.`);
        }
        
      } catch (error) {
        console.error('Error building graph data:', error);
        setError('Failed to build graph. Dataset may be too large.');
        setIsInitialLoading(false);
      } finally {
        setIsBuilding(false);
      }
    };
    
    // Start async build
    buildGraphAsync();
  }, [events, k, isClient]);

  // Filter graph data when search changes (memoized to prevent unnecessary updates)
  const filteredData = useMemo(() => {
    const filtered = filterCytoscapeData(graphData, debouncedSearchQuery);
    
    // Note: For now, clusters are not filtered by search - they represent the full graph structure
    // Individual nodes within clusters will be filtered, but cluster nodes themselves remain
    // This maintains the overall graph structure visualization
    
    console.log('🔍 Cytoscape graph filtered:', {
      originalNodes: graphData.nodes.length,
      filteredNodes: filtered.nodes.length,
      originalEdges: graphData.edges.length,
      filteredEdges: filtered.edges.length,
      clusterCount: graphData.clusters.length,
      searchQuery: debouncedSearchQuery
    });
    
    return {
      ...filtered,
      clusters: graphData.clusters,
      clusterNodes: graphData.clusterNodes
    };
  }, [graphData, debouncedSearchQuery]);

  // Track previous data to detect meaningful changes
  const prevDataRef = useRef<{nodeCount: number, edgeCount: number, nodeIds: string[]}>({
    nodeCount: 0,
    edgeCount: 0,
    nodeIds: []
  });

  // Initialize Cytoscape instance (only once)
  useEffect(() => {
    if (!cytoscape || !containerRef.current || !isClient) return;

    // Only create instance if it doesn't exist
    if (cyInstance) return;

    console.log('🎨 Creating Cytoscape instance...');

    // Create new Cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      
      elements: [], // Start with empty elements
      
      style: [
        // Node styles - dynamically sized based on graph density to reduce overlap
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'width': getDynamicNodeSize(true),
            'height': getDynamicNodeSize(false),
            'color': '#ffffff',
            'text-opacity': 0.9, // Default visible - will be controlled by zoom handler
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'font-family': 'Inter, system-ui, sans-serif',
            'font-size': getDynamicFontSize(),
            'font-weight': 500,
            'text-outline-width': 2,
            'text-outline-color': '#000000',
            'text-outline-opacity': 0.7,
            'border-width': 2,
            'border-color': '#ffffff',
            'border-opacity': 0.3,
            'shadow-blur': 10,
            'shadow-color': 'data(color)',
            'shadow-opacity': 0.3,
            'shadow-offset-x': 0,
            'shadow-offset-y': 0
          }
        },
        
        // Cluster node styles - larger and more prominent
        {
          selector: 'node[isCluster]',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'width': 'data(size)', // Variable size based on cluster size
            'height': 'data(size)', // Variable size based on cluster size
            'color': '#ffffff',
            'text-opacity': 0, // Start hidden, controlled by zoom
            'text-valign': 'center',
            'text-halign': 'center',
            'text-margin-y': 0,
            'font-family': 'Inter, system-ui, sans-serif',
            'font-size': '14px', // Larger font for clusters
            'font-weight': 600, // Bolder for clusters
            'text-outline-width': 3,
            'text-outline-color': '#000000',
            'text-outline-opacity': 0.8,
            'border-width': 3,
            'border-color': '#ffffff',
            'border-opacity': 0.5,
            'shadow-blur': 15,
            'shadow-color': 'data(color)',
            'shadow-opacity': 0.4,
            'shadow-offset-x': 0,
            'shadow-offset-y': 0,
            'opacity': 0 // Start hidden, controlled by zoom
          }
        },
        
        // Selected node style
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#3B82F6',
            'border-opacity': 1,
            'shadow-blur': 20,
            'shadow-color': '#3B82F6',
            'shadow-opacity': 0.6,
            'z-index': 1000,
            'text-opacity': 0.9 // Always show selected node label
          }
        },
        
        // Hovered node style
        {
          selector: 'node:active',
          style: {
            'border-width': 3,
            'border-color': '#8B5CF6',
            'border-opacity': 0.8,
            'shadow-blur': 15,
            'shadow-color': '#8B5CF6',
            'shadow-opacity': 0.5,
            'text-opacity': 0.9 // Always show hovered node label
          }
        },
        
        // Edge styles - thickness based on similarity
        {
          selector: 'edge',
          style: {
            'width': 'data(weight)',
            'line-color': '#8B5CF6',
            'line-opacity': 0.6,
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
            'source-arrow-shape': 'none',
            'shadow-blur': 5,
            'shadow-color': '#8B5CF6',
            'shadow-opacity': 0.2
          }
        },
        
        // Highlighted edge style
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#A855F7',
            'line-opacity': 0.9,
            'shadow-blur': 10,
            'shadow-opacity': 0.4
          }
        }
      ],
      
      // Interaction options
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.2,
      motionBlur: true,
      selectionType: 'single',
      boxSelectionEnabled: false,
      autoungrabify: false,
      autounselectify: false,
      textureOnViewport: true, // False reduces memory usage by not caching viewport textures
    });

    // Event handlers
    cy.on('tap', 'node', (event: any) => {
      const node = event.target;
      const nodeData = node.data();
      
      // Handle cluster clicks - zoom to cluster
      if (nodeData.isCluster) {
        console.log('🎯 Cluster clicked:', nodeData.label);
        
        // Find all nodes in this cluster
        const clusterNodeIds = nodeData.clusterInfo.nodeIds;
        const clusterNodes = cy.nodes().filter((n: any) => 
          clusterNodeIds.includes(n.data('id')) && !n.data('isCluster')
        );
        
        if (clusterNodes.length > 0) {
          // Animate zoom to fit cluster nodes
          cy.animate({
            fit: {
              eles: clusterNodes,
              padding: 80
            }
          }, {
            duration: 800,
            easing: 'ease-out'
          });
        }
      } else {
        // Handle regular event node clicks
        const eventData = nodeData.event;
        console.log('🎯 Event node clicked:', eventData.title);
        onEventClick?.(eventData);
      }
    });

    cy.on('mouseover', 'node', (event: any) => {
      const node = event.target;
      const nodeData = node.data();
      
      // Set hovered node data with proper structure
      setHoveredNode({
        ...nodeData,
        // Ensure we have the necessary properties for both event and cluster nodes
        label: nodeData.label || 'Unknown',
        category: nodeData.category || 'general',
        tags: nodeData.tags || [],
        event: nodeData.event || null,
        isCluster: nodeData.isCluster || false,
        clusterInfo: nodeData.clusterInfo || null
      });
      
      node.addClass('highlighted');
    });

    cy.on('mouseout', 'node', () => {
      setHoveredNode(null);
      cy.nodes().removeClass('highlighted');
    });

    // Highlight connected edges on node hover
    cy.on('mouseover', 'node', (event: any) => {
      const node = event.target;
      const connectedEdges = node.connectedEdges();
      connectedEdges.addClass('highlighted');
    });

    cy.on('mouseout', 'node', () => {
      cy.edges().removeClass('highlighted');
    });

    // Level-of-Detail zoom handler with cluster transitions
    cy.on('zoom pan', () => {
      const zoom = cy.zoom();
      const nodeCount = cy.nodes().not('[isCluster]').length; // Count only event nodes
      
      // New LOD thresholds:
      // zoom < 0.5: Show cluster labels only
      // 0.5 <= zoom <= 0.8: Transition zone
      // zoom > 0.8: Show individual labels only
      
      const showClusters = zoom < 0.5;
      const showIndividuals = zoom > 0.8 || nodeCount < 100;
      const inTransition = zoom >= 0.5 && zoom <= 0.8;
      
      // Update visibility in a single batch for performance
      cy.batch(() => {
        // Handle cluster nodes
        cy.nodes('[isCluster]').forEach((clusterNode: any) => {
          const opacity = showClusters ? 1 : 0;
          const textOpacity = showClusters ? 0.9 : 0;
          
          clusterNode.style({
            'opacity': opacity,
            'text-opacity': textOpacity
          });
        });
        
        // Handle individual event nodes
        cy.nodes().not('[isCluster]').forEach((eventNode: any) => {
          // Don't hide labels for selected/hovered nodes
          const isSelected = eventNode.hasClass('selected') || eventNode.hasClass('highlighted');
          
          let textOpacity = 0;
          let nodeOpacity = 1;
          
          if (showIndividuals || isSelected) {
            textOpacity = 0.9;
            nodeOpacity = 1;
          } else if (inTransition) {
            // Fade transition based on zoom level
            const transitionProgress = (zoom - 0.5) / 0.3; // 0.5-0.8 range mapped to 0-1
            textOpacity = isSelected ? 0.9 : transitionProgress * 0.9;
            nodeOpacity = 0.3 + (transitionProgress * 0.7); // Fade from 30% to 100%
          } else {
            // zoom < 0.5: hide individual nodes when clusters are shown
            textOpacity = isSelected ? 0.9 : 0;
            nodeOpacity = isSelected ? 1 : 0.3; // Dim but don't hide completely
          }
          
          eventNode.style({
            'text-opacity': textOpacity,
            'opacity': nodeOpacity
          });
        });
        
        // Handle edges - hide when zoomed out for performance
        const showEdges = zoom > 0.5 || nodeCount < 200;
        cy.edges().forEach((edge: any) => {
          const isHighlighted = edge.hasClass('highlighted') || edge.hasClass('selected');
          const opacity = (showEdges || isHighlighted) ? 0.6 : 0;
          edge.style('opacity', opacity);
        });
      });
      
      // Log visibility changes for debugging
      const prevState = { showClusters: showLabels }; // Reuse existing state tracking
      if (showClusters !== prevState.showClusters) {
        setShowLabels(showClusters || showIndividuals);
        console.log('🔤 LOD visibility changed:', {
          zoom: zoom.toFixed(2),
          nodeCount,
          showClusters,
          showIndividuals,
          inTransition,
          edgeCount: cy.edges().length
        });
      }
    });

    // Set initial LOD visibility when graph first loads
    cy.ready(() => {
      const zoom = cy.zoom();
      const nodeCount = cy.nodes().not('[isCluster]').length;
      
      const showClusters = zoom < 0.5;
      const showIndividuals = zoom > 0.8 || nodeCount < 100;
      const inTransition = zoom >= 0.5 && zoom <= 0.8;
      
      cy.batch(() => {
        // Set initial cluster visibility
        cy.nodes('[isCluster]').forEach((clusterNode: any) => {
          clusterNode.style({
            'opacity': showClusters ? 1 : 0,
            'text-opacity': showClusters ? 0.9 : 0
          });
        });
        
        // Set initial individual node visibility
        cy.nodes().not('[isCluster]').forEach((eventNode: any) => {
          const textOpacity = showIndividuals ? 0.9 : 0;
          const nodeOpacity = showIndividuals ? 1 : (inTransition ? 0.5 : 0.3);
          
          eventNode.style({
            'text-opacity': textOpacity,
            'opacity': nodeOpacity
          });
        });
        
        // Set initial edge visibility
        const showEdges = zoom > 0.5 || nodeCount < 200;
        cy.edges().forEach((edge: any) => {
          edge.style('opacity', showEdges ? 0.6 : 0);
        });
      });
      
      setShowLabels(showClusters || showIndividuals);
      console.log('🎯 Initial LOD visibility set:', {
        zoom: zoom.toFixed(2),
        nodeCount,
        clusterCount: cy.nodes('[isCluster]').length,
        showClusters,
        showIndividuals,
        edgeCount: cy.edges().length
      });
    });

    setCyInstance(cy);

    return () => {
      if (cy) {
        cy.destroy();
      }
    };
  }, [cytoscape, isClient]); // Minimal dependencies

  // Update graph data without recreating instance (only when actually needed)
  useEffect(() => {
    if (!cyInstance || filteredData.nodes.length === 0) return;

    // Check if this is a meaningful change
    const currentNodeIds = filteredData.nodes.map(n => n.data.id).sort();
    const prevData = prevDataRef.current;
    
    const isMeaningfulChange = 
      filteredData.nodes.length !== prevData.nodeCount ||
      filteredData.edges.length !== prevData.edgeCount ||
      currentNodeIds.join(',') !== prevData.nodeIds.join(',');

    if (!isMeaningfulChange) {
      console.log('🚫 Skipping graph update - no meaningful changes detected');
      return;
    }

    console.log('🔄 Meaningful change detected, updating graph...');

    // Store current view state
    const zoom = cyInstance.zoom();
    const pan = cyInstance.pan();
    const hasElements = cyInstance.elements().length > 0;

    // Update elements
    cyInstance.elements().remove(); // Clear existing
    cyInstance.add([
      ...filteredData.nodes,
      ...filteredData.edges,
      ...filteredData.clusterNodes // Add cluster nodes to the graph
    ]);

    // Update tracking data
    prevDataRef.current = {
      nodeCount: filteredData.nodes.length,
      edgeCount: filteredData.edges.length,
      nodeIds: currentNodeIds
    };

    // Update node count cache immediately for performance
    updateNodeCountCache(cyInstance);

    // Run layout only if this is the first time or significant structural change
    const isStructuralChange = !hasElements || Math.abs(filteredData.nodes.length - prevData.nodeCount) > 5;
    
    if (isStructuralChange) {
      console.log('🎯 Running layout for structural change...');
      setIsLayoutRunning(true);
      
      cyInstance.layout({
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 600,        // Reduced from 800ms
        animationEasing: 'ease-out',
        
        // Simplified spacing parameters for better performance
        nodeRepulsion: 12000,          // Reduced from 18000 - still good spacing
        idealEdgeLength: 100,          // Reduced from 140 - faster calculation
        edgeElasticity: 0.35,          // Increased from 0.25 - less intensive
        nestingFactor: 0.05,           // Increased from 0.02 - less complex
        
        // Reduced iterations for much faster performance
        gravity: 0.25,                 // Increased from 0.15 - faster convergence
        numIter: 2000,                // Increased from 1500 - better layout quality
        
        // Re-enabled essential spacing controls to fix linear layout
        tile: true,                    // Re-enabled - prevents linear arrangements
        tilingPaddingVertical: 15,     // Reduced but still present if needed
        tilingPaddingHorizontal: 15,   // Reduced but still present if needed
        gravityRangeCompound: 1.8,     // Reduced from 2.5
        gravityCompound: 0.7,          // Increased from 0.5
        gravityRange: 4.0,             // Reduced from 5.5
        initialEnergyOnIncremental: 0.3, // Increased from 0.2
        
        // Quality improvements - restore some quality to fix layout
        quality: 'proof',              // Restored from 'default' - needed for proper layout
        randomize: false,
        
        // Performance optimizations
        nodeOverlap: 15,               // Reduced from 20
        refresh: 30,                   // Increased from 20 - less frequent updates
        fit: !hasElements,
        ready: () => {
          // Add defensive checks to prevent null reference errors
          if (!cyInstance || cyInstance.destroyed()) {
            console.warn('⚠️ Cytoscape instance not available during layout ready callback');
            setIsLayoutRunning(false);
            return;
          }
          
          console.log('🎯 Layout ready, applying optimized post-processing...');
          
          try {
            // Simplified cluster positioning - only if we have clusters
            if (filteredData.clusters.length > 0) {
              setTimeout(() => {
                if (cyInstance && !cyInstance.destroyed()) {
                  positionClusterNodes(cyInstance, filteredData.clusters);
                }
              }, 50); // Reduced delay
            }
            
            // Skip expensive collision detection for large graphs
            const nodeCount = cyInstance.nodes().not('[isCluster]').length;
            if (nodeCount < 400) { // Only run on smaller graphs
              setTimeout(() => {
                if (cyInstance && !cyInstance.destroyed()) {
                  optimizeNodeSpacing(cyInstance);
                }
              }, 100); // Reduced delay
            } else {
              console.log('📍 Skipping collision detection for large graph performance');
            }
            
            // Restore view state after layout
            if (hasElements) {
              setTimeout(() => {
                if (cyInstance && !cyInstance.destroyed()) {
                  cyInstance.zoom(zoom);
                  cyInstance.pan(pan);
                  setIsLayoutRunning(false);
                }
              }, 150); // Reduced delay
            } else {
              setIsLayoutRunning(false);
            }
          } catch (error) {
            console.error('Error during layout ready callback:', error);
            setIsLayoutRunning(false);
          }
        },
        stop: () => {
          console.log('🏁 Layout stopped successfully');
          setIsLayoutRunning(false);
        }
      }).run();
    } else {
      // Just restore the view state for minor updates
      console.log('🔧 Minor update - preserving view state');
      cyInstance.zoom(zoom);
      cyInstance.pan(pan);
      
      // Still update cluster positions for minor changes
      positionClusterNodes(cyInstance, filteredData.clusters);
    }
  }, [cyInstance, filteredData]);

  // Update selected node when selectedEventId changes
  useEffect(() => {
    if (!cyInstance || !selectedEventId) return;
    
    cyInstance.nodes().removeClass('selected');
    const selectedNode = cyInstance.getElementById(selectedEventId);
    if (selectedNode.length > 0) {
      selectedNode.addClass('selected');
    }
  }, [cyInstance, selectedEventId]);

  // Reset graph layout
  const resetGraph = useCallback(() => {
    if (cyInstance) {
      console.log('🔄 Resetting graph view...');
      cyInstance.animate({
        fit: {
          eles: cyInstance.elements(),
          padding: 50
        },
        center: {
          eles: cyInstance.elements()
        }
      }, {
        duration: 500,
        easing: 'ease-out'
      });
    }
  }, [cyInstance]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Simplified and much faster cluster positioning
  const positionClusterNodes = useCallback((cy: any, clusters: any[]) => {
    if (!cy || cy.destroyed?.() || !clusters?.length) return;
    
    // Fast positioning without extensive validation/logging
    clusters.forEach((cluster) => {
      if (!cluster?.id || !cluster?.nodeIds?.length) return;
      
      // Find member nodes quickly
      const memberNodes = cy.nodes().filter((n: any) => 
        cluster.nodeIds.includes(n.data('id')) && !n.data('isCluster')
      );
      
      if (memberNodes.length === 0) return;
      
      // Calculate centroid quickly
      let centerX = 0, centerY = 0, validCount = 0;
      
      memberNodes.forEach((node: any) => {
        const pos = node.position();
        if (pos?.x != null && pos?.y != null && !isNaN(pos.x) && !isNaN(pos.y)) {
          centerX += pos.x;
          centerY += pos.y;
          validCount++;
        }
      });
      
      if (validCount > 0) {
        const clusterNode = cy.getElementById(cluster.id);
        if (clusterNode.length > 0) {
          clusterNode.position({ 
            x: centerX / validCount, 
            y: centerY / validCount 
          });
        }
      }
    });
  }, []);

  // Simplified and much faster collision detection
  const optimizeNodeSpacing = useCallback((cy: any) => {
    if (!cy || cy.destroyed?.()) return;
    
    const nodes = cy.nodes().not('[isCluster]');
    const nodeCount = nodes.length;
    
    if (nodeCount === 0 || nodeCount > 300) return; // Skip for very large graphs
    
    // Quick node radius calculation
    const nodeRadius = nodeCount > 200 ? 18 : nodeCount > 100 ? 20 : 22;
    const minDistance = nodeRadius * 2.8; // Reduced multiplier for performance
    
    // Single pass collision detection (much faster)
    let adjustments = 0;
    const maxAdjustments = Math.min(100, nodeCount * 2); // Limit total adjustments
    
    for (let i = 0; i < nodes.length && adjustments < maxAdjustments; i++) {
      for (let j = i + 1; j < nodes.length && adjustments < maxAdjustments; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        const posA = nodeA.position();
        const posB = nodeB.position();
        
        // Skip invalid positions quickly
        if (!posA || !posB || isNaN(posA.x) || isNaN(posA.y) || isNaN(posB.x) || isNaN(posB.y)) continue;
        
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance && distance > 0) {
          const pushDistance = (minDistance - distance) / 2;
          const angle = Math.atan2(dy, dx);
          
          const pushX = Math.cos(angle) * pushDistance * 0.7; // Reduced push strength
          const pushY = Math.sin(angle) * pushDistance * 0.7;
          
          nodeA.position({
            x: posA.x - pushX,
            y: posA.y - pushY
          });
          
          nodeB.position({
            x: posB.x + pushX,
            y: posB.y + pushY
          });
          
          adjustments++;
        }
      }
    }
  }, []);

  if (!isClient) {
    return (
      <div className={`${className} bg-slate-900 rounded-2xl border border-white/20`} style={{ height }}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-gray-300">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="font-bold text-lg">Initializing Knowledge Graph...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : ''}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-bold text-white">
            Event Knowledge Graph
          </h3>
          <div className="text-sm text-gray-400">
            {filteredData.nodes.length} events • {filteredData.edges.length} connections • {filteredData.clusters.length} clusters
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15"
            />
            {isSearching && (
              <div className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-slate-900/95 border-white/20 text-white">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Connections per Event (k)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={k}
                    onChange={(e) => setK(parseInt(e.target.value) || 3)}
                    className="mt-1 bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Number of similar events to connect to each event
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Similarity Method</label>
                  <div className="mt-1 p-2 bg-white/10 border border-white/20 rounded text-white">
                    Jaccard (Tag Overlap)
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Connections based on shared tags between events
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Reset */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetGraph}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          {/* Fullscreen */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Graph Container */}
      <div 
        className="relative overflow-hidden bg-slate-900 border-white/20 rounded-b-2xl"
        style={{ 
          height: isFullscreen ? 'calc(100vh - 80px)' : height,
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, rgba(15, 23, 42, 1) 70%)'
        }}
      >
        <div 
          ref={containerRef} 
          className="w-full h-full"
        />
        
        {/* Node Info Overlay */}
        {hoveredNode && (
          <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 border border-white/20 max-w-sm z-10">
            <h4 className="font-bold text-white mb-2">{hoveredNode.label}</h4>
            <div className="text-sm text-gray-300 mb-2">
              <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-200 rounded-full border border-purple-400/30 text-xs">
                {hoveredNode.category}
              </span>
            </div>
            {hoveredNode.event?.description && (
              <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                {hoveredNode.event.description}
              </p>
            )}
            {hoveredNode.tags && hoveredNode.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hoveredNode.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 bg-white/10 text-white/80 rounded-full border border-white/20"
                  >
                    #{tag}
                  </span>
                ))}
                {hoveredNode.tags.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{hoveredNode.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
            {hoveredNode.isCluster && hoveredNode.clusterInfo && (
              <div className="text-xs text-gray-400 mt-2 border-t border-white/10 pt-2">
                <div>Cluster: {hoveredNode.clusterInfo.nodeIds.length} events</div>
                <div>Common tags: {hoveredNode.clusterInfo.commonTags.join(', ')}</div>
                <div className="text-purple-300 mt-1">Click to zoom to cluster</div>
              </div>
            )}
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 border border-white/20 z-10">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-purple-400" />
            <h5 className="font-semibold text-white text-sm">Graph Legend</h5>
          </div>
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Events colored by category</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-purple-400/60"></div>
              <span>Edge thickness = similarity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-blue-400"></div>
              <span>Selected for chat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-600 border-2 border-white/50"></div>
              <span>Cluster (zoom &lt; 0.5)</span>
            </div>
            <div className="text-xs text-gray-400 mt-2 border-t border-white/10 pt-2">
              <div>Zoom out: see clusters</div>
              <div>Zoom in: see individual events</div>
              <div>Click cluster to zoom to it</div>
            </div>
          </div>
        </div>
        
        {/* Initial Loading Overlay - "Loading events in your area..." */}
        {isInitialLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm z-30">
            <div className="flex flex-col items-center gap-6 text-center max-w-md">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" 
                     style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Loading events in your area...
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  Discovering amazing experiences and building connections
                </p>
                <p className="text-xs text-gray-500">
                  This may take around 30 seconds for large datasets
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading Overlay */}
        {!isInitialLoading && ((filteredData.nodes.length === 0 && events.length > 0) || isBuilding) && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-4 text-gray-300">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" 
                     style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <p className="font-bold">
                    {isBuilding ? 'Analyzing Event Relationships...' : 'Building Knowledge Graph...'}
                  </p>
                </div>
                <p className="text-sm text-gray-400">
                  {isBuilding 
                    ? `Processing ${events.length} events with K-nearest neighbor analysis`
                    : `Analyzing ${events.length} events and calculating tag similarities`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-30">
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-red-400">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-bold text-lg">Graph Error</h3>
              </div>
              <p className="text-red-200 mb-4">{error}</p>
              <Button 
                onClick={() => {
                  setError(null);
                  setIsBuilding(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 