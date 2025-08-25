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
  NodeResizer,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import ELK from 'elkjs/lib/elk.bundled.js';
import chroma from 'chroma-js';
import {
  HiX,
  HiDownload,
  HiPlus,
  HiTrash,
  HiSparkles,
  HiViewGrid,
  HiCog,
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
  FiActivity,
  FiCpu,
  FiShare2,
  FiTrendingUp
} from 'react-icons/fi';
import '@xyflow/react/dist/style.css';

// ------------------------------------
// ADVANCED ELK LAYOUT ENGINE
// ------------------------------------
const elk = new ELK();

// Advanced ELK configuration presets for different diagram types
const ELK_PRESETS = {
  hierarchical: {
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': '60',
    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    'elk.layered.spacing.edgeNodeBetweenLayers': '40',
    'elk.spacing.edgeNode': '30',
    'elk.spacing.edgeEdge': '20',
    'elk.layered.nodePlacement.strategy': 'INTERACTIVE',
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.greedySwitch.type': 'TWO_SIDED',
  },
  organic: {
    'elk.algorithm': 'stress',
    'elk.stress.dimension': 'XY',
    'elk.stress.epsilon': '0.0001',
    'elk.spacing.nodeNode': '80',
    'elk.stress.iterationLimit': '1000',
    'elk.randomSeed': '42',
  },
  radial: {
    'elk.algorithm': 'radial',
    'elk.radial.radius': '200',
    'elk.spacing.nodeNode': '50',
    'elk.radial.compaction': 'true',
    'elk.radial.sorter': 'RADIUS_ASCENDING',
  },
  force: {
    'elk.algorithm': 'force',
    'elk.force.iterations': '300',
    'elk.force.repulsivePower': '2',
    'elk.spacing.nodeNode': '100',
    'elk.force.temperature': '0.001',
  },
  circular: {
    'elk.algorithm': 'disco',
    'elk.disco.componentCompaction.strategy': 'IMPROVE_STRAIGHTNESS',
    'elk.spacing.nodeNode': '60',
    'elk.disco.componentCompaction.componentComponentSpacing': '100',
  }
};

// Advanced layout function with ELK
const createAdvancedLayout = async (nodes, edges, layoutType = 'hierarchical', options = {}) => {
  if (!nodes.length) return { nodes, edges };

  const elkOptions = {
    ...ELK_PRESETS[layoutType],
    ...options
  };

  const isHorizontal = elkOptions['elk.direction'] === 'RIGHT';

  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      width: node.data?.width || getNodeWidth(node.data?.shape, node.data?.label),
      height: node.data?.height || getNodeHeight(node.data?.shape),
      // ELK ports for precise handle positioning
      ports: getElkPorts(node.data?.shape, isHorizontal),
    })),
    edges: edges.map(edge => ({
      ...edge,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    return {
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y },
        data: {
          ...node.data,
          width: node.width,
          height: node.height,
        }
      })),
      edges: layoutedGraph.edges || edges,
    };
  } catch (error) {
    console.error('ELK layout failed:', error);
    return { nodes, edges };
  }
};

// Generate ELK ports for precise handle positioning
const getElkPorts = (shape, isHorizontal) => {
  const ports = [];

  if (shape === 'diamond') {
    ports.push(
      { id: 'port_top', properties: { 'port.side': 'NORTH', 'port.index': '0' } },
      { id: 'port_right', properties: { 'port.side': 'EAST', 'port.index': '0' } },
      { id: 'port_bottom', properties: { 'port.side': 'SOUTH', 'port.index': '0' } },
      { id: 'port_left', properties: { 'port.side': 'WEST', 'port.index': '0' } }
    );
  } else {
    // Rectangle and ellipse
    if (isHorizontal) {
      ports.push(
        { id: 'port_left', properties: { 'port.side': 'WEST', 'port.index': '0' } },
        { id: 'port_right', properties: { 'port.side': 'EAST', 'port.index': '0' } }
      );
    } else {
      ports.push(
        { id: 'port_top', properties: { 'port.side': 'NORTH', 'port.index': '0' } },
        { id: 'port_bottom', properties: { 'port.side': 'SOUTH', 'port.index': '0' } }
      );
    }
  }

  return ports;
};

// ------------------------------------
// PROFESSIONAL COLOR SYSTEM WITH CHROMA.JS
// ------------------------------------
const generateColorScheme = (baseColor) => {
  const base = chroma(baseColor);
  return {
    light: base.alpha(0.1).css(),
    main: base.css(),
    dark: base.darken(1.5).css(),
    stroke: base.darken(0.5).css(),
    shadow: base.alpha(0.2).css(),
    gradient: `linear-gradient(135deg, ${base.brighten(0.5).css()}, ${base.css()})`,
  };
};

