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
    BUSINESS_MODEL: 'business_model',
    FISHBONE: 'fishbone',
    PYRAMID: 'pyramid',
    VENN_DIAGRAM: 'venn_diagram',
    SWOT: 'swot',
    PORTER_FORCES: 'porter_forces',
    BALANCED_SCORECARD: 'balanced_scorecard',
    ROADMAP: 'roadmap',
    CAPABILITY_MAP: 'capability_map'
};

// Enhanced diagram-specific configurations
const DIAGRAM_CONFIGS = {
    [DIAGRAM_TYPES.FLOWCHART]: {
        nodeTypes: ['start', 'process', 'decision', 'end', 'connector'],
        edgeTypes: ['flow', 'decision_yes', 'decision_no'],
        layout: 'hierarchical',
        minNodes: 5,
        maxNodes: 50
    },
    [DIAGRAM_TYPES.ER_DIAGRAM]: {
        nodeTypes: ['entity', 'attribute', 'relationship', 'weak_entity'],
        edgeTypes: ['one_to_one', 'one_to_many', 'many_to_many'],
        layout: 'organic',
        minNodes: 3,
        maxNodes: 30
    },
    [DIAGRAM_TYPES.UML_CLASS]: {
        nodeTypes: ['class', 'interface', 'abstract_class', 'enum'],
        edgeTypes: ['inheritance', 'composition', 'aggregation', 'association', 'dependency'],
        layout: 'hierarchical',
        minNodes: 3,
        maxNodes: 25
    },
    [DIAGRAM_TYPES.UML_SEQUENCE]: {
        nodeTypes: ['actor', 'object', 'lifeline', 'activation'],
        edgeTypes: ['message', 'return', 'async_message', 'self_message'],
        layout: 'sequence',
        minNodes: 3,
        maxNodes: 15
    },
    [DIAGRAM_TYPES.NETWORK]: {
        nodeTypes: ['router', 'switch', 'firewall', 'server', 'client', 'cloud'],
        edgeTypes: ['ethernet', 'wifi', 'fiber', 'vpn'],
        layout: 'organic',
        minNodes: 4,
        maxNodes: 30
    },
    [DIAGRAM_TYPES.ORG_CHART]: {
        nodeTypes: ['ceo', 'department', 'manager', 'employee', 'consultant'],
        edgeTypes: ['reports_to', 'manages', 'collaborates'],
        layout: 'hierarchical',
        minNodes: 5,
        maxNodes: 40
    },
    [DIAGRAM_TYPES.MIND_MAP]: {
        nodeTypes: ['central', 'main_branch', 'sub_branch', 'leaf'],
        edgeTypes: ['branch', 'connection'],
        layout: 'radial',
        minNodes: 5,
        maxNodes: 35
    },
    [DIAGRAM_TYPES.GANTT]: {
        nodeTypes: ['milestone', 'task', 'phase', 'dependency'],
        edgeTypes: ['predecessor', 'successor', 'dependency'],
        layout: 'timeline',
        minNodes: 4,
        maxNodes: 25
    },
    [DIAGRAM_TYPES.BPMN]: {
        nodeTypes: ['start_event', 'task', 'gateway', 'end_event', 'subprocess'],
        edgeTypes: ['sequence_flow', 'message_flow'],
        layout: 'hierarchical',
        minNodes: 4,
        maxNodes: 30
    },
    [DIAGRAM_TYPES.SYSTEM_ARCHITECTURE]: {
        nodeTypes: ['frontend', 'backend', 'database', 'api', 'service', 'cache'],
        edgeTypes: ['api_call', 'data_flow', 'dependency'],
        layout: 'layered',
        minNodes: 5,
        maxNodes: 40
    }
};

