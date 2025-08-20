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

        // Create comprehensive prompt for flowchart generation
        const systemPrompt = `
You are an expert flowchart designer specializing in complex, enterprise-level process diagrams. Create a React Flow compatible JSON structure for the following request.

CORE REQUIREMENTS:
1. Generate nodes with unique IDs following pattern: node_[category]_[number] (e.g., node_start_1, node_process_1)
2. Each node must have: id, type, data (with label and optional metadata), position (x, y coordinates)
3. Node types: 'input', 'default', 'output', 'decision', 'process', 'subprocess', 'connector', 'custom'
4. Generate edges with unique IDs following pattern: edge_[source]_to_[target] (e.g., edge_start_1_to_process_1)
5. Each edge must have: id, source, target, type, label (for decision branches), style properties

ADVANCED POSITIONING & LAYOUT:
- Calculate positions for multiple parallel paths and complex branching
- Use grid-based positioning: base grid of 300x200 pixels per node slot
- For parallel processes: arrange horizontally at same Y level with 350px spacing
- For sequential steps: arrange vertically with 250px spacing
- For decision branches: position branches at ±200px X offset from decision node
- For convergence points: align multiple inputs to single output node
- Handle swimlanes: group related processes with consistent X positioning
- Support multi-layer architecture: use Y-axis layers (0-200, 300-500, 600-800, etc.)

COMPLEX STRUCTURE SUPPORT:
- Multiple starting points: Support workflows with several initiation triggers
- Parallel execution paths: Create simultaneous processes that run concurrently
- Convergence and synchronization: Merge parallel paths with proper connector nodes
- Nested subprocess: Use 'subprocess' type for complex sub-workflows
- Decision trees: Support multiple-level decision making with proper branching
- Loop structures: Handle iterative processes with feedback edges
- Exception handling: Include error paths and recovery processes
- Conditional branching: Support multiple conditions from single decision node

ENTERPRISE FEATURES:
- Role-based swimlanes: Group nodes by responsible department/role
- Process hierarchy: Support parent-child process relationships  
- Resource dependencies: Show resource allocation and constraints
- Time-based sequencing: Include timing information in metadata
- Approval workflows: Handle multi-stage approval processes
- Integration points: Mark external system touchpoints
- Data flow indicators: Show information exchange between processes

ENHANCED NODE PROPERTIES:
- Include metadata: { duration, resources, stakeholders, systemId, priority }
- Add styling based on node category: colors, icons, sizes
- Support custom node dimensions for complex processes
- Include status indicators: pending, active, completed, error

EDGE ENHANCEMENTS:
- Conditional labels: "Yes", "No", "Approved", "Rejected", "Timeout"
- Edge types: 'default', 'smoothstep', 'straight', 'step'  
- Visual styling: colors, thickness, animation for active paths
- Data flow indicators: show information/document flow direction

LAYOUT ALGORITHMS:
For complexity level:
- Simple (1-10 nodes): Linear or basic branching layout
- Medium (11-25 nodes): Multi-path with some parallelism  
- Complex (26-50 nodes): Full parallel processing with swimlanes
- Enterprise (50+ nodes): Multi-layer architecture with subprocess grouping

POSITIONING CALCULATIONS:
- Start nodes: Y=100, X based on number of starting points
- Decision nodes: Center branches around decision point
- Parallel paths: Calculate X positions to avoid overlap
- Convergence: Position merge points to accommodate all inputs
- End nodes: Bottom tier with proper spacing

ACCESSIBILITY & STANDARDS:
- Ensure minimum 150px spacing between adjacent nodes
- Use consistent node sizing: width 180-220px, height 60-100px  
- Provide clear visual hierarchy with appropriate node types
- Include descriptive labels and meaningful IDs
- Support responsive layouts for different screen sizes

METADATA STRUCTURE:
Include comprehensive metadata:
{
  "title": "Process Title",
  "description": "Process description", 
  "complexity": "${complexity}",
  "style": "${style}",
  "nodeCount": number,
  "edgeCount": number,
  "layers": ["layer1", "layer2"],
  "swimlanes": ["role1", "role2"],
  "estimatedDuration": "time estimate",
  "stakeholders": ["stakeholder list"]
}

STYLE VARIATIONS:
- Corporate: Clean, professional styling with subdued colors
- Technical: Detailed with system information and technical specs
- Creative: Vibrant colors and modern design elements  
- Minimal: Simple, clean design with focus on clarity
- Detailed: Comprehensive information display with rich metadata

ERROR HANDLING:
- Validate all node connections have valid source/target
- Ensure no orphaned nodes (except designated start/end)
- Check for circular dependencies in non-loop structures
- Verify position coordinates don't create overlaps

User Request Context:
Complexity level: ${complexity}
Style preference: ${style}  
Request: ${prompt}

Generate a complete, production-ready React Flow JSON structure that represents this process as a sophisticated, navigable flowchart suitable for enterprise use. Ensure the structure can handle complex business processes with multiple stakeholders, parallel execution paths, and comprehensive process documentation.
`;


        console.log('Generating flowchart for prompt:', prompt);

        // Generate content with Gemini
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const flowchartData = JSON.parse(response.text());

        // Validate the generated data
        if (!flowchartData.nodes || !Array.isArray(flowchartData.nodes)) {
            throw new Error('Invalid flowchart data: missing or invalid nodes array');
        }

        if (!flowchartData.edges || !Array.isArray(flowchartData.edges)) {
            throw new Error('Invalid flowchart data: missing or invalid edges array');
        }

        // Enhance the flowchart with better styling
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
 * Enhance flowchart with better styling and positioning
 */
function enhanceFlowchartStyling(flowchart) {
    const enhanced = JSON.parse(JSON.stringify(flowchart));

    // Style enhancements for nodes
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

    // Style enhancements for edges
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

    // Check nodes
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

    // Check edges
    if (!data.edges || !Array.isArray(data.edges)) {
        errors.push('Missing or invalid edges array');
    } else {
        data.edges.forEach((edge, index) => {
            if (!edge.id) errors.push(`Edge ${index}: missing id`);
            if (!edge.source) errors.push(`Edge ${index}: missing source`);
            if (!edge.target) errors.push(`Edge ${index}: missing target`);
        });
    }

    // Check for orphaned nodes
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
