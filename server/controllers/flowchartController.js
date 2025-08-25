// controllers/diagramController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DIAGRAM_TYPES = {
    FLOWCHART: 'flowchart',
    ER_DIAGRAM: 'er_diagram',
    UML_CLASS: 'uml_class',
    UML_SEQUENCE: 'uml_sequence',
    UML_ACTIVITY: 'uml_activity',
    UML_STATE: 'uml_state',
    UML_USECASE: 'uml_usecase',
    NETWORK: 'network',
    ORG_CHART: 'org_chart',
    MIND_MAP: 'mind_map',
    GANTT: 'gantt',
    SWIMLANE: 'swimlane',
    BPMN: 'bpmn',
    PROCESS_FLOW: 'process_flow',
    SYSTEM_ARCHITECTURE: 'system_architecture',
    INFRASTRUCTURE: 'infrastructure',
    SITEMAP: 'sitemap',
    USER_JOURNEY: 'user_journey',
    SERVICE_BLUEPRINT: 'service_blueprint',
    DATA_FLOW: 'data_flow',
    DECISION_TREE: 'decision_tree',
    CONCEPT_MAP: 'concept_map',
    HIERARCHY: 'hierarchy',
    MATRIX: 'matrix',
    TIMELINE: 'timeline',
    DEPENDENCY: 'dependency',
    COMPARISON: 'comparison',
    SANKEY: 'sankey',
    FUNNEL: 'funnel',
    KANBAN: 'kanban',
    WORKFLOW: 'workflow',
    VALUE_STREAM: 'value_stream',
    CUSTOMER_JOURNEY: 'customer_journey',
    LEAN_CANVAS: 'lean_canvas',
    BUSINESS_MODEL: 'business_model'
};