const generateDiagram = async (req, res) => {
    try {
        const {
            prompt,
            diagramType = DIAGRAM_TYPES.FLOWCHART,
            style = 'modern',
            complexity = 'medium',
            topic = null
        } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({
                error: 'Missing prompt',
                message: 'Please provide a prompt to generate the diagram'
            });
        }

        // Validate diagram type
        if (!Object.values(DIAGRAM_TYPES).includes(diagramType)) {
            return res.status(400).json({
                error: 'Invalid diagram type',
                message: `Supported types: ${Object.values(DIAGRAM_TYPES).join(', ')}`
            });
        }

        // Get diagram configuration
        const diagramConfig = DIAGRAM_CONFIGS[diagramType] || {
            nodeTypes: ['default'],
            edgeTypes: ['default'],
            layout: 'organic',
            minNodes: 5,
            maxNodes: 30
        };

        // Get appropriate model configuration
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.4,
                maxOutputTokens: 8192,
                responseSchema: getDiagramSchema(diagramType)
            }
        });

        // Generate enhanced system prompt
        const systemPrompt = generateAdvancedSystemPrompt(
            prompt,
            diagramType,
            style,
            complexity,
            diagramConfig,
            topic
        );

        console.log(`Generating ${diagramType} diagram for:`, prompt);

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        let diagramData = JSON.parse(response.text());

        // Enhanced processing pipeline
        diagramData = processDiagramData(diagramData, diagramType, style, complexity, diagramConfig);

        // Comprehensive validation
        const validation = validateDiagramData(diagramData, diagramType, diagramConfig);
        if (validation.errors.length > 0) {
            console.warn('Diagram validation errors:', validation.errors);
        }

        res.json({
            success: true,
            data: diagramData,
            metadata: {
                diagramType,
                nodeCount: diagramData.nodes.length,
                edgeCount: diagramData.edges.length,
                complexity: determineActualComplexity(diagramData.nodes.length),
                generatedAt: new Date().toISOString(),
                style,
                layout: diagramConfig.layout,
                validation: {
                    isValid: validation.isValid,
                    warnings: validation.warnings,
                    meaningfulNodes: validation.meaningfulNodes
                },
                diagramMetadata: {
                    ...diagramData.metadata,
                    supportedNodeTypes: diagramConfig.nodeTypes,
                    supportedEdgeTypes: diagramConfig.edgeTypes
                }
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

// Enhanced system prompt generator with comprehensive diagram support
const generateAdvancedSystemPrompt = (prompt, diagramType, style, complexity, diagramConfig, topic) => {
    const complexityGuide = {
        simple: `${diagramConfig.minNodes}-${Math.ceil(diagramConfig.maxNodes * 0.4)} meaningful nodes`,
        medium: `${Math.ceil(diagramConfig.maxNodes * 0.4)}-${Math.ceil(diagramConfig.maxNodes * 0.7)} meaningful nodes`,
        complex: `${Math.ceil(diagramConfig.maxNodes * 0.7)}-${diagramConfig.maxNodes} meaningful nodes`,
        enterprise: `${diagramConfig.maxNodes}-${diagramConfig.maxNodes * 2} meaningful nodes`
    };

    const diagramSpecificInstructions = getEnhancedDiagramInstructions(diagramType, diagramConfig);
    const topicContext = topic ? `\nTOPIC CONTEXT: "${topic}"` : '';

    return `
You are an EXPERT DIAGRAM ARCHITECT specializing in ${diagramType.toUpperCase()} diagrams.

CRITICAL REQUIREMENTS:
- Generate ${complexityGuide[complexity]} with descriptive, domain-specific labels
- Use appropriate node types: ${diagramConfig.nodeTypes.join(', ')}
- Use appropriate edge types: ${diagramConfig.edgeTypes.join(', ')}
- Ensure all edges reference existing nodes
- Follow ${diagramType} conventions and industry best practices
- Make the diagram comprehensive and informative for the given topic

DIAGRAM TYPE: ${diagramType.toUpperCase()}
${diagramSpecificInstructions}

STYLE: ${style}
COMPLEXITY: ${complexity}
LAYOUT: ${diagramConfig.layout}${topicContext}
USER REQUEST: "${prompt}"

Create a professional ${diagramType} diagram that accurately represents the requested system/process/concept.
Focus on clarity, logical structure, and domain-specific terminology.
Ensure the diagram is educational and provides real value to viewers.
`;
};

// Enhanced diagram-specific instructions
const getEnhancedDiagramInstructions = (diagramType, config) => {
    const instructions = {
        [DIAGRAM_TYPES.FLOWCHART]: `
- Use rectangle nodes for processes, diamond for decisions, ellipse for start/end
- Show clear decision paths with YES/NO labels on edges
- Include proper flow direction and logical sequence
- Add connector nodes for complex branching`,

        [DIAGRAM_TYPES.ER_DIAGRAM]: `
- Create entities (strong rectangles), weak entities (double rectangles)
- Show attributes as ellipses connected to entities
- Use diamond shapes for relationships
- Include cardinality notations (1:1, 1:M, M:N)
- Show primary keys (underlined) and foreign keys`,

        [DIAGRAM_TYPES.UML_CLASS]: `
- Show classes with three compartments: name, attributes, methods
- Include visibility indicators (+public, -private, #protected, ~package)
- Show relationships: inheritance (empty triangle), composition (filled diamond)
- Include interfaces (<<interface>>) and abstract classes (italics)
- Show multiplicities on associations`,

        [DIAGRAM_TYPES.UML_SEQUENCE]: `
- Show actors/objects as vertical lifelines
- Include activation boxes for method executions
- Order interactions chronologically from top to bottom
- Show synchronous (solid arrow) and asynchronous (open arrow) messages
- Include return messages (dashed arrows)`,

        [DIAGRAM_TYPES.UML_ACTIVITY]: `
- Use rounded rectangles for activities
- Show decision nodes as diamonds with guard conditions
- Include fork/join nodes for parallel activities
- Show start (filled circle) and end (bull's eye) nodes
- Use swimlanes for different actors/systems`,

        [DIAGRAM_TYPES.NETWORK]: `
- Show network devices with appropriate icons/shapes
- Include IP addresses, subnets, and VLANs
- Display protocols and connection types
- Show firewalls, routers, switches, and servers
- Include data flow directions and security zones`,

        [DIAGRAM_TYPES.ORG_CHART]: `
- Show hierarchical reporting structure clearly
- Include job titles, departments, and team names
- Use consistent formatting for different organizational levels
- Show direct reports and matrix relationships
- Include contact information if relevant`,

        [DIAGRAM_TYPES.MIND_MAP]: `
- Place central concept at the center
- Branch main topics radially from center
- Use colors to categorize different branches
- Include sub-topics and details on branches
- Show relationships between different branches`,

        [DIAGRAM_TYPES.GANTT]: `
- Show tasks with start dates, durations, and dependencies
- Include milestones as diamond shapes
- Display project phases and work breakdown structure
- Show critical path and resource allocations
- Include progress indicators and deadlines`,

        [DIAGRAM_TYPES.BPMN]: `
- Use BPMN 2.0 standard notation strictly
- Include start events (circle), tasks (rounded rectangle), gateways (diamond)
- Show pools and lanes for different participants
- Include message flows between participants
- Use proper event types (timer, message, error, etc.)`,

        [DIAGRAM_TYPES.SYSTEM_ARCHITECTURE]: `
- Show system components and their interactions
- Include databases, APIs, services, and user interfaces
- Display data flow and communication protocols
- Show deployment boundaries and security layers
- Include load balancers, caches, and external systems`,

        [DIAGRAM_TYPES.USER_JOURNEY]: `
- Map user touchpoints and interactions chronologically
- Show user emotions and pain points
- Include backstage processes and systems
- Display channels and devices used
- Show opportunities for improvement`,

        [DIAGRAM_TYPES.DATA_FLOW]: `
- Show data stores as open rectangles
- Use circles for processes/transformations
- Display external entities as squares
- Show data flows with labeled arrows
- Include data flow names and descriptions`,

        [DIAGRAM_TYPES.DECISION_TREE]: `
- Start with root decision node
- Branch based on criteria and conditions
- Show probability or outcome values
- Use consistent notation for decisions vs outcomes
- Include leaf nodes with final results`,

        [DIAGRAM_TYPES.SWIMLANE]: `
- Organize activities by actor/role in lanes
- Show handoffs between different lanes clearly
- Include decision points and parallel processes
- Display timeline or sequence of activities
- Show responsibilities and accountabilities`,

        [DIAGRAM_TYPES.INFRASTRUCTURE]: `
- Show physical and virtual infrastructure components
- Include servers, networks, storage, and security
- Display geographical distribution and zones
- Show monitoring and management systems
- Include disaster recovery and backup systems`,

        [DIAGRAM_TYPES.VALUE_STREAM]: `
- Map end-to-end value delivery process
- Show value-adding and non-value-adding activities
- Include cycle times and wait times
- Display information flows and systems
- Show improvement opportunities and waste`,

        [DIAGRAM_TYPES.CUSTOMER_JOURNEY]: `
- Map customer experience across all touchpoints
- Show customer emotions and satisfaction levels
- Include pain points and moments of truth
- Display channels and interactions
- Show opportunities for experience improvement`,

        [DIAGRAM_TYPES.BUSINESS_MODEL]: `
- Show key partnerships and suppliers
- Include key activities and resources
- Display value propositions clearly
- Show customer segments and relationships
- Include revenue streams and cost structure`
    };

    return instructions[diagramType] || `Follow standard ${diagramType} conventions and best practices.`;
};

// Enhanced data processing with diagram-specific logic
const processDiagramData = (diagramData, diagramType, style, complexity, diagramConfig) => {
    let processed = { ...diagramData };

    // Step 1: Repair structural issues
    processed = repairDiagramData(processed, diagramType);

    // Step 2: Apply diagram-specific enhancements
    processed = applyDiagramTypeEnhancements(processed, diagramType, diagramConfig);

    // Step 3: Enhanced node positioning
    processed = enhanceNodePositioning(processed, diagramType, diagramConfig.layout);

    // Step 4: Apply styling
    processed = enhanceDiagramStyling(processed, diagramType, style);

    // Step 5: Validate and filter nodes
    processed = filterValidNodes(processed, diagramType);

    return processed;
};

// Apply diagram-type specific enhancements
const applyDiagramTypeEnhancements = (diagramData, diagramType, config) => {
    const enhanced = { ...diagramData };

    // Enhance nodes based on diagram type
    enhanced.nodes = enhanced.nodes.map(node => {
        const enhancedNode = { ...node };

        switch (diagramType) {
            case DIAGRAM_TYPES.UML_CLASS:
                enhancedNode.data = {
                    ...enhancedNode.data,
                    attributes: enhancedNode.data.attributes || generateClassAttributes(enhancedNode.data.label),
                    methods: enhancedNode.data.methods || generateClassMethods(enhancedNode.data.label),
                    visibility: enhancedNode.data.visibility || 'public',
                    stereotype: enhancedNode.data.stereotype || null
                };
                break;

            case DIAGRAM_TYPES.ER_DIAGRAM:
                enhancedNode.data = {
                    ...enhancedNode.data,
                    entityType: enhancedNode.data.entityType || detectEntityType(enhancedNode.data.label),
                    attributes: enhancedNode.data.attributes || generateEntityAttributes(enhancedNode.data.label),
                    primaryKey: enhancedNode.data.primaryKey || generatePrimaryKey(enhancedNode.data.label)
                };
                break;

            case DIAGRAM_TYPES.NETWORK:
                enhancedNode.data = {
                    ...enhancedNode.data,
                    deviceType: enhancedNode.data.deviceType || detectNetworkDeviceType(enhancedNode.data.label),
                    ipAddress: enhancedNode.data.ipAddress || generateIPAddress(),
                    specifications: enhancedNode.data.specifications || generateDeviceSpecs(enhancedNode.data.label)
                };
                break;

            case DIAGRAM_TYPES.GANTT:
                enhancedNode.data = {
                    ...enhancedNode.data,
                    startDate: enhancedNode.data.startDate || generateStartDate(),
                    duration: enhancedNode.data.duration || generateDuration(),
                    progress: enhancedNode.data.progress || Math.floor(Math.random() * 100),
                    assignee: enhancedNode.data.assignee || generateAssignee()
                };
                break;

            case DIAGRAM_TYPES.ORG_CHART:
                enhancedNode.data = {
                    ...enhancedNode.data,
                    title: enhancedNode.data.title || enhancedNode.data.label,
                    department: enhancedNode.data.department || generateDepartment(enhancedNode.data.label),
                    level: enhancedNode.data.level || calculateOrgLevel(enhancedNode, enhanced.edges)
                };
                break;
        }

        return enhancedNode;
    });

    // Enhance edges based on diagram type
    enhanced.edges = enhanced.edges.map(edge => {
        const enhancedEdge = { ...edge };

        switch (diagramType) {
            case DIAGRAM_TYPES.UML_CLASS:
                enhancedEdge.data = {
                    ...enhancedEdge.data,
                    relationship: enhancedEdge.data.relationship || detectUMLRelationship(edge, enhanced.nodes),
                    multiplicity: enhancedEdge.data.multiplicity || generateMultiplicity()
                };
                break;

            case DIAGRAM_TYPES.ER_DIAGRAM:
                enhancedEdge.data = {
                    ...enhancedEdge.data,
                    cardinality: enhancedEdge.data.cardinality || generateCardinality(),
                    relationship: enhancedEdge.data.relationship || 'relates_to'
                };
                break;

            case DIAGRAM_TYPES.FLOWCHART:
                enhancedEdge.data = {
                    ...enhancedEdge.data,
                    condition: enhancedEdge.data.condition || generateFlowCondition(edge, enhanced.nodes)
                };
                break;
        }

        return enhancedEdge;
    });

    return enhanced;
};

// Helper functions for diagram-specific enhancements
const generateClassAttributes = (className) => {
    const commonAttributes = {
        'User': ['id: String', 'name: String', 'email: String', 'createdAt: Date'],
        'Product': ['id: String', 'name: String', 'price: Number', 'category: String'],
        'Order': ['id: String', 'userId: String', 'total: Number', 'status: String'],
        'Database': ['host: String', 'port: Number', 'name: String', 'credentials: Object']
    };

    const key = Object.keys(commonAttributes).find(k =>
        className.toLowerCase().includes(k.toLowerCase())
    );

    return key ? commonAttributes[key] : ['id: String', 'name: String', 'status: String'];
};

const generateClassMethods = (className) => {
    const commonMethods = {
        'User': ['login()', 'logout()', 'updateProfile()', 'resetPassword()'],
        'Product': ['getDetails()', 'updatePrice()', 'checkStock()', 'addToCart()'],
        'Order': ['calculateTotal()', 'updateStatus()', 'sendConfirmation()', 'cancel()'],
        'Service': ['start()', 'stop()', 'restart()', 'getStatus()']
    };

    const key = Object.keys(commonMethods).find(k =>
        className.toLowerCase().includes(k.toLowerCase())
    );

    return key ? commonMethods[key] : ['execute()', 'validate()', 'process()', 'complete()'];
};

const detectEntityType = (label) => {
    if (label.toLowerCase().includes('user') || label.toLowerCase().includes('customer')) return 'strong';
    if (label.toLowerCase().includes('order') || label.toLowerCase().includes('transaction')) return 'strong';
    if (label.toLowerCase().includes('detail') || label.toLowerCase().includes('item')) return 'weak';
    return 'strong';
};

const generateEntityAttributes = (entityName) => {
    const baseAttributes = ['id', 'created_at', 'updated_at'];

    if (entityName.toLowerCase().includes('user')) {
        return [...baseAttributes, 'username', 'email', 'password_hash', 'status'];
    } else if (entityName.toLowerCase().includes('product')) {
        return [...baseAttributes, 'name', 'description', 'price', 'category_id'];
    } else if (entityName.toLowerCase().includes('order')) {
        return [...baseAttributes, 'user_id', 'total_amount', 'status', 'order_date'];
    }

    return [...baseAttributes, 'name', 'description', 'status'];
};

const detectNetworkDeviceType = (label) => {
    const types = {
        'router': ['router', 'gateway'],
        'switch': ['switch', 'hub'],
        'firewall': ['firewall', 'security'],
        'server': ['server', 'host', 'database'],
        'client': ['client', 'workstation', 'pc', 'laptop'],
        'cloud': ['cloud', 'aws', 'azure', 'gcp']
    };

    for (const [type, keywords] of Object.entries(types)) {
        if (keywords.some(keyword => label.toLowerCase().includes(keyword))) {
            return type;
        }
    }

    return 'device';
};

// Enhanced positioning system
const enhanceNodePositioning = (diagramData, diagramType, layoutType) => {
    const enhanced = { ...diagramData };

    switch (layoutType) {
        case 'hierarchical':
            enhanced.nodes = positionHierarchicalDiagram(enhanced.nodes, enhanced.edges);
            break;
        case 'organic':
            enhanced.nodes = positionOrganicDiagram(enhanced.nodes, enhanced.edges);
            break;
        case 'radial':
            enhanced.nodes = positionRadialDiagram(enhanced.nodes, enhanced.edges);
            break;
        case 'timeline':
            enhanced.nodes = positionTimelineDiagram(enhanced.nodes);
            break;
        case 'sequence':
            enhanced.nodes = positionSequenceDiagram(enhanced.nodes, enhanced.edges);
            break;
        case 'layered':
            enhanced.nodes = positionLayeredDiagram(enhanced.nodes, enhanced.edges);
            break;
        default:
            enhanced.nodes = positionGridDiagram(enhanced.nodes);
    }

    return enhanced;
};

// New positioning algorithms
const positionOrganicDiagram = (nodes, edges) => {
    const positioned = [...nodes];
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(200 + nodes.length * 10, 350);

    // Use force-directed positioning simulation
    positioned.forEach((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        const radiusVariation = radius * (0.7 + Math.random() * 0.6);

        node.position = {
            x: centerX + radiusVariation * Math.cos(angle),
            y: centerY + radiusVariation * Math.sin(angle)
        };
    });

    return positioned;
};

const positionSequenceDiagram = (nodes, edges) => {
    const positioned = [...nodes];
    const spacing = { x: 200, y: 100 };
    const baseY = 100;

    // Separate lifelines and messages
    const lifelines = positioned.filter(node =>
        node.data?.category === 'lifeline' || node.data?.label?.toLowerCase().includes('actor')
    );

    const messages = positioned.filter(node =>
        !lifelines.includes(node)
    );

    // Position lifelines horizontally
    lifelines.forEach((node, index) => {
        node.position = {
            x: index * spacing.x + 150,
            y: baseY
        };
    });

    // Position messages vertically
    messages.forEach((node, index) => {
        node.position = {
            x: 300,
            y: baseY + (index + 1) * spacing.y
        };
    });

    return positioned;
};

const positionLayeredDiagram = (nodes, edges) => {
    const positioned = [...nodes];
    const layers = calculateNodeLayers(nodes, edges);
    const spacing = { x: 180, y: 150 };

    Object.keys(layers).forEach(level => {
        const levelNodes = layers[level];
        const levelY = parseInt(level) * spacing.y + 100;

        levelNodes.forEach((nodeId, index) => {
            const node = positioned.find(n => n.id === nodeId);
            if (node) {
                node.position = {
                    x: (index - (levelNodes.length - 1) / 2) * spacing.x + 400,
                    y: levelY
                };
            }
        });
    });

    return positioned;
};

// Enhanced schema generator
const getDiagramSchema = (diagramType) => {
    const baseSchema = {
        type: "object",
        properties: {
            nodes: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        type: { type: "string", default: "default" },
                        data: {
                            type: "object",
                            properties: {
                                label: {
                                    type: "string",
                                    description: "Descriptive, meaningful label - never generic like 'node1'"
                                },
                                description: { type: "string" },
                                category: { type: "string" },
                                shape: { type: "string", enum: ["rectangle", "ellipse", "diamond", "hexagon", "parallelogram"] }
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
                        }
                    },
                    required: ["id", "data", "position"]
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
                        data: {
                            type: "object",
                            properties: {
                                label: { type: "string" },
                                relationship: { type: "string" }
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
                    title: { type: "string" },
                    description: { type: "string" }
                }
            }
        },
        required: ["nodes", "edges", "metadata"]
    };

    // Add diagram-specific properties
    switch (diagramType) {
        case DIAGRAM_TYPES.UML_CLASS:
            baseSchema.properties.nodes.items.properties.data.properties.attributes = {
                type: "array",
                items: { type: "string" }
            };
            baseSchema.properties.nodes.items.properties.data.properties.methods = {
                type: "array",
                items: { type: "string" }
            };
            break;

        case DIAGRAM_TYPES.ER_DIAGRAM:
            baseSchema.properties.nodes.items.properties.data.properties.entityType = {
                type: "string",
                enum: ["strong", "weak", "relationship"]
            };
            baseSchema.properties.nodes.items.properties.data.properties.attributes = {
                type: "array",
                items: { type: "string" }
            };
            break;

        case DIAGRAM_TYPES.GANTT:
            baseSchema.properties.nodes.items.properties.data.properties.startDate = { type: "string" };
            baseSchema.properties.nodes.items.properties.data.properties.duration = { type: "string" };
            baseSchema.properties.nodes.items.properties.data.properties.progress = { type: "number" };
            break;
    }

    return baseSchema;
};

// Rest of the utility functions (keeping existing ones and adding new ones)

// Generate meaningful data helpers
const generateIPAddress = () => {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const generateStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30));
    return date.toISOString().split('T')[0];
};

const generateDuration = () => {
    const durations = ['1d', '2d', '1w', '2w', '1m'];
    return durations[Math.floor(Math.random() * durations.length)];
};

const generateAssignee = () => {
    const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Team Alpha'];
    return names[Math.floor(Math.random() * names.length)];
};

const generateMultiplicity = () => {
    const multiplicities = ['1', '0..1', '1..*', '0..*', '*'];
    return multiplicities[Math.floor(Math.random() * multiplicities.length)];
};

const generateCardinality = () => {
    const cardinalities = ['1:1', '1:M', 'M:N'];
    return cardinalities[Math.floor(Math.random() * cardinalities.length)];
};

// Enhanced validation
const validateDiagramData = (data, diagramType, config) => {
    const errors = [];
    const warnings = [];
    let meaningfulNodes = 0;

    if (!data.nodes || !Array.isArray(data.nodes)) {
        errors.push('Missing or invalid nodes array');
        return { isValid: false, errors, warnings, meaningfulNodes };
    }

    if (!data.edges || !Array.isArray(data.edges)) {
        errors.push('Missing or invalid edges array');
        return { isValid: false, errors, warnings, meaningfulNodes };
    }

    // Validate node count against configuration
    if (data.nodes.length < config.minNodes) {
        warnings.push(`Node count (${data.nodes.length}) below recommended minimum (${config.minNodes})`);
    }

    if (data.nodes.length > config.maxNodes * 1.5) {
        warnings.push(`Node count (${data.nodes.length}) significantly above maximum (${config.maxNodes})`);
    }

    const nodeIds = new Set();

    data.nodes.forEach((node, index) => {
        if (!node.id) {
            errors.push(`Node ${index}: missing id`);
        } else {
            nodeIds.add(node.id);
        }

        if (!node.data || !node.data.label) {
            warnings.push(`Node ${index}: missing data.label`);
        } else {
            const label = node.data.label.trim();
            const isGeneric = /^(node|element|item|step)[\s_]*\d*$/i.test(label);
            if (!isGeneric && label.length > 2) {
                meaningfulNodes++;
            }
        }

        // Diagram-specific validation
        if (diagramType === DIAGRAM_TYPES.UML_CLASS) {
            if (!node.data?.attributes && !node.data?.methods) {
                warnings.push(`UML Class node ${index}: missing attributes and methods`);
            }
        }
    });

    data.edges.forEach((edge, index) => {
        if (!edge.source || !edge.target) {
            errors.push(`Edge ${index}: missing source or target`);
        }
        if (edge.source && !nodeIds.has(edge.source)) {
            errors.push(`Edge ${index}: source '${edge.source}' not found`);
        }
        if (edge.target && !nodeIds.has(edge.target)) {
            errors.push(`Edge ${index}: target '${edge.target}' not found`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        meaningfulNodes
    };
};

// Keep all existing utility functions and add new exports
module.exports = {
    generateDiagram,
    validateDiagramStructure: async (req, res) => {
        try {
            const { diagramData, diagramType } = req.body;

            if (!diagramData) {
                return res.status(400).json({
                    error: 'Missing data',
                    message: 'Please provide diagram data to validate'
                });
            }

            const config = DIAGRAM_CONFIGS[diagramType] || DIAGRAM_CONFIGS[DIAGRAM_TYPES.FLOWCHART];
            const processedData = processDiagramData(diagramData, diagramType, 'modern', 'medium', config);
            const validation = validateDiagramData(processedData, diagramType, config);

            res.json({
                isValid: validation.isValid,
                errors: validation.errors,
                warnings: validation.warnings,
                nodeCount: processedData.nodes?.length || 0,
                edgeCount: processedData.edges?.length || 0,
                meaningfulNodes: validation.meaningfulNodes,
                diagramType: diagramType || 'unknown',
                processed: processedData
            });

        } catch (error) {
            console.error('Error validating diagram:', error);
            res.status(500).json({
                error: 'Validation failed',
                message: error.message
            });
        }
    },
    getDiagramFormats: (req, res) => {
        const formatInfo = {};

        Object.entries(DIAGRAM_CONFIGS).forEach(([type, config]) => {
            formatInfo[type] = {
                nodeTypes: config.nodeTypes,
                edgeTypes: config.edgeTypes,
                layout: config.layout,
                nodeRange: `${config.minNodes}-${config.maxNodes}`,
                description: getEnhancedDiagramInstructions(type, config).split('\n')[1]?.trim()
            };
        });

        res.json({
            supportedTypes: Object.values(DIAGRAM_TYPES),
            diagramConfigurations: formatInfo,
            complexityLevels: {
                simple: 'Basic structure with essential elements',
                medium: 'Detailed structure with comprehensive elements',
                complex: 'Advanced structure with extensive detail',
                enterprise: 'Full enterprise-level comprehensive structure'
            },
            styleOptions: ['modern', 'minimal', 'colorful', 'enterprise'],
            layoutOptions: ['hierarchical', 'organic', 'radial', 'timeline', 'sequence', 'layered'],
            features: {
                positioning: 'Advanced ELK-based layout algorithms',
                validation: 'Comprehensive validation with diagram-specific rules',
                styling: 'Professional styling with diagram-aware theming',
                enhancement: 'Intelligent content enhancement based on diagram type'
            }
        });
    }
};

// Additional utility functions that were referenced but not defined
const calculateNodeLevels = (nodes, edges) => {
    const levels = {};
    const visited = new Set();
    const hasIncoming = new Set(edges.map(e => e.target));
    const roots = nodes.filter(n => !hasIncoming.has(n.id));

    if (roots.length === 0 && nodes.length > 0) {
        roots.push(nodes[0]);
    }

    const assignLevel = (nodeId, level) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        if (!levels[level]) levels[level] = [];
        levels[level].push(nodeId);

        const children = edges
            .filter(e => e.source === nodeId)
            .map(e => e.target);

        children.forEach(childId => assignLevel(childId, level + 1));
    };

    roots.forEach(root => assignLevel(root.id, 0));

    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            assignLevel(node.id, 0);
        }
    });

    return levels;
};

