// components/DiagramCanvas.jsx
import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  MarkerType,
  Position,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  Handle,
  Panel,
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  NodeResizer
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import dagre from '@dagrejs/dagre';
import {
  HiX,
  HiDownload,
  HiPlus,
  HiTrash,
  HiPencil,
} from 'react-icons/hi';
import {
  FiSquare,
  FiCircle,
  FiHexagon,
  FiType,
  FiEye,
  FiDownload as FiDownloadIcon,
  FiGrid,
  FiLayers,
  FiDatabase,
  FiBox,
  FiGitBranch,
  FiUsers,
  FiZap,
  FiTarget,
  FiTrello,
  FiActivity
} from 'react-icons/fi';
import '@xyflow/react/dist/style.css';

// ------------------------------------
// ORGANIC LAYOUT FUNCTIONS (D3-Force Style)
// ------------------------------------
const createOrganicLayout = (nodes, edges, width = 1200, height = 800) => {
  // Create clusters based on node connections
  const clusters = [];
  const nodeCluster = new Map();

  // Group connected nodes into clusters
  nodes.forEach((node, index) => {
    if (!nodeCluster.has(node.id)) {
      const cluster = [];
      const visited = new Set();

      const addToCluster = (nodeId) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        cluster.push(nodeId);

        // Find connected nodes
        edges.forEach(edge => {
          if (edge.source === nodeId && !visited.has(edge.target)) {
            addToCluster(edge.target);
          }
          if (edge.target === nodeId && !visited.has(edge.source)) {
            addToCluster(edge.source);
          }
        });
      };

      addToCluster(node.id);
      clusters.push(cluster);
      cluster.forEach(nodeId => nodeCluster.set(nodeId, clusters.length - 1));
    }
  });

  // Create organic positions with natural spacing
  const organicNodes = nodes.map((node, index) => {
    const clusterIndex = nodeCluster.get(node.id) || 0;
    const clusterSize = clusters[clusterIndex]?.length || 1;
    const nodeIndexInCluster = clusters[clusterIndex]?.indexOf(node.id) || 0;

    // Use golden ratio and natural spacing
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const angle = (nodeIndexInCluster / clusterSize) * 2 * Math.PI;
    const radius = Math.max(150, clusterSize * 60);

    // Add some randomness for organic feel
    const randomOffset = {
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100
    };

    // Calculate cluster center with natural distribution
    const clusterCenterX = (width / Math.max(clusters.length, 2)) * (clusterIndex + 1) + randomOffset.x;
    const clusterCenterY = height / 3 + Math.sin(clusterIndex * phi) * 200 + randomOffset.y;

    // Position nodes around cluster center in organic pattern
    const x = clusterCenterX + Math.cos(angle + index * 0.1) * radius + Math.random() * 80 - 40;
    const y = clusterCenterY + Math.sin(angle + index * 0.1) * radius + Math.random() * 80 - 40;

    return {
      ...node,
      position: {
        x: Math.max(50, Math.min(width - 200, x)),
        y: Math.max(50, Math.min(height - 100, y))
      }
    };
  });

  return organicNodes;
};