const generateDiagram = async (req, res) => {
    try {
        const {
            prompt,
            diagramType = DIAGRAM_TYPES.FLOWCHART,
            style = 'modern',
            complexity = 'medium'
        } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({
                error: 'Missing prompt',
                message: 'Please provide a prompt to generate the diagram'
            });
        }

        // Get appropriate model configuration
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseSchema: getDiagramSchema(diagramType)
            }
        });

        // Generate system prompt with enhanced validation instructions
        const systemPrompt = generateSystemPrompt(prompt, diagramType, style, complexity);

        console.log(`Generating ${diagramType} diagram for:`, prompt);

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        let diagramData = JSON.parse(response.text());

        // CRITICAL: Repair and validate the diagram data
        diagramData = repairDiagramData(diagramData, diagramType);

        // Filter out nodes with only node numbers
        diagramData = filterValidNodes(diagramData);

        // Enhanced validation after repair and filtering
        const validation = validateDiagramData(diagramData, diagramType);
        if (!validation.isValid) {
            console.warn('Diagram validation warnings:', validation.warnings);
            if (validation.errors.length > 0) {
                throw new Error(`Critical diagram errors: ${validation.errors.join(', ')}`);
            }
        }

        // Apply enhanced styling
        const enhancedDiagram = enhanceDiagramStyling(diagramData, diagramType, style);

        res.json({
            success: true,
            data: enhancedDiagram,
            metadata: {
                diagramType,
                nodeCount: enhancedDiagram.nodes.length,
                edgeCount: enhancedDiagram.edges.length,
                complexity: determineActualComplexity(enhancedDiagram.nodes.length),
                generatedAt: new Date().toISOString(),
                style,
                repairedEdges: validation.repairedEdges || 0,
                filteredNodes: validation.filteredNodes || 0,
                diagramMetadata: enhancedDiagram.metadata || {}
            }
        });

    } catch (error) {
        console.error('Error generating diagram:', error);

        res.status(500).json({
            error: 'Generation failed',
            message: 'Failed to generate diagram. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Filter nodes to only include those with meaningful data
const filterValidNodes = (diagramData) => {
    if (!diagramData.nodes || !Array.isArray(diagramData.nodes)) {
        return diagramData;
    }

    const originalCount = diagramData.nodes.length;

    const filteredNodes = diagramData.nodes.filter(node => {
        if (!node.data || typeof node.data !== 'object') {
            console.log(`Filtering out node ${node.id}: no data object`);
            return false;
        }

        if (!node.data.label || typeof node.data.label !== 'string') {
            console.log(`Filtering out node ${node.id}: no label`);
            return false;
        }

        const label = node.data.label.trim();

        // Exclude patterns like: "node1", "Node 2", etc.
        const isNodeNumber = /^node[\s_]*\d+$/i.test(label);
        const isJustNumber = /^\d+$/.test(label);
        const isGeneric = /^(node|element|item|step)$/i.test(label);

        if (isNodeNumber || isJustNumber || isGeneric) {
            console.log(`Filtering out node ${node.id}: generic label "${label}"`);
            return false;
        }

        return true;
    });

    console.log(`Node filtering: ${originalCount} -> ${filteredNodes.length} nodes`);

    const validNodeIds = new Set(filteredNodes.map(node => node.id));

    const filteredEdges = (diagramData.edges || []).filter(edge => {
        const hasValidSource = validNodeIds.has(edge.source);
        const hasValidTarget = validNodeIds.has(edge.target);

        if (!hasValidSource || !hasValidTarget) {
            console.log(`Filtering out edge ${edge.id}: connects to filtered nodes`);
            return false;
        }

        return true;
    });

    return {
        ...diagramData,
        nodes: filteredNodes,
        edges: filteredEdges
    };
};

// Repair diagram data with diagram-type specific logic
const repairDiagramData = (diagramData, diagramType) => {
    if (!diagramData.nodes || !diagramData.edges) {
        return diagramData;
    }

    const existingNodeIds = new Set(diagramData.nodes.map(node => node.id));

    const orphanEdges = [];
    const validEdges = [];
    const missingNodeIds = new Set();

    diagramData.edges.forEach((edge, index) => {
        const sourceExists = existingNodeIds.has(edge.source);
        const targetExists = existingNodeIds.has(edge.target);

        if (!sourceExists) {
            missingNodeIds.add(edge.source);
        }
        if (!targetExists) {
            missingNodeIds.add(edge.target);
        }

        if (sourceExists && targetExists) {
            validEdges.push(edge);
        } else {
            orphanEdges.push(edge);
        }
    });

    const createdNodes = [];
    missingNodeIds.forEach(nodeId => {
        const newNode = createMeaningfulNode(nodeId, diagramData.nodes, null, diagramType);
        createdNodes.push(newNode);
        existingNodeIds.add(nodeId);
    });

    const finalValidEdges = diagramData.edges.filter(edge =>
        existingNodeIds.has(edge.source) && existingNodeIds.has(edge.target)
    );

    if (finalValidEdges.length === 0 && diagramData.nodes.length > 1) {
        const basicEdges = createMeaningfulConnections(diagramData.nodes, diagramType);
        finalValidEdges.push(...basicEdges);
    }

    return {
        ...diagramData,
        nodes: [...diagramData.nodes, ...createdNodes],
        edges: finalValidEdges
    };
};

// Create meaningful nodes based on diagram type and context
const createMeaningfulNode = (nodeId, existingNodes, referencingEdge, diagramType) => {
    const gridSize = Math.ceil(Math.sqrt(existingNodes.length + 1));
    const index = existingNodes.length;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const position = {
        x: col * 220 + 100,
        y: row * 140 + 100
    };

    let label = 'Process Step';
    let nodeType = 'flowchart';

    // Context-aware label generation
    if (nodeId.toLowerCase().includes('auth')) {
        label = 'Authentication';
    } else if (nodeId.toLowerCase().includes('valid')) {
        label = 'Validation';
    } else if (nodeId.toLowerCase().includes('process')) {
        label = 'Processing';
    } else if (nodeId.toLowerCase().includes('decision')) {
        label = 'Decision Point';
    }

    return {
        id: nodeId,
        type: nodeType,
        position,
        data: {
            label,
            description: `Generated for ${nodeId}`,
            category: 'auto-generated'
        },
        style: {
            backgroundColor: '#9CA3AF',
            borderColor: '#9CA3AF',
            color: 'white'
        }
    };
};

// Create meaningful connections based on diagram type
const createMeaningfulConnections = (nodes, diagramType) => {
    const connections = [];
    const connectionStyle = { stroke: '#6B7280', strokeWidth: 2 };

    // Default sequential flow
    for (let i = 0; i < nodes.length - 1; i++) {
        connections.push({
            id: `flow_${i}`,
            source: nodes[i].id,
            target: nodes[i + 1].id,
            type: 'diagram',
            data: { relationship: 'sequential_flow' },
            style: connectionStyle
        });
    }

    return connections;
};

// Enhanced system prompt generator
const generateSystemPrompt = (prompt, diagramType, style, complexity) => {
    const complexityGuide = {
        simple: "Generate 15-30 meaningful nodes with clear, descriptive labels",
        medium: "Generate 30-80 meaningful nodes with detailed, business-relevant labels",
        complex: "Generate 80-150 meaningful nodes with comprehensive, process-specific labels",
        enterprise: "Generate 150-300 meaningful nodes with enterprise-level descriptive labels"
    };

    const basePrompt = `
You are an EXPERT DIAGRAM ARCHITECT. Create a comprehensive ${diagramType.toUpperCase()} diagram with MEANINGFUL LABELS.

CRITICAL REQUIREMENTS:
- ${complexityGuide[complexity]}
- EVERY node must have a DESCRIPTIVE, MEANINGFUL label (NOT "node1", "node2", etc.)
- Use business process terms, action verbs, and descriptive names
- Examples of GOOD labels: "Customer Authentication", "Process Payment", "Validate Account", "Send Notification"
- Examples of BAD labels: "node1", "step2", "process3", just numbers
- EVERY edge must reference nodes that actually exist in the nodes array
- Use sequential node IDs like "node1", "node2", "node3" for IDs, but meaningful labels for data.label
- Create logical flow connections between nodes

DIAGRAM TYPE: ${diagramType.toUpperCase()}
STYLE: ${style}
COMPLEXITY: ${complexity}
USER REQUEST: "${prompt}"

For a BANKING MANAGEMENT SYSTEM, create nodes covering:
- Customer authentication and login processes
- Account management and verification
- Transaction processing and validation
- Security checks and fraud detection
- Audit trails and logging
- Customer notifications and alerts
- Error handling and recovery
- Data backup and synchronization
- Regulatory compliance checks
- Administrative functions

Use meaningful banking terminology and follow proper process flow.
`;

    return basePrompt;
};

// Enhanced validation
const validateDiagramData = (data, diagramType) => {
    const errors = [];
    const warnings = [];
    let repairedEdges = 0;
    let filteredNodes = 0;

    if (!data.nodes || !Array.isArray(data.nodes)) {
        errors.push('Missing or invalid nodes array');
        return { isValid: false, errors, warnings, repairedEdges, filteredNodes };
    }

    if (!data.edges || !Array.isArray(data.edges)) {
        errors.push('Missing or invalid edges array');
        return { isValid: false, errors, warnings, repairedEdges, filteredNodes };
    }

    const nodeIds = new Set();
    let meaningfulNodes = 0;

    data.nodes.forEach((node, index) => {
        if (!node.id) {
            errors.push(`Node ${index}: missing id`);
        } else {
            if (nodeIds.has(node.id)) {
                warnings.push(`Duplicate node ID: ${node.id}`);
            }
            nodeIds.add(node.id);
        }

        if (!node.data || !node.data.label) {
            warnings.push(`Node ${index} (${node.id}): missing data.label`);
        } else {
            const label = node.data.label.trim();
            const isGeneric = /^(node|element|item|step)[\s_]*\d*$/i.test(label) || /^\d+$/.test(label);
            if (!isGeneric) {
                meaningfulNodes++;
            }
        }
    });

    data.edges.forEach((edge, index) => {
        if (!edge.id) {
            warnings.push(`Edge ${index}: missing id`);
        }
        if (!edge.source) {
            errors.push(`Edge ${index}: missing source`);
        }
        if (!edge.target) {
            errors.push(`Edge ${index}: missing target`);
        }

        if (edge.source && !nodeIds.has(edge.source)) {
            errors.push(`Edge ${index}: source node '${edge.source}' not found`);
        }
        if (edge.target && !nodeIds.has(edge.target)) {
            errors.push(`Edge ${index}: target node '${edge.target}' not found`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        repairedEdges,
        filteredNodes,
        meaningfulNodes
    };
};

// **FIXED SCHEMA - This is the key fix!**
const getDiagramSchema = (diagramType) => {
    return {
        type: "object",
        properties: {
            nodes: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        type: { type: "string" },
                        data: {
                            type: "object",
                            properties: {
                                label: {
                                    type: "string",
                                    description: "Must be meaningful and descriptive, not generic like 'node1'"
                                },
                                description: { type: "string" },
                                category: { type: "string" },
                                shape: { type: "string" }
                            },
                            required: ["label"]
                        },
                        position: {
                            type: "object",
                            properties: {
                                x: { type: "number" },
                                y: { type: "number" }
                            },
                            required: ["x", "y"]
                        },
                        style: {
                            type: "object",
                            properties: {
                                backgroundColor: { type: "string" },
                                borderColor: { type: "string" },
                                color: { type: "string" }
                            }
                        }
                    },
                    required: ["id", "type", "data", "position"]
                }
            },
            edges: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        source: { type: "string" },
                        target: { type: "string" },
                        type: { type: "string" },
                        data: {
                            type: "object",
                            properties: {
                                relationship: { type: "string" },
                                condition: { type: "string" }
                            }
                        },
                        style: {
                            type: "object",
                            properties: {
                                stroke: { type: "string" },
                                strokeWidth: { type: "number" }
                            }
                        }
                    },
                    required: ["id", "source", "target"]
                }
            },
            metadata: {
                type: "object",
                properties: {
                    diagramType: { type: "string" },
                    description: { type: "string" }
                },
                required: ["diagramType"]
            }
        },
        required: ["nodes", "edges", "metadata"]
    };
};