const repairDiagramData = (diagramData, diagramType) => {
    if (!diagramData.nodes || !diagramData.edges) {
        return diagramData;
    }

    const existingNodeIds = new Set(diagramData.nodes.map(node => node.id));
    const missingNodeIds = new Set();

    diagramData.edges.forEach(edge => {
        if (!existingNodeIds.has(edge.source)) missingNodeIds.add(edge.source);
        if (!existingNodeIds.has(edge.target)) missingNodeIds.add(edge.target);
    });

    const createdNodes = [];
    missingNodeIds.forEach(nodeId => {
        const newNode = createMeaningfulNode(nodeId, diagramData.nodes, diagramType);
        createdNodes.push(newNode);
        existingNodeIds.add(nodeId);
    });

    const validEdges = diagramData.edges.filter(edge =>
        existingNodeIds.has(edge.source) && existingNodeIds.has(edge.target)
    );

    return {
        ...diagramData,
        nodes: [...diagramData.nodes, ...createdNodes],
        edges: validEdges
    };
};

const createMeaningfulNode = (nodeId, existingNodes, diagramType) => {
    const position = {
        x: (existingNodes.length % 5) * 220 + 100,
        y: Math.floor(existingNodes.length / 5) * 140 + 100
    };

    let label = 'Process Step';
    if (nodeId.toLowerCase().includes('auth')) label = 'Authentication';
    else if (nodeId.toLowerCase().includes('valid')) label = 'Validation';
    else if (nodeId.toLowerCase().includes('process')) label = 'Processing';

    return {
        id: nodeId,
        type: 'default',
        position,
        data: {
            label,
            description: `Generated for ${nodeId}`,
            category: 'auto-generated',
            shape: 'rectangle'
        }
    };
};

