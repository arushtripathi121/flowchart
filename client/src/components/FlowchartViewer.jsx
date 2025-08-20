import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  MarkerType,
  Position,
  ConnectionMode,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';
import dagre from '@dagrejs/dagre';
import {
  HiX,
  HiDownload,
  HiViewGrid,
  HiPhotograph,
  HiExternalLink,
  HiRefresh,
  HiSave,
  HiShare
} from 'react-icons/hi';
import {
  FiTarget,
  FiLayers,
  FiLink,
  FiMaximize2,
  FiMinimize2,
  FiSettings
} from 'react-icons/fi';
import '@xyflow/react/dist/style.css';

// Constants for better maintainability
const LAYOUT_CONFIG = {
  nodeWidth: 200,
  nodeHeight: 80,
  nodesep: 100,
  ranksep: 150,
  marginx: 50,
  marginy: 50
};

const ANIMATION_CONFIG = {
  duration: 0.3,
  nodeDelay: 200,
  edgeDelay: 300
};

const EXPORT_CONFIG = {
  quality: 1.0,
  pixelRatio: 3,
  backgroundColor: '#ffffff'
};

// Enhanced Dagre layout with error handling
const createLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';

  dagreGraph.setGraph({
    rankdir: direction,
    ...LAYOUT_CONFIG
  });

  // Validate and add nodes
  const validNodes = nodes.filter(node =>
    node.id && node.data && typeof node.data === 'object'
  );

  validNodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: LAYOUT_CONFIG.nodeWidth,
      height: LAYOUT_CONFIG.nodeHeight
    });
  });

  // Validate and add edges
  const validEdges = edges.filter(edge =>
    edge.source && edge.target &&
    validNodes.some(n => n.id === edge.source) &&
    validNodes.some(n => n.id === edge.target)
  );

  validEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = validNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    if (!nodeWithPosition) {
      console.warn(`Layout position not found for node ${node.id}`);
      return {
        ...node,
        position: { x: 0, y: 0 }
      };
    }

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - LAYOUT_CONFIG.nodeWidth / 2,
        y: nodeWithPosition.y - LAYOUT_CONFIG.nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges: validEdges };
};

// Enhanced styling functions
const getNodeStyles = (nodeType) => {
  const baseStyle = {
    width: LAYOUT_CONFIG.nodeWidth - 20,
    minHeight: '60px',
    padding: '16px',
    borderRadius: '12px',
    border: '2px solid',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  };

  const typeStyles = {
    input: {
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6',
    },
    output: {
      backgroundColor: '#dcfce7',
      borderColor: '#22c55e',
    },
    decision: {
      backgroundColor: '#fed7aa',
      borderColor: '#f59e0b',
    },
    default: {
      backgroundColor: '#f3f4f6',
      borderColor: '#6b7280',
    }
  };

  return { ...baseStyle, ...(typeStyles[nodeType] || typeStyles.default) };
};

const createStyledEdge = (edge) => ({
  ...edge,
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#3b82f6',
  },
  style: {
    strokeWidth: 2,
    stroke: '#3b82f6',
  },
  labelStyle: {
    fill: '#374151',
    fontWeight: 600,
    fontSize: 12,
  },
  labelBgStyle: {
    fill: '#ffffff',
    fillOpacity: 0.9,
    rx: 4,
  },
  labelBgPadding: [8, 4],
});

// Custom hooks for better state management
const useFlowchartState = (flowchartData, layoutDirection) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const processedData = useMemo(() => {
    if (!flowchartData?.data?.nodes || !flowchartData?.data?.edges) {
      return { nodes: [], edges: [] };
    }

    try {
      const styledNodes = flowchartData.data.nodes.map(node => ({
        ...node,
        style: getNodeStyles(node.type),
        data: {
          ...node.data,
          label: node.data.label || 'Untitled Node',
        }
      }));

      const styledEdges = flowchartData.data.edges.map(createStyledEdge);

      const { nodes: layoutedNodes, edges: layoutedEdges } = createLayoutedElements(
        styledNodes,
        styledEdges,
        layoutDirection
      );

      setError(null);
      return { nodes: layoutedNodes, edges: layoutedEdges };
    } catch (err) {
      console.error('Error processing flowchart data:', err);
      setError('Failed to process flowchart data');
      return { nodes: [], edges: [] };
    }
  }, [flowchartData, layoutDirection]);

  return { processedData, isLoading, error, setIsLoading };
};