// ------------------------------------
// API DATA PROCESSING WITH ORGANIC LAYOUT
// ------------------------------------
const processApiData = (apiResponse) => {
  console.log('🔄 Processing API data:', apiResponse);

  if (!apiResponse || !apiResponse.success || !apiResponse.data) {
    console.error('❌ Invalid API response structure');
    return { nodes: [], edges: [], metadata: {} };
  }

  const { data, metadata } = apiResponse;
  console.log('📊 Raw data:', { nodes: data.nodes?.length, edges: data.edges?.length });

  // Process nodes from API with enhanced styling
  const processedNodes = (data.nodes || []).map((node, index) => {
    console.log('🔗 Processing node:', node.id, node);

    return {
      id: node.id,
      type: node.type || 'flowchart',
      position: node.position || { x: 0, y: 0 }, // Will be repositioned organically
      data: {
        label: node.data?.label || `Node ${node.id}`,
        shape: node.type === 'diamond' ? 'diamond' : 'rectangle',
        ...node.data,
        style: {
          backgroundColor: node.style?.backgroundColor || '#6B7280',
          color: node.style?.color || 'white',
          borderColor: node.style?.borderColor,
          borderRadius: node.style?.borderRadius,
          fontSize: node.style?.fontSize,
          fontWeight: node.style?.fontWeight,
          padding: node.style?.padding,
          ...node.style
        }
      },
      style: node.style || {},
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });

  // Process edges with beautiful curved paths
  const processedEdges = (data.edges || []).map(edge => {
    console.log('🔀 Processing edge:', edge.id, edge);

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'organic', // Use custom organic edge type
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: edge.style?.stroke || '#4A90E2',
      },
      style: {
        strokeWidth: 2.5,
        stroke: edge.style?.stroke || '#4A90E2',
        strokeDasharray: edge.style?.strokeDasharray,
        ...edge.style
      },
      data: {
        label: edge.data?.label,
        ...edge.data
      }
    };
  });

  const processedMetadata = {
    diagramType: data.metadata?.diagramType || metadata?.diagramType || 'flowchart',
    nodeCount: metadata?.nodeCount || processedNodes.length,
    edgeCount: metadata?.edgeCount || processedEdges.length,
    complexity: metadata?.complexity,
    generatedAt: metadata?.generatedAt,
    style: metadata?.style,
    ...metadata
  };

  console.log('✅ Processed data:', {
    nodes: processedNodes.length,
    edges: processedEdges.length,
    metadata: processedMetadata
  });

  return {
    nodes: processedNodes,
    edges: processedEdges,
    metadata: processedMetadata
  };
};

// ------------------------------------
// PROFESSIONAL COLOR SCHEMES
// ------------------------------------
const DIAGRAM_TYPES = {
  FLOWCHART: 'flowchart',
  ER_DIAGRAM: 'er_diagram',
  UML_CLASS: 'uml_class',
  UML_SEQUENCE: 'uml_sequence',
  NETWORK: 'network',
  ORG_CHART: 'org_chart',
  MIND_MAP: 'mind_map',
  GANTT: 'gantt',
  SWIMLANE: 'swimlane'
};

// Professional color palettes inspired by modern design systems
const COLOR_SCHEMES = {
  [DIAGRAM_TYPES.FLOWCHART]: {
    primary: '#4A90E2',    // Professional blue
    secondary: '#7B68EE',  // Medium slate blue
    success: '#50C878',    // Emerald green
    warning: '#FF8C42',    // Vibrant orange
    error: '#E74C3C',      // Soft red
    info: '#17A2B8',       // Teal
    accent: '#9B59B6',     // Purple
    neutral: '#6C7B7F'     // Cool gray
  },
  [DIAGRAM_TYPES.ER_DIAGRAM]: {
    entity: '#8E44AD',     // Deep purple
    attribute: '#F39C12',  // Orange
    relationship: '#16A085', // Teal
    key: '#C0392B',       // Dark red
    foreign: '#2980B9'    // Blue
  },
  [DIAGRAM_TYPES.UML_CLASS]: {
    class: '#3498DB',      // Bright blue
    abstract: '#9B59B6',  // Purple
    interface: '#27AE60', // Green
    enum: '#E67E22',      // Orange
    package: '#95A5A6'    // Gray
  },
  [DIAGRAM_TYPES.NETWORK]: {
    server: '#E74C3C',     // Red
    client: '#3498DB',     // Blue
    database: '#27AE60',  // Green
    cloud: '#9B59B6',     // Purple
    security: '#F39C12'   // Orange
  },
  [DIAGRAM_TYPES.ORG_CHART]: {
    executive: '#8E44AD',  // Purple
    manager: '#3498DB',    // Blue
    employee: '#27AE60',  // Green
    contractor: '#E67E22', // Orange
    department: '#34495E' // Dark gray
  }
};