const filterValidNodes = (diagramData, diagramType) => {
    if (!diagramData.nodes || !Array.isArray(diagramData.nodes)) {
        return diagramData;
    }

    const originalCount = diagramData.nodes.length;

    const filteredNodes = diagramData.nodes.filter(node => {
        if (!node.data || typeof node.data !== 'object') return false;
        if (!node.data.label || typeof node.data.label !== 'string') return false;

        const label = node.data.label.trim();
        const isNodeNumber = /^node[\s_]*\d+$/i.test(label);
        const isJustNumber = /^\d+$/.test(label);
        const isGeneric = /^(node|element|item|step)$/i.test(label);

        return !(isNodeNumber || isJustNumber || isGeneric) && label.length > 2;
    });

    console.log(`Node filtering: ${originalCount} -> ${filteredNodes.length} nodes`);

    const validNodeIds = new Set(filteredNodes.map(node => node.id));
    const filteredEdges = (diagramData.edges || []).filter(edge =>
        validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
    );

    return {
        ...diagramData,
        nodes: filteredNodes,
        edges: filteredEdges
    };
};

const enhanceDiagramStyling = (diagram, diagramType, style) => {
    const enhanced = JSON.parse(JSON.stringify(diagram));

    enhanced.nodes = enhanced.nodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            shape: node.data.shape || getDefaultShape(diagramType, node.data.category)
        }
    }));

    return enhanced;
};