const ADVANCED_COLORS = {
  // Semantic colors
  process: generateColorScheme('#3B82F6'), // Blue
  decision: generateColorScheme('#F59E0B'), // Amber  
  terminal: generateColorScheme('#10B981'), // Emerald
  data: generateColorScheme('#8B5CF6'), // Violet
  connector: generateColorScheme('#EC4899'), // Pink

  // Professional palette
  corporate: generateColorScheme('#1E40AF'), // Corporate Blue
  success: generateColorScheme('#059669'), // Success Green
  warning: generateColorScheme('#D97706'), // Warning Orange
  error: generateColorScheme('#DC2626'), // Error Red
  neutral: generateColorScheme('#6B7280'), // Neutral Gray
};

// Shape-specific color mapping
const SHAPE_COLOR_MAP = {
  rectangle: ADVANCED_COLORS.process,
  ellipse: ADVANCED_COLORS.terminal,
  diamond: ADVANCED_COLORS.decision,
  parallelogram: ADVANCED_COLORS.data,
  hexagon: ADVANCED_COLORS.connector,
};

// ------------------------------------
// UTILITY FUNCTIONS
// ------------------------------------
const getNodeWidth = (shape, label = '') => {
  const baseWidth = 160;
  const labelWidth = Math.max(baseWidth, (label?.length || 0) * 8 + 60);

  switch (shape) {
    case 'diamond':
      return Math.max(120, Math.min(labelWidth * 0.8, 180));
    case 'ellipse':
      return Math.max(140, Math.min(labelWidth, 220));
    case 'hexagon':
      return Math.max(130, Math.min(labelWidth, 200));
    default:
      return Math.max(baseWidth, Math.min(labelWidth, 280));
  }
};

const getNodeHeight = (shape) => {
  switch (shape) {
    case 'diamond':
      return 100;
    case 'ellipse':
      return 70;
    case 'hexagon':
      return 80;
    default:
      return 60;
  }
};

// ------------------------------------
// API DATA PROCESSING
// ------------------------------------
const processApiData = (apiResponse) => {
  if (!apiResponse || !apiResponse.success || !apiResponse.data) {
    return { nodes: [], edges: [], metadata: {} };
  }

  const { data, metadata } = apiResponse;

  const processedNodes = (data.nodes || []).map((node) => {
    const shape = node.type === 'diamond' ? 'diamond' : 'rectangle';
    const colorScheme = SHAPE_COLOR_MAP[shape] || ADVANCED_COLORS.process;

    return {
      id: node.id,
      type: 'advanced-node',
      position: node.position || { x: 0, y: 0 },
      data: {
        label: node.data?.label || `Node ${node.id}`,
        shape: shape,
        width: getNodeWidth(shape, node.data?.label),
        height: getNodeHeight(shape),
        colorScheme: colorScheme,
        ...node.data,
      },
    };
  });

  const processedEdges = (data.edges || []).map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'advanced-edge',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: '#374151',
    },
    style: {
      strokeWidth: 2,
      stroke: '#374151',
    },
    data: {
      label: edge.data?.label,
      ...edge.data
    }
  }));

  return {
    nodes: processedNodes,
    edges: processedEdges,
    metadata: {
      diagramType: metadata?.diagramType || 'flowchart',
      ...metadata
    }
  };
};

// ------------------------------------
// ADVANCED TEXT EDITOR
// ------------------------------------
const AdvancedTextEditor = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  style = {},
  autoFocus = true,
  multiline = false
}) => {
  const [textValue, setTextValue] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setTextValue(value || '');
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleKeyDown = useCallback((e) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      onCancel?.();
    } else if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault();
      onSubmit?.(textValue);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      onSubmit?.(textValue);
    }
  }, [textValue, onSubmit, onCancel, multiline]);

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <InputComponent
      ref={inputRef}
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
        border: '2px solid #3B82F6',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1F2937',
        resize: 'none',
        outline: 'none',
        minWidth: '140px',
        minHeight: multiline ? '60px' : '40px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
        ...style
      }}
      rows={multiline ? 3 : 1}
    />
  );
};