// ------------------------------------
// TEXT EDITOR COMPONENT
// ------------------------------------
const TextEditor = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  style = {},
  autoFocus = true
}) => {
  const [textValue, setTextValue] = useState(value || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    setTextValue(value || '');
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [autoFocus]);

  const handleKeyDown = useCallback((e) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      onCancel?.();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit?.(textValue);
    }
  }, [textValue, onSubmit, onCancel]);

  return (
    <textarea
      ref={textareaRef}
      value={textValue}
      onChange={(e) => {
        setTextValue(e.target.value);
        onChange?.(e.target.value);
      }}
      onKeyDown={handleKeyDown}
      onBlur={() => onSubmit?.(textValue)}
      placeholder="Enter text..."
      style={{
        background: 'white',
        border: '2px solid #4A90E2',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#2C3E50',
        resize: 'none',
        outline: 'none',
        minWidth: '120px',
        minHeight: '36px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(74, 144, 226, 0.15)',
        ...style
      }}
      rows={1}
    />
  );
};

// ------------------------------------
// NODE UPDATE CONTEXT
// ------------------------------------
const NodeUpdateContext = React.createContext({
  updateNode: () => { },
  deleteNode: () => { }
});

// ------------------------------------
// ENHANCED ORGANIC FLOWCHART NODE
// ------------------------------------
const FlowchartNode = ({ id, data, selected, type: nodeType = 'rectangle' }) => {
  const [isEditing, setIsEditing] = useState(data.isNew || false);
  const [textValue, setTextValue] = useState(data.label || '');
  const { updateNode, deleteNode } = React.useContext(NodeUpdateContext);

  const handleSubmit = useCallback((value) => {
    if (!value.trim() && data.isNew) {
      deleteNode(id);
      return;
    }
    updateNode(id, { ...data, label: value, isNew: false });
    setIsEditing(false);
  }, [id, data, updateNode, deleteNode]);

  const handleCancel = useCallback(() => {
    if (data.isNew) {
      deleteNode(id);
    } else {
      setTextValue(data.label || '');
      setIsEditing(false);
    }
  }, [data.isNew, data.label, id, deleteNode]);

  const getShapeStyle = () => {
    const shape = data.shape || nodeType;
    const apiStyle = data.style || {};
    const apiBackground = apiStyle.backgroundColor || '#4A90E2';
    const apiColor = apiStyle.color || 'white';

    const baseStyle = {
      background: `linear-gradient(135deg, ${apiBackground}, ${apiBackground}dd)`,
      border: `2px solid ${apiStyle.borderColor || apiBackground}`,
      borderRadius: apiStyle.borderRadius || '12px',
      color: apiColor,
      fontSize: apiStyle.fontSize || '14px',
      fontWeight: apiStyle.fontWeight || '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      cursor: 'default',
      position: 'relative',
      width: data.width || '160px',
      height: data.height || '70px',
      padding: apiStyle.padding || '14px',
      boxShadow: selected
        ? `0 0 0 3px ${apiBackground}40, 0 8px 25px ${apiBackground}30`
        : `0 4px 15px ${apiBackground}20, 0 2px 8px rgba(0,0,0,0.05)`,
      transform: selected ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    // Enhanced shapes with organic feel
    switch (shape) {
      case 'ellipse':
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: '50%',
          width: '90px',
          height: '90px',
          background: `radial-gradient(circle at 30% 30%, ${apiBackground}, ${apiBackground}cc)`
        };
      case 'diamond':
        return {
          ...baseStyle,
          borderRadius: '8px',
          transform: `rotate(45deg) ${selected ? 'scale(1.03)' : 'scale(1)'}`,
          width: '75px',
          height: '75px',
          background: `linear-gradient(45deg, ${apiBackground}, ${apiBackground}dd)`
        };
      default:
        return baseStyle;
    }
  };

  const getHandlePositions = () => {
    const handleStyle = {
      width: '12px',
      height: '12px',
      background: 'linear-gradient(135deg, #fff, #f8f9fa)',
      border: '2px solid #4A90E2',
      borderRadius: '50%',
      zIndex: 10,
      boxShadow: '0 2px 6px rgba(74, 144, 226, 0.3)',
    };

    return [
      { type: 'target', position: Position.Top, style: { ...handleStyle, top: -6 } },
      { type: 'source', position: Position.Bottom, style: { ...handleStyle, bottom: -6 } },
      { type: 'target', position: Position.Left, style: { ...handleStyle, left: -6 } },
      { type: 'source', position: Position.Right, style: { ...handleStyle, right: -6 } }
    ];
  };

  const shapeStyle = getShapeStyle();
  const isDiamond = (data.shape || nodeType) === 'diamond';

  return (
    <div
      style={shapeStyle}
      onDoubleClick={() => setIsEditing(true)}
      className="diagram-node organic-node"
    >
      {selected && !isDiamond && (
        <NodeResizer
          color="#4A90E2"
          isVisible={selected}
          minWidth={120}
          minHeight={60}
        />
      )}

      {getHandlePositions().map((handle, index) => (
        <Handle
          key={`${handle.type}-${handle.position}-${index}`}
          type={handle.type}
          position={handle.position}
          style={handle.style}
        />
      ))}

      {isEditing ? (
        <div style={isDiamond ? { transform: 'rotate(-45deg)' } : {}}>
          <TextEditor
            value={textValue}
            onChange={setTextValue}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            style={{
              minWidth: isDiamond ? '70px' : '130px',
              maxWidth: isDiamond ? '90px' : '150px',
            }}
          />
        </div>
      ) : (
        <div style={isDiamond ? { transform: 'rotate(-45deg)' } : {}}>
          <span style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '13px',
            lineHeight: '1.3',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            {data.label || 'Double-click to edit'}
          </span>
        </div>
      )}
    </div>
  );
};