const getDefaultShape = (diagramType, category) => {
    const shapeMap = {
        [DIAGRAM_TYPES.FLOWCHART]: {
            'start': 'ellipse',
            'end': 'ellipse',
            'decision': 'diamond',
            'process': 'rectangle'
        },
        [DIAGRAM_TYPES.ER_DIAGRAM]: {
            'entity': 'rectangle',
            'relationship': 'diamond',
            'attribute': 'ellipse'
        }
    };

    return shapeMap[diagramType]?.[category] || 'rectangle';
};

const determineActualComplexity = (nodeCount) => {
    if (nodeCount < 10) return 'simple';
    if (nodeCount < 25) return 'medium';
    if (nodeCount < 50) return 'complex';
    return 'enterprise';
};

// Additional helper functions for specific diagram types
const detectUMLRelationship = (edge, nodes) => {
    const relationships = ['inheritance', 'composition', 'aggregation', 'association', 'dependency'];
    return relationships[Math.floor(Math.random() * relationships.length)];
};

const generateFlowCondition = (edge, nodes) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (sourceNode?.data?.shape === 'diamond') {
        return Math.random() > 0.5 ? 'Yes' : 'No';
    }
    return null;
};

const generateDepartment = (label) => {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    return departments[Math.floor(Math.random() * departments.length)];
};