// ------------------------------------
// ADVANCED NODE COMPONENT
// ------------------------------------
const AdvancedNode = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(data.isNew || false);
  const [textValue, setTextValue] = useState(data.label || '');
  const { updateNode, deleteNode } = React.useContext(NodeUpdateContext);

  const handleSubmit = useCallback((value) => {
    if (!value.trim() && data.isNew) {
      deleteNode(id);
      return;
    }
    const newWidth = getNodeWidth(data.shape, value);
    updateNode(id, {
      ...data,
      label: value,
      isNew: false,
      width: newWidth
    });
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

  const getShapeComponent = () => {
    const { shape, colorScheme, width = 160, height = 60 } = data;

    const baseStyle = {
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      cursor: 'default',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      color: '#1F2937',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: selected ? 'scale(1.02)' : 'scale(1)',
      filter: selected ?
        'drop-shadow(0 10px 30px rgba(59, 130, 246, 0.3)) brightness(1.05)' :
        'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
    };

    const shapeStyles = {
      rectangle: {
        background: colorScheme.gradient,
        border: `3px solid ${colorScheme.stroke}`,
        borderRadius: '12px',
      },
      ellipse: {
        background: colorScheme.gradient,
        border: `3px solid ${colorScheme.stroke}`,
        borderRadius: '50%',
      },
      diamond: {
        background: colorScheme.gradient,
        border: `3px solid ${colorScheme.stroke}`,
        borderRadius: '12px',
        transform: `rotate(45deg) ${selected ? 'scale(1.02)' : 'scale(1)'}`,
        width: `${Math.min(width, height)}px`,
        height: `${Math.min(width, height)}px`,
      },
      hexagon: {
        background: colorScheme.gradient,
        border: `3px solid ${colorScheme.stroke}`,
        borderRadius: '8px',
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      },
      parallelogram: {
        background: colorScheme.gradient,
        border: `3px solid ${colorScheme.stroke}`,
        borderRadius: '8px',
        transform: 'skewX(-15deg)',
      }
    };

    const isDiamond = shape === 'diamond';
    const isParallelogram = shape === 'parallelogram';

    return (
      <div
        style={{
          ...baseStyle,
          ...shapeStyles[shape] || shapeStyles.rectangle,
        }}
        onDoubleClick={() => !isDiamond && setIsEditing(true)}
      >
        <div style={{
          transform: isDiamond ? 'rotate(-45deg)' : isParallelogram ? 'skewX(15deg)' : 'none',
          padding: isDiamond ? '8px' : '12px',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {isEditing ? (
            <AdvancedTextEditor
              value={textValue}
              onChange={setTextValue}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              style={{
                maxWidth: `${width - 40}px`,
                fontSize: isDiamond ? '12px' : '14px',
              }}
              multiline={!isDiamond}
            />
          ) : (
            <span style={{
              fontSize: isDiamond ? '12px' : '14px',
              lineHeight: '1.3',
              wordBreak: 'break-word',
              display: 'block',
            }}>
              {data.label || 'Click to edit'}
            </span>
          )}
        </div>
      </div>
    );
  };

  const getHandlePositions = () => {
    const handleStyle = {
      width: '12px',
      height: '12px',
      background: 'linear-gradient(135deg, #fff, #f9fafb)',
      border: '2px solid #3B82F6',
      borderRadius: '50%',
      opacity: selected ? 1 : 0,
      transition: 'opacity 0.2s ease',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    };

    return [
      { type: 'target', position: Position.Top, id: 'port_top', style: handleStyle },
      { type: 'source', position: Position.Bottom, id: 'port_bottom', style: handleStyle },
      { type: 'target', position: Position.Left, id: 'port_left', style: handleStyle },
      { type: 'source', position: Position.Right, id: 'port_right', style: handleStyle },
    ];
  };

  return (
    <div className="advanced-node" style={{ position: 'relative' }}>
      {getHandlePositions().map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={handle.style}
        />
      ))}
      {getShapeComponent()}
    </div>
  );
};

// ------------------------------------
// ADVANCED EDGE COMPONENT
// ------------------------------------
const AdvancedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  data,
  style: edgeStyle = {}
}) => {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.2,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: selected ? 3 : 2,
          stroke: selected || isHovered ? '#3B82F6' : '#6B7280',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))',
          ...edgeStyle,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        interactionWidth={20}
      />

      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white px-3 py-1.5 rounded-full border-2 border-blue-200 shadow-lg text-xs font-semibold text-gray-700"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              {data.label}
            </motion.div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
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
// ADVANCED TOOLBAR
// ------------------------------------
const AdvancedToolbar = ({
  onAddShape,
  onDeleteSelected,
  selectedNodes,
  selectedEdges,
  onFitView,
  onExport,
  onLayout,
  isExporting,
  currentLayout,
}) => {
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);

  const shapes = [
    { key: 'rectangle', icon: FiSquare, label: 'Process', color: 'process' },
    { key: 'ellipse', icon: FiCircle, label: 'Start/End', color: 'terminal' },
    { key: 'diamond', icon: FiHexagon, label: 'Decision', color: 'decision' },
    { key: 'hexagon', icon: FiCpu, label: 'Connector', color: 'connector' },
    { key: 'parallelogram', icon: FiDatabase, label: 'Data', color: 'data' },
  ];

  const layouts = [
    { key: 'hierarchical', label: 'Hierarchical', icon: FiLayers, description: 'Top-down flow' },
    { key: 'organic', label: 'Organic', icon: FiShare2, description: 'Natural positioning' },
    { key: 'radial', label: 'Radial', icon: FiTarget, description: 'Circular arrangement' },
    { key: 'force', label: 'Force-Directed', icon: FiZap, description: 'Physics-based' },
    { key: 'circular', label: 'Circular', icon: FiCircle, description: 'Perfect circle' },
  ];

  const handleAddShape = (shapeKey) => {
    const position = { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 };
    const colorScheme = SHAPE_COLOR_MAP[shapeKey] || ADVANCED_COLORS.process;

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'advanced-node',
      position,
      data: {
        label: `New ${shapeKey}`,
        shape: shapeKey,
        colorScheme: colorScheme,
        width: getNodeWidth(shapeKey, `New ${shapeKey}`),
        height: getNodeHeight(shapeKey),
        isNew: true,
      },
    };

    onAddShape(newNode);
    setShowShapePanel(false);
  };

  return (
    <motion.div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center space-x-4 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl px-6 py-4 shadow-2xl">

        {/* Layout Selector */}
        <div className="relative">
          <motion.button
            onClick={() => setShowLayoutPanel(!showLayoutPanel)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <HiViewGrid className="w-4 h-4" />
            <span>Layout</span>
          </motion.button>

          <AnimatePresence>
            {showLayoutPanel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-2xl p-4 min-w-[280px] z-50"
              >
                <div className="space-y-2">
                  {layouts.map(({ key, label, icon: Icon, description }) => (
                    <motion.button
                      key={key}
                      onClick={() => {
                        onLayout(key);
                        setShowLayoutPanel(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all duration-200 ${currentLayout === key
                          ? 'bg-blue-100 border-2 border-blue-300 text-blue-800'
                          : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-semibold">{label}</div>
                        <div className="text-xs opacity-70">{description}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Shape */}
        <div className="relative">
          <motion.button
            onClick={() => setShowShapePanel(!showShapePanel)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 text-sm font-semibold shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Shape</span>
          </motion.button>

          <AnimatePresence>
            {showShapePanel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-2xl p-4 min-w-[240px] z-50"
              >
                <div className="space-y-2">
                  {shapes.map(({ key, icon: Icon, label, color }) => {
                    const colorScheme = ADVANCED_COLORS[color];
                    return (
                      <motion.button
                        key={key}
                        onClick={() => handleAddShape(key)}
                        className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            background: colorScheme.gradient,
                            border: `2px solid ${colorScheme.stroke}`
                          }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{label}</div>
                          <div className="text-xs text-gray-500 capitalize">{key} shape</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delete Selected */}
        {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
          <motion.button
            onClick={onDeleteSelected}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 text-sm font-semibold shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <HiTrash className="w-4 h-4" />
            <span>Delete ({selectedNodes.length + selectedEdges.length})</span>
          </motion.button>
        )}

        <div className="w-px h-8 bg-gray-300"></div>

        {/* Fit View */}
        <motion.button
          onClick={onFitView}
          className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiEye className="w-5 h-5" />
        </motion.button>

        {/* Export */}
        <motion.button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 text-sm font-semibold shadow-lg"
          whileHover={{ scale: isExporting ? 1 : 1.02 }}
          whileTap={{ scale: isExporting ? 1 : 0.98 }}
        >
          <FiDownloadIcon className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </motion.button>
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
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLayout, setCurrentLayout] = useState('hierarchical');
  const reactFlowRef = useRef(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const selectedNodes = useMemo(() => nodes.filter(node => node.selected), [nodes]);
  const selectedEdges = useMemo(() => edges.filter(edge => edge.selected), [edges]);

  const nodeTypes = useMemo(() => ({
    'advanced-node': AdvancedNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    'advanced-edge': AdvancedEdge,
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

  // Load and process API data
  useEffect(() => {
    if (generatedData) {
      setIsLoading(true);

      try {
        const { nodes: processedNodes, edges: processedEdges } = processApiData(generatedData);

        // Apply advanced ELK layout
        createAdvancedLayout(processedNodes, processedEdges, currentLayout)
          .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);

            setTimeout(() => {
              fitView({ padding: 0.1, duration: 800 });
              setIsLoading(false);
            }, 300);
          })
          .catch(error => {
            console.error('Layout failed:', error);
            setNodes(processedNodes);
            setEdges(processedEdges);
            setIsLoading(false);
          });

      } catch (error) {
        console.error('Error processing data:', error);
        setIsLoading(false);
      }
    }
  }, [generatedData, fitView, currentLayout, setNodes, setEdges]);

  // Event handlers
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'advanced-edge',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#374151',
        width: 15,
        height: 15
      },
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
    fitView({ padding: 0.15, duration: 800 });
  }, [fitView]);

  const handleLayout = useCallback(async (layoutType) => {
    if (nodes.length === 0) return;

    setCurrentLayout(layoutType);
    setIsLoading(true);

    try {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await createAdvancedLayout(
        nodes,
        edges,
        layoutType
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      setTimeout(() => {
        fitView({ padding: 0.15, duration: 800 });
        setIsLoading(false);
      }, 100);
    } catch (error) {
      console.error('Layout failed:', error);
      setIsLoading(false);
    }
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const handleExport = useCallback(async () => {
    if (!reactFlowRef.current || nodes.length === 0) return;

    setIsExporting(true);
    try {
      const viewport = reactFlowRef.current.querySelector('.react-flow__viewport');
      if (!viewport) return;

      const dataUrl = await toPng(viewport, {
        backgroundColor: '#ffffff',
        width: 1400,
        height: 900,
        pixelRatio: 3, // High quality
        quality: 1.0,
        cacheBust: true,
      });

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      saveAs(dataUrl, `advanced-diagram-${currentLayout}-${timestamp}.png`);

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [nodes, currentLayout]);

  return (
    <NodeUpdateContext.Provider value={nodeUpdateContextValue}>
      <div className={`relative h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 ${className}`}>

        {/* Advanced Toolbar */}
        <AdvancedToolbar
          onAddShape={handleAddShape}
          onDeleteSelected={handleDeleteSelected}
          selectedNodes={selectedNodes}
          selectedEdges={selectedEdges}
          onFitView={handleFitView}
          onExport={handleExport}
          onLayout={handleLayout}
          isExporting={isExporting}
          currentLayout={currentLayout}
        />

        {/* Close Button */}
        {onClose && (
          <motion.button
            onClick={onClose}
            className="fixed top-6 right-6 z-50 p-3 bg-white/90 backdrop-blur-md border border-gray-200/50 text-gray-600 hover:text-red-500 rounded-full shadow-xl transition-colors"
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <HiX className="w-5 h-5" />
          </motion.button>
        )}

        {/* Enhanced Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-6 left-6 z-50 flex items-center space-x-4 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-xl px-4 py-3 shadow-xl text-sm"
        >
          <div className="flex items-center space-x-2">
            <HiSparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-gray-700 font-medium">Layout: {currentLayout}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <span className="text-gray-700">Nodes: {nodes.length}</span>
          <span className="text-gray-700">Edges: {edges.length}</span>
          {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
            <>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="text-blue-600 font-medium">Selected: {selectedNodes.length + selectedEdges.length}</span>
            </>
          )}
        </motion.div>

        {/* React Flow Canvas */}
        <div className="h-full w-full" ref={reactFlowRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            minZoom={0.1}
            maxZoom={3}
            deleteKeyCode="Delete"
            defaultEdgeOptions={{
              type: 'advanced-edge',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
                color: '#374151',
              },
            }}
          >
            <Background
              color="#e2e8f0"
              gap={20}
              size={1}
              variant="dots"
              className="opacity-40"
            />
            <Controls
              position="top-right"
              className="!bg-white/90 !backdrop-blur-md !border-gray-200/50 !shadow-xl !rounded-lg"
            />
            {nodes.length > 8 && (
              <MiniMap
                nodeColor={(node) => node.data?.colorScheme?.main || '#3B82F6'}
                maskColor="rgba(59, 130, 246, 0.1)"
                position="bottom-right"
                className="!bg-white/90 !backdrop-blur-md !border-gray-200/50 !shadow-xl !rounded-lg"
              />
            )}
          </ReactFlow>
        </div>

        {/* Enhanced Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-40"
          >
            <div className="text-center">
              <motion.div
                className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="text-gray-700 text-lg font-semibold mb-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Applying {currentLayout} layout...
              </motion.div>
              <div className="text-gray-500 text-sm">Using advanced ELK algorithms</div>
            </div>
          </motion.div>
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