// Diamond-specific node for API compatibility
const DiamondNode = ({ id, data, selected }) => {
  return (
    <FlowchartNode
      id={id}
      data={{ ...data, shape: 'diamond' }}
      selected={selected}
      type="diamond"
    />
  );
};

// Free Text Node
const FreeTextNode = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(data.isNew || false);
  const [textValue, setTextValue] = useState(data.label || '');
  const { updateNode, deleteNode } = React.useContext(NodeUpdateContext);

  const handleSubmit = useCallback((value) => {
    if (!value.trim()) {
      deleteNode(id);
      return;
    }
    updateNode(id, { ...data, label: value, isNew: false });
    setIsEditing(false);
  }, [id, data, updateNode, deleteNode]);

  const handleCancel = useCallback(() => {
    if (data.isNew) {
      deleteNode(id);
    } else {
      setTextValue(data.label || '');
      setIsEditing(false);
    }
  }, [data.isNew, data.label, id, deleteNode]);

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '6px',
        minWidth: '24px',
        cursor: isEditing ? 'text' : 'default',
        fontSize: '14px',
        fontWeight: '500',
        color: '#2C3E50',
      }}
    >
      {isEditing ? (
        <TextEditor
          value={textValue}
          onChange={setTextValue}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          style={{ border: 'none', background: 'rgba(255, 255, 255, 0.95)' }}
        />
      ) : (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minWidth: '24px', minHeight: '24px' }}>
          {data.label || 'Double-click to edit'}
        </div>
      )}
    </div>
  );
};