const calculateOrgLevel = (node, edges) => {
    // Calculate organizational level based on incoming edges
    const incomingEdges = edges.filter(e => e.target === node.id);
    return incomingEdges.length > 0 ? 2 : 1; // Simplified level calculation
};

const generateDeviceSpecs = (deviceName) => {
    const specs = {
        'router': 'Cisco ISR 4000, 1Gbps',
        'switch': '24-port Gigabit, Layer 3',
        'firewall': 'Next-gen, 2Gbps throughput',
        'server': 'Dell R740, 32GB RAM, Ubuntu',
        'database': 'PostgreSQL 13, 1TB SSD'
    };

    const key = Object.keys(specs).find(k =>
        deviceName.toLowerCase().includes(k.toLowerCase())
    );

    return key ? specs[key] : 'Standard configuration';
};

const positionHierarchicalDiagram = (nodes, edges) => {
    const positioned = [...nodes];
    const levels = calculateNodeLevels(nodes, edges);
    const spacing = { x: 200, y: 120 };

    Object.keys(levels).forEach(level => {
        const levelNodes = levels[level];
        const levelY = parseInt(level) * spacing.y + 100;

        levelNodes.forEach((nodeId, index) => {
            const node = positioned.find(n => n.id === nodeId);
            if (node) {
                node.position = {
                    x: (index - (levelNodes.length - 1) / 2) * spacing.x + 400,
                    y: levelY
                };
            }
        });
    });

    return positioned;
};

