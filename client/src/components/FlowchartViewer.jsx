// components/FlowchartViewer.jsx
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
  useReactFlow,
  MarkerType,
  Position,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  Handle,
  Panel,
  BaseEdge,
  getSmoothStepPath,
  getBezierPath,
  getStraightPath,
  EdgeLabelRenderer,
  NodeResizer
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';
import dagre from '@dagrejs/dagre';
import {
  HiX,
  HiDownload,
  HiExternalLink,
  HiArrowsExpand,
  HiPlus,
  HiTrash,
  HiPencil,
  HiCheck,
} from 'react-icons/hi';
import {
  FiTarget,
  FiLayers,
  FiLink,
  FiMaximize2,
  FiMinimize2,
  FiGrid,
  FiEye,
  FiDownload,
  FiEdit3,
  FiSave,
  FiType,
  FiSquare,
  FiCircle,
  FiHexagon,
  FiCornerDownRight,
  FiZap,
  FiMove
} from 'react-icons/fi';
import '@xyflow/react/dist/style.css';

// ------------------------------------
// Constants and Configuration
// ------------------------------------
const LAYOUT_CONFIG = {
  nodeWidth: 220,
  nodeHeight: 90,
  nodesep: 120,
  ranksep: 180,
  marginx: 60,
  marginy: 60
};

const ANIMATION_CONFIG = {
  duration: 0.4,
  nodeDelay: 150,
  edgeDelay: 250,
  stagger: 0.1
};

const EXPORT_CONFIG = {
  quality: 1.0,
  pixelRatio: 3,
  backgroundColor: '#ffffff'
};

const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: '#6b7280',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0'
};

const NODE_TYPES = {
  input: 'Input',
  output: 'Output',
  process: 'Process',
  decision: 'Decision',
  text: 'Text Box',
  freetext: 'Free Text',
  default: 'Default'
};

const EDGE_TYPES = {
  smoothstep: 'Smooth Step',
  default: 'Curved',
  straight: 'Straight',
  animated: 'Animated',
  custom: 'Custom'
};

// ------------------------------------
// Custom Text Area Component (Excalidraw-style)
// ------------------------------------
const ExcalidrawTextArea = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = "Type text...",
  isTransparent = false,
  fontSize = 14,
  fontWeight = 400,
  textAlign = 'left',
  autoFocus = true,
  multiline = true,
  minWidth = 100,
  maxWidth = 400,
  style = {}
}) => {
  const textareaRef = useRef(null);
  const [textValue, setTextValue] = useState(value || '');

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
    } else if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault();
      onSubmit?.(textValue);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onSubmit?.(textValue);
    }
  }, [textValue, onSubmit, onCancel, multiline]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setTextValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    onSubmit?.(textValue);
  }, [textValue, onSubmit]);

  return (
    <textarea
      ref={textareaRef}
      value={textValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="excalidraw-textarea"
      style={{
        background: isTransparent ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
        border: isTransparent ? 'none' : '1px dashed rgba(99, 102, 241, 0.3)',
        borderRadius: '4px',
        padding: isTransparent ? '2px' : '8px',
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        fontFamily: 'inherit',
        textAlign: textAlign,
        color: 'inherit',
        resize: 'none',
        outline: 'none',
        overflow: 'hidden',
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
        minHeight: multiline ? '40px' : '20px',
        lineHeight: '1.4',
        wordWrap: 'break-word',
        whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
        ...style
      }}
      rows={multiline ? Math.max(1, textValue.split('\n').length) : 1}
    />
  );
};

// ------------------------------------
// Context for Node Updates
// ------------------------------------
const NodeUpdateContext = React.createContext({
  updateNode: () => { },
  deleteNode: () => { }
});

// ------------------------------------
// Free Text Node (Excalidraw-style)
// ------------------------------------
const FreeTextNode = ({ id, data, selected, xPos, yPos }) => {
  const [isEditing, setIsEditing] = useState(data.isNew || false);
  const [textValue, setTextValue] = useState(data.label || '');
  const { updateNode, deleteNode } = React.useContext(NodeUpdateContext);

  const handleSubmit = useCallback((value) => {
    if (!value.trim()) {
      // Delete empty text nodes
      deleteNode(id);
      return;
    }

    updateNode(id, {
      ...data,
      label: value,
      isNew: false,
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

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '4px',
        minWidth: '20px',
        cursor: isEditing ? 'text' : 'default',
        fontSize: '14px',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#374151',
        lineHeight: '1.4',
      }}
      className="free-text-node"
    >
      {isEditing ? (
        <ExcalidrawTextArea
          value={textValue}
          onChange={setTextValue}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isTransparent={true}
          multiline={true}
          autoFocus={true}
          minWidth={50}
          maxWidth={300}
        />
      ) : (
        <div
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minWidth: '20px',
            minHeight: '18px',
            padding: '2px',
          }}
        >
          {data.label || 'Double-click to edit'}
        </div>
      )}
    </div>
  );
};