// ------------------------------------
// ORGANIC CURVED EDGE
// ------------------------------------
const OrganicEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  label,
  data,
  style: edgeStyle = {}
}) => {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  // Create more organic, hand-drawn style curves
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: data?.curvature || 0.25, // More curved for organic feel
  });

  const onDeleteClick = (evt) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: selected ? 3.5 : 2.5,
          stroke: isHovered || selected ? '#4A90E2' : edgeStyle.stroke || '#4A90E2',
          strokeDasharray: data?.dashed ? '8,4' : undefined,
          filter: 'drop-shadow(0 1px 3px rgba(74, 144, 226, 0.2))',
          ...edgeStyle,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        interactionWidth={25}
      />

      {(label || data?.label) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className="bg-white px-3 py-1 rounded-lg border shadow-lg text-xs font-semibold"
              style={{
                color: '#2C3E50',
                borderColor: '#E1E5E9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {label || data?.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 25}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <AnimatePresence>
            {(isHovered || selected) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onDeleteClick}
                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
              >
                <HiX className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// ------------------------------------
// UTILITIES
// ------------------------------------
let nodeId = 1000;
const getId = () => `node_${nodeId++}`;

const createNewNode = (shape, position, color, diagramType = DIAGRAM_TYPES.FLOWCHART) => {
  const baseNode = {
    id: getId(),
    position,
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
  };

  return {
    ...baseNode,
    type: shape === 'text' ? 'freetext' : 'flowchart',
    data: {
      label: shape === 'text' ? '' : `New ${shape}`,
      shape: shape,
      color: color,
      isNew: shape === 'text',
      style: {
        backgroundColor: color,
        color: 'white'
      }
    },
  };
};

// ------------------------------------
// ENHANCED TOOLBAR COMPONENT
// ------------------------------------
const DiagramToolbar = ({
  onAddShape,
  onDeleteSelected,
  selectedNodes,
  selectedEdges,
  onFitView,
  onExport,
  onLayout,
  isExporting,
  diagramType,
  onDiagramTypeChange
}) => {
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_SCHEMES.flowchart.primary);

  const shapes = [
    { key: 'rectangle', icon: FiSquare, label: 'Process' },
    { key: 'ellipse', icon: FiCircle, label: 'Terminal' },
    { key: 'diamond', icon: FiHexagon, label: 'Decision' },
    { key: 'text', icon: FiType, label: 'Text' },
  ];

  const colors = Object.values(COLOR_SCHEMES[diagramType] || COLOR_SCHEMES.flowchart);

  const handleAddShape = (shapeKey) => {
    const position = { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 };
    onAddShape(createNewNode(shapeKey, position, selectedColor, diagramType));
    setShowShapePanel(false);
  };

  const diagramTypes = [
    { key: DIAGRAM_TYPES.FLOWCHART, label: 'Flowchart', icon: FiActivity },
    { key: DIAGRAM_TYPES.ER_DIAGRAM, label: 'ER Diagram', icon: FiDatabase },
    { key: DIAGRAM_TYPES.UML_CLASS, label: 'UML Class', icon: FiBox },
    { key: DIAGRAM_TYPES.NETWORK, label: 'Network', icon: FiGrid },
  ];

  return (
    <motion.div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-3 bg-white/95 backdrop-blur border rounded-2xl px-4 py-3 shadow-xl border-gray-200/50">

        {/* Diagram Type Selector */}
        <div className="relative">
          <select
            value={diagramType}
            onChange={(e) => onDiagramTypeChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {diagramTypes.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Add Shape */}
        <div className="relative">
          <button
            onClick={() => setShowShapePanel(!showShapePanel)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Shape</span>
          </button>

          <AnimatePresence>
            {showShapePanel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur border rounded-xl shadow-xl p-4 min-w-[200px] z-50 border-gray-200/50"
              >
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-600 mb-2">Color</div>
                  <div className="flex space-x-2 flex-wrap">
                    {colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === color
                          ? 'border-gray-800 ring-2 ring-gray-300 transform scale-110'
                          : 'border-gray-300 hover:scale-105'
                          }`}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">Shapes</div>
                  <div className="grid grid-cols-2 gap-2">
                    {shapes.map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        onClick={() => handleAddShape(key)}
                        className="flex items-center space-x-2 p-2 text-left text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Organic Layout Button */}
        <button
          onClick={() => onLayout('organic')}
          className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          title="Organic hand-drawn style layout"
        >
          <FiGrid className="w-4 h-4" />
          <span>Organic Layout</span>
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Delete Selected */}
        {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
          <>
            <button
              onClick={onDeleteSelected}
              className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <HiTrash className="w-4 h-4" />
              <span>Delete ({selectedNodes.length + selectedEdges.length})</span>
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
          </>
        )}

        {/* Fit View */}
        <button
          onClick={onFitView}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Fit to view"
        >
          <FiEye className="w-4 h-4" />
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center space-x-1 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
        >
          <FiDownloadIcon className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </button>
      </div>
    </motion.div>
  );
};

// ------------------------------------
// MAIN COMPONENT
// ------------------------------------
const DiagramCanvasInner = ({
  onClose,
  className = "",
  generatedData = null,
  initialDiagramType = DIAGRAM_TYPES.FLOWCHART
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [diagramType, setDiagramType] = useState(initialDiagramType);
  const [isLoading, setIsLoading] = useState(false);
  const reactFlowRef = useRef(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  // Initialize with empty state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Node types that handle API data with organic styling
  const nodeTypes = useMemo(() => ({
    flowchart: FlowchartNode,
    diamond: DiamondNode,
    freetext: FreeTextNode,
    default: FlowchartNode, // Fallback for any API node type
  }), []);

  const edgeTypes = useMemo(() => ({
    diagram: OrganicEdge,
    organic: OrganicEdge,
    default: OrganicEdge, // Fallback for any API edge type
  }), []);

  // Context functions
  const updateNode = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: newData } : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) =>
      edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  const nodeUpdateContextValue = useMemo(() => ({
    updateNode,
    deleteNode
  }), [updateNode, deleteNode]);

  const selectedNodes = useMemo(() => nodes.filter(node => node.selected), [nodes]);
  const selectedEdges = useMemo(() => edges.filter(edge => edge.selected), [edges]);

  // CRITICAL: Process and load API data with organic layout
  useEffect(() => {
    if (generatedData) {
      console.log('📥 Raw generatedData received:', generatedData);
      setIsLoading(true);

      try {
        // Process the API data
        const { nodes: processedNodes, edges: processedEdges, metadata } = processApiData(generatedData);

        console.log('✅ Setting processed data with organic layout:', {
          nodes: processedNodes.length,
          edges: processedEdges.length,
          metadata
        });

        // Set diagram type from metadata
        if (metadata.diagramType) {
          setDiagramType(metadata.diagramType);
        }

        // Apply organic layout immediately
        setTimeout(() => {
          const organicNodes = createOrganicLayout(processedNodes, processedEdges, 1400, 900);

          setNodes(organicNodes);
          setEdges(processedEdges);

          // Fit view with padding after organic layout
          setTimeout(() => {
            fitView({ padding: 0.15, duration: 800 });
            setIsLoading(false);
          }, 300);
        }, 200);

      } catch (error) {
        console.error('❌ Error processing API data:', error);
        setIsLoading(false);
      }
    }
  }, [generatedData, setNodes, setEdges, fitView]);

  // Event handlers
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'organic',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4A90E2' },
    }, eds)),
    [setEdges]
  );

  const handleAddShape = useCallback((newNode) => {
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = selectedNodes.map(node => node.id);
    const selectedEdgeIds = selectedEdges.map(edge => edge.id);

    setNodes((nds) => nds.filter(node => !selectedNodeIds.includes(node.id)));
    setEdges((eds) => eds.filter(edge =>
      !selectedEdgeIds.includes(edge.id) &&
      !selectedNodeIds.includes(edge.source) &&
      !selectedNodeIds.includes(edge.target)
    ));
  }, [selectedNodes, selectedEdges, setNodes, setEdges]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.1, duration: 800 });
  }, [fitView]);

  const handleLayout = useCallback((direction) => {
    if (direction === 'organic') {
      // Apply organic layout
      const organicNodes = createOrganicLayout(nodes, edges, 1400, 900);
      setNodes([...organicNodes]);
    }

    setTimeout(() => {
      fitView({ padding: 0.1, duration: 800 });
    }, 100);
  }, [nodes, edges, setNodes, fitView]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const viewport = reactFlowRef.current?.querySelector('.react-flow__viewport');
      if (viewport) {
        const dataUrl = await toPng(viewport, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
        saveAs(dataUrl, `${diagramType}-organic-${Date.now()}.png`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDiagramTypeChange = useCallback((newType) => {
    setDiagramType(newType);
  }, []);

  const handlePaneClick = useCallback((event) => {
    if (event.target.classList.contains('react-flow__pane')) {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });

      const newTextNode = createNewNode('text', position, COLOR_SCHEMES[diagramType]?.primary, diagramType);
      setNodes((nds) => [...nds, newTextNode]);
    }
  }, [setNodes, screenToFlowPosition, diagramType]);

  return (
    <NodeUpdateContext.Provider value={nodeUpdateContextValue}>
      <div className={`relative h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 ${className}`}>

        {/* Toolbar */}
        <DiagramToolbar
          onAddShape={handleAddShape}
          onDeleteSelected={handleDeleteSelected}
          selectedNodes={selectedNodes}
          selectedEdges={selectedEdges}
          onFitView={handleFitView}
          onExport={handleExport}
          onLayout={handleLayout}
          isExporting={isExporting}
          diagramType={diagramType}
          onDiagramTypeChange={handleDiagramTypeChange}
        />

        {/* Close Button */}
        {onClose && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClose}
            className="fixed top-6 right-6 z-50 p-2 bg-white/90 backdrop-blur border text-gray-600 hover:text-red-500 rounded-full shadow-lg transition-colors border-gray-200/50"
          >
            <HiX className="w-5 h-5" />
          </motion.button>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-6 left-6 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur border rounded-lg px-3 py-2 shadow-lg text-sm border-gray-200/50"
        >
          <span className="text-gray-700">Type: {diagramType}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700">Nodes: {nodes.length}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700">Connections: {edges.length}</span>
          {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-blue-600">Selected: {selectedNodes.length + selectedEdges.length}</span>
            </>
          )}
        </motion.div>

        {/* Help Panel */}
        <Panel position="bottom-right" className="bg-white/95 backdrop-blur rounded-lg p-3 text-xs text-gray-600 max-w-xs shadow-lg border border-gray-200/50">
          <div className="space-y-1">
            <p><strong>Double-click</strong> shapes to edit text</p>
            <p><strong>Click canvas</strong> to add text notes</p>
            <p><strong>Drag handles</strong> to connect shapes</p>
            <p><strong>Organic Layout</strong> for hand-drawn style</p>
            <p><strong>Delete key</strong> removes selected items</p>
          </div>
        </Panel>

        {/* React Flow Canvas */}
        <div className="h-full w-full" ref={reactFlowRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            minZoom={0.1}
            maxZoom={4}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            defaultEdgeOptions={{
              type: 'organic',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 12,
                height: 12,
                color: '#4A90E2',
              },
              style: {
                strokeWidth: 2.5,
                stroke: '#4A90E2',
              },
            }}
          >
            <Background
              color="#e1e8ed"
              gap={24}
              size={1.2}
              variant="dots"
              className="opacity-30"
            />
            <Controls
              position="top-right"
              className="!bg-white/90 !backdrop-blur !border-gray-200/50 !shadow-lg !rounded-lg"
            />
            {nodes.length > 6 && (
              <MiniMap
                nodeColor={(node) => node.data?.style?.backgroundColor || COLOR_SCHEMES[diagramType]?.primary || '#4A90E2'}
                maskColor="rgba(74, 144, 226, 0.1)"
                position="bottom-left"
                className="!bg-white/90 !backdrop-blur !border-gray-200/50 !shadow-lg !rounded-lg"
              />
            )}
          </ReactFlow>
        </div>

        {/* Loading State */}
        {(isLoading || nodes.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80">
            <div className="text-center">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-500 mx-auto mb-3"></div>
                  <div className="text-gray-600 text-lg mb-2 font-medium">Creating organic layout...</div>
                  <div className="text-gray-500 text-sm">Applying hand-drawn style positioning</div>
                </>
              ) : (
                <>
                  <div className="text-gray-500 text-lg mb-2 font-medium">No diagram data loaded</div>
                  <div className="text-gray-400 text-sm">Generate a diagram to see it here</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </NodeUpdateContext.Provider>
  );
};

// Wrapper with Provider
const DiagramCanvas = (props) => {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default DiagramCanvas;
