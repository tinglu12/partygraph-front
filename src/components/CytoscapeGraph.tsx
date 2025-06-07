"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { EventNode } from '@/types/EventGraph';
import { 
  buildCytoscapeData, 
  filterCytoscapeData, 
  CytoscapeData 
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
  const [graphData, setGraphData] = useState<CytoscapeData>({ nodes: [], edges: [] });
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
  
  const containerRef = useRef<HTMLDivElement>(null);

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
      }
    };
    
    loadCytoscape();
  }, []);

  // Build graph data when events change
  useEffect(() => {
    if (events.length === 0 || !isClient) return;
    
    setIsBuilding(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      
      console.log('🔬 Building Cytoscape graph data:', {
        eventCount: events.length,
        k,
        sampleEvents: events.slice(0, 3).map(e => ({ id: e.id, title: e.title, tags: e.tags, category: e.category }))
      });
      
      // Always use full dataset - no artificial limits
      const data = buildCytoscapeData(events, k);
      
      const endTime = performance.now();
      const buildTime = endTime - startTime;
      
      setGraphData(data);
      
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
    } finally {
      setIsBuilding(false);
    }
  }, [events, k, isClient]);

  // Filter graph data when search changes (memoized to prevent unnecessary updates)
  const filteredData = useMemo(() => {
    const filtered = filterCytoscapeData(graphData, debouncedSearchQuery);
    
    console.log('🔍 Cytoscape graph filtered:', {
      originalNodes: graphData.nodes.length,
      filteredNodes: filtered.nodes.length,
      originalEdges: graphData.edges.length,
      filteredEdges: filtered.edges.length,
      searchQuery: debouncedSearchQuery
    });
    
    return filtered;
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
        // Node styles - all same size, colored by category
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'width': 40, // Same size for all nodes
            'height': 40, // Same size for all nodes
            'color': '#ffffff',
            'text-opacity': 0.9, // Default visible - will be controlled by zoom handler
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'font-family': 'Inter, system-ui, sans-serif',
            'font-size': '12px',
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
      textureOnViewport: false, // Reduce memory usage by not caching viewport textures
    });

    // Event handlers
    cy.on('tap', 'node', (event: any) => {
      const node = event.target;
      const eventData = node.data('event');
      console.log('🎯 Cytoscape node clicked:', eventData.title);
      onEventClick?.(eventData);
    });

    cy.on('mouseover', 'node', (event: any) => {
      const node = event.target;
      setHoveredNode(node.data());
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

    // Dynamic label and edge visibility optimization based on zoom level
    cy.on('zoom pan', () => {
      const zoom = cy.zoom();
      const nodeCount = cy.nodes().length;
      const shouldShow = zoom > 0.8 || nodeCount < 300;
      
      // Update both labels and edges in a single batch for performance
      cy.batch(() => {
        // Update label visibility
        cy.nodes().forEach((node: any) => {
          // Don't hide labels for selected/hovered nodes
          const isSelected = node.hasClass('selected') || node.hasClass('highlighted');
          const opacity = (shouldShow || isSelected) ? 0.9 : 0;
          node.style('text-opacity', opacity);
        });
        
        // Update edge visibility - hide edges when zoomed out for major performance boost
        cy.edges().forEach((edge: any) => {
          // Always show highlighted/selected edges for better UX
          const isHighlighted = edge.hasClass('highlighted') || edge.hasClass('selected');
          const opacity = (shouldShow || isHighlighted) ? 0.6 : 0;
          edge.style('opacity', opacity);
        });
      });
      
      // Only log when state actually changes
      if (shouldShow !== showLabels) {
        setShowLabels(shouldShow);
        console.log('🔤 Label & Edge visibility changed:', {
          zoom: zoom.toFixed(2),
          nodeCount,
          showLabels: shouldShow,
          edgeCount: cy.edges().length,
          reason: zoom > 0.8 ? 'zoomed in' : nodeCount < 300 ? 'few nodes' : 'too many nodes'
        });
      }
    });

    // Set initial label and edge visibility when graph first loads
    cy.ready(() => {
      const zoom = cy.zoom();
      const nodeCount = cy.nodes().length;
      const shouldShow = zoom > 0.8 || nodeCount < 300;
      
      cy.batch(() => {
        // Set initial label visibility
        cy.nodes().forEach((node: any) => {
          const opacity = shouldShow ? 0.9 : 0;
          node.style('text-opacity', opacity);
        });
        
        // Set initial edge visibility
        cy.edges().forEach((edge: any) => {
          const opacity = shouldShow ? 0.6 : 0;
          edge.style('opacity', opacity);
        });
      });
      
      setShowLabels(shouldShow);
      console.log('🎯 Initial label & edge visibility set:', {
        zoom: zoom.toFixed(2),
        nodeCount,
        edgeCount: cy.edges().length,
        showLabels: shouldShow
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
      ...filteredData.edges
    ]);

    // Update tracking data
    prevDataRef.current = {
      nodeCount: filteredData.nodes.length,
      edgeCount: filteredData.edges.length,
      nodeIds: currentNodeIds
    };

    // Run layout only if this is the first time or significant structural change
    const isStructuralChange = !hasElements || Math.abs(filteredData.nodes.length - prevData.nodeCount) > 5;
    
    if (isStructuralChange) {
      console.log('🎯 Running layout for structural change...');
      cyInstance.layout({
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 800,
        animationEasing: 'ease-out',
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.4,
        numIter: 2500,
        tile: false,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
        gravityRange: 3.8,
        initialEnergyOnIncremental: 0.5,
        fit: !hasElements, // Only fit if this is the first layout
        ready: () => {
          // Restore view state after layout
          if (hasElements) {
            setTimeout(() => {
              cyInstance.zoom(zoom);
              cyInstance.pan(pan);
            }, 100);
          }
        }
      }).run();
    } else {
      // Just restore the view state for minor updates
      console.log('🔧 Minor update - preserving view state');
      cyInstance.zoom(zoom);
      cyInstance.pan(pan);
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
            {filteredData.nodes.length} events • {filteredData.edges.length} connections
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
            <p className="text-gray-300 text-sm mb-3 line-clamp-3">
              {hoveredNode.event.description}
            </p>
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
              <span>Nodes colored by category</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-purple-400/60"></div>
              <span>Edge thickness = tag similarity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-blue-400"></div>
              <span>Selected for chat</span>
            </div>
          </div>
        </div>
        
        {/* Loading Overlay */}
        {(filteredData.nodes.length === 0 && events.length > 0) || isBuilding && (
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