// Enhanced styling
const enhanceDiagramStyling = (diagram, diagramType, style) => {
    const enhanced = JSON.parse(JSON.stringify(diagram));

    enhanced.nodes = enhanced.nodes.map(node => {
        const baseStyle = getDiagramTypeStyles(diagramType, node.data?.category || node.type);

        return {
            ...node,
            style: {
                ...baseStyle,
                ...node.style
            },
            width: 160,
            height: 70
        };
    });

    enhanced.edges = enhanced.edges.map(edge => {
        return {
            ...edge,
            type: 'diagram',
            style: {
                strokeWidth: 2,
                stroke: '#6B7280',
                ...edge.style
            }
        };
    });

    return enhanced;
};

const getDiagramTypeStyles = (diagramType, nodeType) => {
    return {
        backgroundColor: '#6B7280',
        borderColor: '#6B7280',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        padding: '12px'
    };
};

const determineActualComplexity = (nodeCount) => {
    if (nodeCount < 30) return 'simple';
    if (nodeCount < 80) return 'medium';
    if (nodeCount < 200) return 'complex';
    return 'enterprise';
};

const validateDiagramStructure = async (req, res) => {
    try {
        const { diagramData, diagramType } = req.body;

        if (!diagramData) {
            return res.status(400).json({
                error: 'Missing data',
                message: 'Please provide diagram data to validate'
            });
        }

        const repairedData = repairDiagramData(diagramData, diagramType);
        const filteredData = filterValidNodes(repairedData);
        const validation = validateDiagramData(filteredData, diagramType);

        res.json({
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings,
            nodeCount: filteredData.nodes?.length || 0,
            edgeCount: filteredData.edges?.length || 0,
            meaningfulNodes: validation.meaningfulNodes,
            diagramType: diagramType || 'unknown',
            repaired: filteredData
        });

    } catch (error) {
        console.error('Error validating diagram:', error);
        res.status(500).json({
            error: 'Validation failed',
            message: error.message
        });
    }
};

const getDiagramFormats = (req, res) => {
    res.json({
        supportedTypes: Object.values(DIAGRAM_TYPES),
        complexityLevels: {
            simple: '15-30 meaningful nodes',
            medium: '30-80 meaningful nodes',
            complex: '80-200 meaningful nodes',
            enterprise: '200+ meaningful nodes'
        },
        styleOptions: ['modern', 'minimal', 'colorful', 'enterprise'],
        labelRequirements: {
            good: ['Customer Authentication', 'Process Payment', 'Validate Account'],
            bad: ['node1', 'step2', 'process3']
        }
    });
};

module.exports = {
    generateDiagram,
    validateDiagramStructure,
    getDiagramFormats
};