// ------------------------------------
// Enhanced Editable Node Component
// ------------------------------------
const EditableNode = ({ id, data, type, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(data.label || '');
  const { updateNode } = React.useContext(NodeUpdateContext);

  const handleSubmit = useCallback((value) => {
    updateNode(id, {
      ...data,
      label: value,
    });
    setIsEditing(false);
  }, [id, data, updateNode]);

  const handleCancel = useCallback(() => {
    setTextValue(data.label || '');
    setIsEditing(false);
  }, [data.label]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const nodeStyle = getNodeStyles(type);
  const nodeType = data.nodeType || type;

  // Dynamic handle positioning based on node type
  const getHandlePositions = () => {
    switch (nodeType) {
      case 'decision':
        return [
          { type: 'target', position: Position.Top, style: { top: 10 } },
          { type: 'source', position: Position.Bottom, style: { bottom: 10 } },
          { type: 'source', position: Position.Left, style: { left: 10 }, id: 'left' },
          { type: 'source', position: Position.Right, style: { right: 10 }, id: 'right' }
        ];
      case 'input':
        return [
          { type: 'source', position: Position.Bottom, style: { bottom: 10 } },
          { type: 'source', position: Position.Right, style: { right: 10 }, id: 'right' }
        ];
      case 'output':
        return [
          { type: 'target', position: Position.Top, style: { top: 10 } },
          { type: 'target', position: Position.Left, style: { left: 10 }, id: 'left' }
        ];
      default:
        return [
          { type: 'target', position: Position.Top, style: { top: 10 } },
          { type: 'source', position: Position.Bottom, style: { bottom: 10 } },
          { type: 'target', position: Position.Left, style: { left: 10 }, id: 'left' },
          { type: 'source', position: Position.Right, style: { right: 10 }, id: 'right' }
        ];
    }
  };

  return (
    <div
      style={{
        ...nodeStyle,
        border: selected ? `2px solid ${COLORS.primary}` : nodeStyle.border,
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected
          ? `${nodeStyle.boxShadow}, 0 0 0 4px rgba(99, 102, 241, 0.2)`
          : nodeStyle.boxShadow,
      }}
      onDoubleClick={handleDoubleClick}
      className="editable-node"
    >
      {/* Node Resizer for selected nodes */}
      {selected && (
        <NodeResizer
          color={COLORS.primary}
          isVisible={selected}
          minWidth={100}
          minHeight={50}
        />
      )}

      {/* Dynamic Connection Handles */}
      {getHandlePositions().map((handle, index) => (
        <Handle
          key={`${handle.type}-${handle.position}-${index}`}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={{
            background: handle.type === 'source' ? COLORS.success : COLORS.primary,
            border: '2px solid #fff',
            width: '12px',
            height: '12px',
            opacity: selected ? 1 : 0.7,
            ...handle.style,
          }}
        />
      ))}

      {/* Editable Content */}
      {isEditing ? (
        <div className="w-full h-full flex items-center justify-center">
          <ExcalidrawTextArea
            value={textValue}
            onChange={setTextValue}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isTransparent={false}
            textAlign="center"
            multiline={true}
            autoFocus={true}
            minWidth={120}
            maxWidth={180}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full relative group">
          <span
            className="text-center break-words px-2 select-none"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {data.label || 'Double-click to edit'}
          </span>
          {selected && (
            <div className="absolute top-1 right-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <HiPencil className="w-3 h-3 text-gray-500" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ------------------------------------
// Custom Edge Components
// ------------------------------------
const CustomButtonEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style = {},
  markerEnd,
  data
}) => {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 15,
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
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? COLORS.primary : style.stroke || COLORS.primary,
          filter: isHovered ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))' : 'none',
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        interactionWidth={20}
      />

      {/* Delete Button */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
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
                transition={{ duration: 0.15 }}
                onClick={onDeleteClick}
                className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                title="Delete Edge"
              >
                <HiX className="w-2.5 h-2.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: '8,8',
          animation: 'dashdraw 1s linear infinite',
        }}
        interactionWidth={20}
      />
      <style jsx>{`
        @keyframes dashdraw {
          to {
            stroke-dashoffset: -16;
          }
        }
      `}</style>
    </>
  );
};

const StraightEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd
}) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
      }}
      interactionWidth={20}
    />
  );
};

