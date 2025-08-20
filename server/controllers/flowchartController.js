const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateFlowchart = async (req, res) => {
    try {
        const { prompt, style = 'default', complexity = 'medium' } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({
                error: 'Missing prompt',
                message: 'Please provide a prompt to generate the flowchart'
            });
        }

        // Get Gemini model
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
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
                                            label: { type: "string" }
                                        }
                                    },
                                    position: {
                                        type: "object",
                                        properties: {
                                            x: { type: "number" },
                                            y: { type: "number" }
                                        }
                                    },
                                    style: {
                                        type: "object",
                                        properties: {
                                            backgroundColor: { type: "string" },
                                            color: { type: "string" },
                                            border: { type: "string" },
                                            borderRadius: { type: "string" }
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
                                    animated: { type: "boolean" },
                                    label: { type: "string" },
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
                        }
                    },
                    required: ["nodes", "edges"]
                }
            }
        });

        // Corrected system prompt with fixed registration flow
        const systemPrompt = `
You are an expert flowchart designer specializing in complex, enterprise-level process diagrams. 
Create a React Flow compatible JSON structure for the following request.

⚠️ IMPORTANT FIXED LOGIC:
For user registration flows:
- If input is invalid → Reject Registration → End (DO NOT send confirmation email).
- If input is valid → Create Account → Send Confirmation Email → Registration Complete.

Ensure the Reject path terminates properly.

CORE REQUIREMENTS:
1. Generate nodes with unique IDs following pattern: node_[category]_[number] (e.g., node_start_1, node_process_1)
2. Each node must have: id, type, data (with label), position (x,y)
3. Node types: 'input', 'process', 'decision', 'output'
4. Generate edges with IDs: edge_[source]_to_[target]
5. Edges must include: id, source, target, type, optional label

LAYOUT:
- Grid base: 300x200
- Sequential steps vertical spacing: 250px
- Decision branches: ±200px X offset
- Reject branch should go directly down to End, no convergence into success flow.

STYLE:
- Input: blue, rounded
- Decision: orange, diamond
- Process: gray/neutral
- Output/End: green

User Request Context:
Complexity: ${complexity}
Style: ${style}
Request: ${prompt}
`;

        console.log('Generating flowchart for prompt:', prompt);

        // Generate content with Gemini
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const flowchartData = JSON.parse(response.text());

        // Validate
        if (!flowchartData.nodes || !Array.isArray(flowchartData.nodes)) {
            throw new Error('Invalid flowchart data: missing or invalid nodes array');
        }
        if (!flowchartData.edges || !Array.isArray(flowchartData.edges)) {
            throw new Error('Invalid flowchart data: missing or invalid edges array');
        }

        const enhancedFlowchart = enhanceFlowchartStyling(flowchartData);

        res.json({
            success: true,
            data: enhancedFlowchart,
            metadata: {
                nodeCount: enhancedFlowchart.nodes.length,
                edgeCount: enhancedFlowchart.edges.length,
                generatedAt: new Date().toISOString(),
                complexity,
                style
            }
        });

    } catch (error) {
        console.error('Error generating flowchart:', error);

        if (error.message.includes('API_KEY')) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid or missing Gemini API key'
            });
        }

        res.status(500).json({
            error: 'Generation failed',
            message: 'Failed to generate flowchart. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Validate flowchart JSON structure
 */
const validateFlowchartData = async (req, res) => {
    try {
        const { flowchartData } = req.body;

        if (!flowchartData) {
            return res.status(400).json({
                error: 'Missing data',
                message: 'Please provide flowchart data to validate'
            });
        }

        const validation = validateReactFlowStructure(flowchartData);

        res.json({
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings
        });

    } catch (error) {
        console.error('Error validating flowchart:', error);
        res.status(500).json({
            error: 'Validation failed',
            message: error.message
        });
    }
};

/**
 * Get supported flowchart formats and options
 */
const getFlowchartFormats = (req, res) => {
    res.json({
        nodeTypes: ['input', 'default', 'output', 'decision', 'process'],
        edgeTypes: ['default', 'straight', 'step', 'smoothstep', 'bezier'],
        complexityLevels: ['simple', 'medium', 'complex'],
        styleOptions: ['default', 'modern', 'minimal', 'colorful'],
        examples: {
            simpleProcess: "Create a flowchart for making coffee",
            businessProcess: "Show the customer onboarding process for a SaaS application",
            decisionFlow: "Create a troubleshooting flowchart for network connectivity issues"
        }
    });
};

/**
 * Enhance flowchart styling
 */
function enhanceFlowchartStyling(flowchart) {
    const enhanced = JSON.parse(JSON.stringify(flowchart));

    enhanced.nodes = enhanced.nodes.map(node => {
        const baseStyle = {
            backgroundColor: '#ffffff',
            color: '#333333',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '10px'
        };

        let typeSpecificStyle = {};
        switch (node.type) {
            case 'input':
                typeSpecificStyle = {
                    backgroundColor: '#e3f2fd',
                    border: '2px solid #2196f3',
                    borderRadius: '20px'
                };
                break;
            case 'output':
                typeSpecificStyle = {
                    backgroundColor: '#e8f5e8',
                    border: '2px solid #4caf50',
                    borderRadius: '20px'
                };
                break;
            case 'decision':
                typeSpecificStyle = {
                    backgroundColor: '#fff3e0',
                    border: '2px solid #ff9800',
                    borderRadius: '4px'
                };
                break;
            default:
                typeSpecificStyle = {
                    backgroundColor: '#f5f5f5',
                    border: '2px solid #757575'
                };
        }

        return {
            ...node,
            style: { ...baseStyle, ...typeSpecificStyle, ...node.style }
        };
    });

    enhanced.edges = enhanced.edges.map(edge => ({
        ...edge,
        style: {
            stroke: '#666',
            strokeWidth: 2,
            ...edge.style
        },
        animated: edge.animated || false
    }));

    return enhanced;
}

/**
 * Validate React Flow JSON structure
 */
function validateReactFlowStructure(data) {
    const errors = [];
    const warnings = [];

    if (!data.nodes || !Array.isArray(data.nodes)) {
        errors.push('Missing or invalid nodes array');
    } else {
        data.nodes.forEach((node, index) => {
            if (!node.id) errors.push(`Node ${index}: missing id`);
            if (!node.data || !node.data.label) errors.push(`Node ${index}: missing data.label`);
            if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
                errors.push(`Node ${index}: invalid position coordinates`);
            }
        });
    }

    if (!data.edges || !Array.isArray(data.edges)) {
        errors.push('Missing or invalid edges array');
    } else {
        data.edges.forEach((edge, index) => {
            if (!edge.id) errors.push(`Edge ${index}: missing id`);
            if (!edge.source) errors.push(`Edge ${index}: missing source`);
            if (!edge.target) errors.push(`Edge ${index}: missing target`);
        });
    }

    if (data.nodes && data.edges) {
        const nodeIds = new Set(data.nodes.map(n => n.id));
        const connectedNodes = new Set();

        data.edges.forEach(edge => {
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
        });

        const orphanedNodes = data.nodes.filter(node =>
            !connectedNodes.has(node.id) && data.nodes.length > 1
        );

        if (orphanedNodes.length > 0) {
            warnings.push(`Found ${orphanedNodes.length} disconnected nodes`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

module.exports = {
    generateFlowchart,
    validateFlowchartData,
    getFlowchartFormats
};