// Main component
const FlowchartViewerInner = ({ flowchartData, onClose }) => {
  const [layoutDirection, setLayoutDirection] = useState('TB');
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const reactFlowRef = useRef(null);
  const { fitView } = useReactFlow();

  const { processedData, isLoading, error, setIsLoading } = useFlowchartState(
    flowchartData,
    layoutDirection
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(processedData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(processedData.edges);

  // Update nodes and edges when processed data changes
  useEffect(() => {
    setNodes(processedData.nodes);
    setEdges(processedData.edges);
    setIsLoading(false);
  }, [processedData, setNodes, setEdges, setIsLoading]);

  // Auto-fit view on data change
  useEffect(() => {
    if (!isLoading && nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes, isLoading, fitView]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      ...createStyledEdge({ id: `e${Date.now()}`, ...params })
    }, eds)),
    [setEdges]
  );

  // Enhanced export functions
  const exportOptions = useMemo(() => [
    {
      name: 'PNG (High Quality)',
      extension: 'png',
      handler: async () => {
        const viewport = reactFlowRef.current?.querySelector('.react-flow__viewport');
        if (viewport) {
          const dataUrl = await toPng(viewport, EXPORT_CONFIG);
          saveAs(dataUrl, `flowchart-${Date.now()}.png`);
        }
      }
    },
    {
      name: 'SVG (Vector)',
      extension: 'svg',
      handler: async () => {
        const viewport = reactFlowRef.current?.querySelector('.react-flow__viewport');
        if (viewport) {
          const dataUrl = await toSvg(viewport, EXPORT_CONFIG);
          saveAs(dataUrl, `flowchart-${Date.now()}.svg`);
        }
      }
    },
    {
      name: 'JSON Data',
      extension: 'json',
      handler: () => {
        const dataStr = JSON.stringify({ nodes, edges, metadata: flowchartData?.metadata }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        saveAs(dataBlob, `flowchart-${Date.now()}.json`);
      }
    }
  ], [nodes, edges, flowchartData]);

  const handleExport = async (exportOption) => {
    setIsExporting(true);
    try {
      await exportOption.handler();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLayoutChange = useCallback((direction) => {
    setLayoutDirection(direction);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  if (!flowchartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No flowchart data provided</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading flowchart</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} 
                   bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: ANIMATION_CONFIG.duration }}
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <FiTarget className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {flowchartData.metadata?.title || 'AI Generated Flowchart'}
                    </h3>
                    <p className="text-sm text-gray-500">Interactive visualization</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 rounded-lg">
                    <FiLayers className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">{nodes.length}</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 bg-purple-50 rounded-lg">
                    <FiLink className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700 font-medium">{edges.length}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                {/* Layout Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleLayoutChange('TB')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${layoutDirection === 'TB'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-blue-600'
                      }`}
                  >
                    Vertical
                  </button>
                  <button
                    onClick={() => handleLayoutChange('LR')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${layoutDirection === 'LR'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-blue-600'
                      }`}
                  >
                    Horizontal
                  </button>
                </div>

                <button
                  onClick={() => fitView({ padding: 0.2, duration: 800 })}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Fit View"
                >
                  <HiExternalLink className="w-4 h-4 text-gray-600" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <FiMinimize2 className="w-4 h-4 text-gray-600" />
                  ) : (
                    <FiMaximize2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>

                {/* Export Dropdown */}
                <div className="relative">
                  <select
                    onChange={(e) => {
                      const option = exportOptions[e.target.selectedIndex - 1];
                      if (option) handleExport(option);
                      e.target.selectedIndex = 0;
                    }}
                    disabled={isExporting}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                             disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium
                             appearance-none cursor-pointer"
                  >
                    <option value="">
                      {isExporting ? 'Exporting...' : 'Export'}
                    </option>
                    {exportOptions.map((option, index) => (
                      <option key={index} value={option.extension}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Close"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Flowchart Container */}
          <div className="flex-1 relative" ref={reactFlowRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">Loading flowchart...</p>
                </div>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                connectionMode={ConnectionMode.Loose}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={4}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                className="bg-gradient-to-br from-blue-50 via-white to-purple-50"
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  animated: true,
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#3b82f6',
                  },
                }}
              >
                <Background
                  color="#e2e8f0"
                  gap={32}
                  size={1}
                  variant="dots"
                  className="opacity-40"
                />

                <Controls
                  position="bottom-right"
                  className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 rounded-xl"
                />

                {nodes.length > 5 && (
                  <MiniMap
                    nodeColor="#3b82f6"
                    maskColor="rgba(0, 0, 0, 0.1)"
                    position="bottom-left"
                    className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 rounded-xl"
                    pannable
                    zoomable
                  />
                )}
              </ReactFlow>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const FlowchartViewer = (props) => {
  return (
    <ReactFlowProvider>
      <FlowchartViewerInner {...props} />
    </ReactFlowProvider>
  );
};

export default FlowchartViewer;