// ------------------------------------
// Layout Algorithm
// ------------------------------------
const createLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';

  dagreGraph.setGraph({
    rankdir: direction,
    ...LAYOUT_CONFIG
  });

  const validNodes = nodes.filter(node =>
    node.id && node.data && typeof node.data === 'object'
  );

  validNodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: LAYOUT_CONFIG.nodeWidth,
      height: LAYOUT_CONFIG.nodeHeight
    });
  });

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

// ------------------------------------
// Styling Functions
// ------------------------------------
const getNodeStyles = (nodeType) => {
  const baseStyle = {
    width: LAYOUT_CONFIG.nodeWidth - 20,
    minHeight: '70px',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(12px)',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 4px 16px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'grab',
  };

  const typeStyles = {
    input: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      borderColor: COLORS.primary,
      color: '#1e40af',
    },
    output: {
      background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
      borderColor: COLORS.success,
      color: '#166534',
    },
    decision: {
      background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
      borderColor: COLORS.warning,
      color: '#9a3412',
      borderRadius: '50% 16px 50% 16px',
    },
    process: {
      background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
      borderColor: COLORS.secondary,
      color: '#4338ca',
    },
    text: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      borderColor: '#d97706',
      color: '#92400e',
    },
    default: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderColor: COLORS.neutral,
      color: '#374151',
    }
  };

  return { ...baseStyle, ...(typeStyles[nodeType] || typeStyles.default) };
};

const createStyledEdge = (edge, edgeType = 'custom') => ({
  ...edge,
  type: edgeType,
  animated: edge.animated || edgeType === 'animated',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: COLORS.primary,
  },
  style: {
    strokeWidth: 2.5,
    stroke: COLORS.primary,
    strokeDasharray: edge.animated ? '5,5' : 'none',
  },
  data: {
    ...edge.data,
    label: edge.label || edge.data?.label,
  },
  interactionWidth: 20,
});

// ------------------------------------
// Node Creation Functions
// ------------------------------------
let nodeId = 1000;
const getId = () => `node_${nodeId++}`;

const createNewNode = (type, position) => ({
  id: getId(),
  type: type === 'freetext' ? 'freetext' : 'editable',
  position,
  data: {
    label: type === 'freetext' ? '' : `New ${NODE_TYPES[type] || 'Node'}`,
    nodeType: type,
    isNew: type === 'freetext',
  },
  style: type === 'freetext' ? {} : getNodeStyles(type),
});