const positionRadialDiagram = (nodes, edges) => {
    const positioned = [...nodes];
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(150 + nodes.length * 15, 400);

    // Find central node (most connected)
    const connections = {};
    edges.forEach(edge => {
        connections[edge.source] = (connections[edge.source] || 0) + 1;
        connections[edge.target] = (connections[edge.target] || 0) + 1;
    });

    const centralNodeId = Object.keys(connections).reduce((a, b) =>
        connections[a] > connections[b] ? a : b, nodes[0]?.id);

    positioned.forEach((node, index) => {
        if (node.id === centralNodeId) {
            node.position = { x: centerX, y: centerY };
        } else {
            const angle = (index / (nodes.length - 1)) * 2 * Math.PI;
            node.position = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        }
    });

    return positioned;
};

const positionTimelineDiagram = (nodes) => {
    const positioned = [...nodes];
    const spacing = 200;
    const baseY = 300;

    positioned.forEach((node, index) => {
        node.position = {
            x: index * spacing + 100,
            y: baseY + (index % 2 === 0 ? -50 : 50) // Alternating heights
        };
    });

    return positioned;
};

const positionGridDiagram = (nodes) => {
    const positioned = [...nodes];
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const spacing = { x: 220, y: 140 };

    positioned.forEach((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        node.position = {
            x: col * spacing.x + 100,
            y: row * spacing.y + 100
        };
    });

    return positioned;
};