// ------------------------------------
// Add Node Panel Component
// ------------------------------------
const AddNodePanel = ({ onAddNode }) => {
  const [showPanel, setShowPanel] = useState(false);

  const handleAddNode = (type) => {
    const position = {
      x: Math.random() * 300,
      y: Math.random() * 300,
    };
    onAddNode(createNewNode(type, position));
    setShowPanel(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-medium shadow-lg"
      >
        <HiPlus className="w-4 h-4" />
        <span>Add</span>
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl py-2 min-w-[180px] z-50"
          >
            {Object.entries(NODE_TYPES).map(([type, label]) => (
              <button
                key={type}
                onClick={() => handleAddNode(type)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center space-x-2"
              >
                {type === 'input' && <FiTarget className="w-4 h-4" />}
                {type === 'output' && <FiCircle className="w-4 h-4" />}
                {type === 'process' && <FiSquare className="w-4 h-4" />}
                {type === 'decision' && <FiHexagon className="w-4 h-4" />}
                {type === 'text' && <FiType className="w-4 h-4" />}
                {type === 'freetext' && <FiEdit3 className="w-4 h-4" />}
                {type === 'default' && <FiGrid className="w-4 h-4" />}
                <span>{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ------------------------------------
// Edge Type Panel Component
// ------------------------------------
const EdgeTypePanel = ({ onEdgeTypeChange, currentEdgeType }) => {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-lg"
      >
        <FiCornerDownRight className="w-4 h-4" />
        <span>Arrows</span>
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl py-2 min-w-[160px] z-50"
          >
            {Object.entries(EDGE_TYPES).map(([type, label]) => (
              <button
                key={type}
                onClick={() => {
                  onEdgeTypeChange(type);
                  setShowPanel(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center space-x-2 ${currentEdgeType === type
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
              >
                {type === 'smoothstep' && <FiCornerDownRight className="w-4 h-4" />}
                {type === 'default' && <FiLink className="w-4 h-4" />}
                {type === 'straight' && <FiTarget className="w-4 h-4" />}
                {type === 'animated' && <FiZap className="w-4 h-4" />}
                {type === 'custom' && <FiGrid className="w-4 h-4" />}
                <span>{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ------------------------------------
// Floating Toolbar Component
// ------------------------------------
const FloatingToolbar = ({
  layoutDirection,
  onLayoutChange,
  onFitView,
  onExport,
  isExporting,
  exportOptions,
  onToggleFullscreen,
  isFullscreen,
  onAddNode,
  onDeleteSelected,
  selectedNodes,
  selectedEdges,
  currentEdgeType,
  onEdgeTypeChange
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <motion.div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-2xl">
        {/* Add Node Button */}
        <AddNodePanel onAddNode={onAddNode} />

        {/* Edge Type Selector */}
        <EdgeTypePanel
          onEdgeTypeChange={onEdgeTypeChange}
          currentEdgeType={currentEdgeType}
        />

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Delete Selected Button */}
        {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
          <>
            <button
              onClick={onDeleteSelected}
              className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              title={`Delete ${selectedNodes.length + selectedEdges.length} selected item(s)`}
            >
              <HiTrash className="w-4 h-4" />
              <span>Delete ({selectedNodes.length + selectedEdges.length})</span>
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
          </>
        )}

        {/* Layout Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => onLayoutChange('TB')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${layoutDirection === 'TB'
              ? 'bg-white text-indigo-600 shadow-md'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            title="Vertical Layout"
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onLayoutChange('LR')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${layoutDirection === 'LR'
              ? 'bg-white text-indigo-600 shadow-md'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            title="Horizontal Layout"
          >
            <FiLayers className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Action Buttons */}
        <button
          onClick={onFitView}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
          title="Fit to View"
        >
          <FiEye className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <FiMinimize2 className="w-4 h-4" />
          ) : (
            <FiMaximize2 className="w-4 h-4" />
          )}
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
          >
            <FiDownload className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>

          <AnimatePresence>
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 right-0 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl py-2 min-w-[160px] z-50"
              >
                {exportOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onExport(option);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {option.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ------------------------------------
// Stats Panel Component
// ------------------------------------
const StatsPanel = ({ nodeCount, edgeCount, selectedNodes, selectedEdges }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: 0.3 }}
    className="fixed bottom-6 left-6 z-50"
  >
    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 shadow-2xl">
      <div className="flex items-center space-x-1 text-indigo-600">
        <FiLayers className="w-4 h-4" />
        <span className="text-sm font-semibold">{nodeCount}</span>
      </div>
      <div className="w-px h-4 bg-gray-300"></div>
      <div className="flex items-center space-x-1 text-purple-600">
        <FiLink className="w-4 h-4" />
        <span className="text-sm font-semibold">{edgeCount}</span>
      </div>
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-1 text-green-600">
            <FiTarget className="w-4 h-4" />
            <span className="text-sm font-semibold">{selectedNodes.length + selectedEdges.length}</span>
          </div>
        </>
      )}
    </div>
  </motion.div>
);

// ------------------------------------
// Data Processing Hook
// ------------------------------------
const useFlowchartData = (flowchartData, layoutDirection) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const processedData = useMemo(() => {
    if (!flowchartData?.data?.nodes || !flowchartData?.data?.edges) {
      return { nodes: [], edges: [] };
    }

    try {
      const styledNodes = flowchartData.data.nodes.map((node, index) => ({
        ...node,
        type: 'editable',
        style: {
          ...getNodeStyles(node.type),
          animationDelay: `${index * ANIMATION_CONFIG.stagger}s`,
        },
        data: {
          ...node.data,
          label: node.data.label || 'Untitled Node',
          nodeType: node.type || 'default',
        }
      }));

      const styledEdges = flowchartData.data.edges.map(edge =>
        createStyledEdge(edge, 'custom')
      );

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

// ------------------------------------
// Main FlowchartViewer Component
// ------------------------------------
const FlowchartViewerInner = ({
  flowchartData,
  onClose,
  className = "",
  showToolbar = true,
  showStats = true,
  showCloseButton = true,
  initialLayout = 'TB',
  allowFullscreen = true
}) => {
  const [layoutDirection, setLayoutDirection] = useState(initialLayout);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentEdgeType, setCurrentEdgeType] = useState('custom');

  const reactFlowRef = useRef(null);
  const connectingNodeId = useRef(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const { processedData, isLoading, error, setIsLoading } = useFlowchartData(
    flowchartData,
    layoutDirection
  );

  // Use useNodesState and useEdgesState hooks correctly
  const [nodes, setNodes, onNodesChange] = useNodesState(processedData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(processedData.edges);

  // Edge types configuration
  const edgeTypes = useMemo(() => ({
    custom: CustomButtonEdge,
    animated: AnimatedEdge,
    straight: StraightEdge,
    smoothstep: CustomButtonEdge,
    default: CustomButtonEdge,
  }), []);

  // Custom node types
  const nodeTypes = useMemo(() => ({
    editable: EditableNode,
    freetext: FreeTextNode,
  }), []);

  // Node update context functions
  const updateNode = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: newData,
          };
        }
        return node;
      })
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

  // Selected items tracking
  const selectedNodes = useMemo(() =>
    nodes.filter(node => node.selected), [nodes]
  );

  const selectedEdges = useMemo(() =>
    edges.filter(edge => edge.selected), [edges]
  );

  useEffect(() => {
    setNodes(processedData.nodes);
    setEdges(processedData.edges);
    setIsLoading(false);
  }, [processedData, setNodes, setEdges, setIsLoading]);

  useEffect(() => {
    if (!isLoading && nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.1, duration: 1000 });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [nodes, isLoading, fitView]);

  // Connection handlers
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      ...createStyledEdge({ id: `e${Date.now()}`, ...params }, currentEdgeType)
    }, eds)),
    [setEdges, currentEdgeType]
  );

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        const id = getId();
        const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `Node ${id}`, nodeType: 'default' },
          type: 'editable',
          style: getNodeStyles('default'),
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({
            id: `e${connectingNodeId.current}-${id}`,
            source: connectingNodeId.current,
            target: id,
            ...createStyledEdge({}, currentEdgeType)
          })
        );
      }
    },
    [screenToFlowPosition, setNodes, setEdges, currentEdgeType]
  );

  // Node and edge management functions
  const handleAddNode = useCallback((newNode) => {
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

  const handleEdgeTypeChange = useCallback((newEdgeType) => {
    setCurrentEdgeType(newEdgeType);
    // Update existing edges to new type
    setEdges((eds) => eds.map(edge => ({
      ...edge,
      type: newEdgeType
    })));
  }, [setEdges]);

  // Add text anywhere functionality
  const handlePaneClick = useCallback((event) => {
    // Only add text if not clicking on a node or edge
    if (event.target.classList.contains('react-flow__pane')) {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left - 50,
        y: event.clientY - rect.top - 20,
      };

      const newTextNode = createNewNode('freetext', position);
      setNodes((nds) => [...nds, newTextNode]);
    }
  }, [setNodes]);

  // Export options
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
        const dataStr = JSON.stringify({
          nodes: nodes.map(node => ({
            ...node,
            selected: undefined // Remove selection state from export
          })),
          edges: edges.map(edge => ({
            ...edge,
            selected: undefined // Remove selection state from export
          })),
          metadata: flowchartData?.metadata
        }, null, 2);
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

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.1, duration: 800 });
  }, [fitView]);

  const handleToggleFullscreen = useCallback(() => {
    if (allowFullscreen) {
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen, allowFullscreen]);

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
            <HiX className="w-8 h-8 text-white" />
          </div>
          <p className="text-red-600 text-lg font-medium mb-2">Error loading flowchart</p>
          <p className="text-gray-500">{error}</p>
        </motion.div>
      </div>
    );
  }

  // Empty State
  if (!flowchartData && nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <FiTarget className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 text-lg mb-4">Start creating your flowchart</p>
          <AddNodePanel onAddNode={handleAddNode} />
        </motion.div>
      </div>
    );
  }

  const containerClasses = `
    ${isFullscreen ? 'fixed inset-0 z-50' : 'relative h-full'} 
    bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 
    ${className}
  `;

  return (
    <NodeUpdateContext.Provider value={nodeUpdateContextValue}>
      <div className={containerClasses}>
        {/* Floating Toolbar */}
        {showToolbar && (
          <FloatingToolbar
            layoutDirection={layoutDirection}
            onLayoutChange={handleLayoutChange}
            onFitView={handleFitView}
            onExport={handleExport}
            isExporting={isExporting}
            exportOptions={exportOptions}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            onAddNode={handleAddNode}
            onDeleteSelected={handleDeleteSelected}
            selectedNodes={selectedNodes}
            selectedEdges={selectedEdges}
            currentEdgeType={currentEdgeType}
            onEdgeTypeChange={handleEdgeTypeChange}
          />
        )}

        {/* Close Button */}
        {showCloseButton && onClose && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            onClick={onClose}
            className="fixed top-6 right-6 z-50 p-3 bg-white/90 backdrop-blur-xl border border-white/20 text-gray-600 hover:text-red-500 hover:bg-red-50/50 rounded-2xl shadow-2xl transition-all duration-200"
          >
            <HiX className="w-5 h-5" />
          </motion.button>
        )}

        {/* Stats Panel */}
        {showStats && (
          <StatsPanel
            nodeCount={nodes.length}
            edgeCount={edges.length}
            selectedNodes={selectedNodes}
            selectedEdges={selectedEdges}
          />
        )}

        {/* Instructions Panel */}
        <Panel position="bottom-right" className="bg-white/90 backdrop-blur-xl rounded-lg p-3 text-xs text-gray-600 max-w-xs">
          <div className="space-y-1">
            <p><strong>Double-click</strong> nodes/text to edit</p>
            <p><strong>Click canvas</strong> to add free text</p>
            <p><strong>Drag handles</strong> to connect nodes</p>
            <p><strong>Hover edges</strong> to delete them</p>
            <p><strong>Delete key</strong> removes selected items</p>
          </div>
        </Panel>

        {/* Main Flowchart */}
        <div className="h-full w-full" ref={reactFlowRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 border-3 border-indigo-200 rounded-full"></div>
                  <div className="absolute inset-0 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading flowchart...</p>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onPaneClick={handlePaneClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
                fitViewOptions={{ padding: 0.1 }}
                minZoom={0.1}
                maxZoom={4}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                multiSelectionKeyCode="Shift"
                deleteKeyCode="Delete"
                className="flowchart-canvas"
                defaultEdgeOptions={{
                  type: currentEdgeType,
                  animated: currentEdgeType === 'animated',
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: COLORS.primary,
                  },
                  style: {
                    strokeWidth: 2.5,
                    stroke: COLORS.primary,
                  },
                  interactionWidth: 20,
                }}
              >
                <Background
                  color={COLORS.border}
                  gap={40}
                  size={1.2}
                  variant="dots"
                  className="opacity-30"
                />

                <Controls
                  position="top-right"
                  className="!bg-white/90 !backdrop-blur-xl !border-white/20 !shadow-2xl !rounded-2xl [&>button]:!border-0 [&>button]:!bg-transparent [&>button]:hover:!bg-indigo-50 [&>button]:!text-gray-600 [&>button]:hover:!text-indigo-600 [&>button]:!rounded-xl [&>button]:!transition-all [&>button]:!duration-200"
                />

                {nodes.length > 3 && (
                  <MiniMap
                    nodeColor={(node) => {
                      const type = node.data?.nodeType || 'default';
                      const colorMap = {
                        input: COLORS.primary,
                        output: COLORS.success,
                        decision: COLORS.warning,
                        process: COLORS.secondary,
                        text: '#d97706',
                        default: COLORS.neutral
                      };
                      return colorMap[type];
                    }}
                    maskColor="rgba(99, 102, 241, 0.1)"
                    position="bottom-left"
                    className="!bg-white/90 !backdrop-blur-xl !border-white/20 !shadow-2xl !rounded-2xl !mb-20"
                    pannable
                    zoomable
                  />
                )}
              </ReactFlow>
            </motion.div>
          )}
        </div>
      </div>
    </NodeUpdateContext.Provider>
  );
};

// ------------------------------------
// Wrapper with Provider
// ------------------------------------
const FlowchartViewer = (props) => {
  return (
    <ReactFlowProvider>
      <FlowchartViewerInner {...props} />
    </ReactFlowProvider>
  );
};

export default FlowchartViewer;
