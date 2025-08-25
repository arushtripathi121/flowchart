// components/PromptForm.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiSparkles,
    HiTemplate,
    HiCog,
    HiPlay
} from 'react-icons/hi';
import { HiLightBulb } from "react-icons/hi2";
import {
    FiActivity,
    FiDatabase,
    FiBox,
    FiGrid,
    FiUsers,
    FiTrello,
    FiGitBranch,
    FiCalendar,
    FiTarget
} from 'react-icons/fi';

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

const DiagramPromptForm = ({ onSubmit, loading }) => {
    const [prompt, setPrompt] = useState('');
    const [diagramType, setDiagramType] = useState(DIAGRAM_TYPES.FLOWCHART);
    const [style, setStyle] = useState('modern');
    const [complexity, setComplexity] = useState('medium');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        onSubmit(prompt, diagramType, style, complexity);
    };

    const diagramTypes = [
        {
            value: DIAGRAM_TYPES.FLOWCHART,
            label: 'Flowchart',
            icon: FiActivity,
            description: 'Process workflows and business logic'
        },
        {
            value: DIAGRAM_TYPES.ER_DIAGRAM,
            label: 'ER Diagram',
            icon: FiDatabase,
            description: 'Database relationships and entities'
        },
        {
            value: DIAGRAM_TYPES.UML_CLASS,
            label: 'UML Class',
            icon: FiBox,
            description: 'Object-oriented class structures'
        },
        {
            value: DIAGRAM_TYPES.NETWORK,
            label: 'Network',
            icon: FiGrid,
            description: 'IT infrastructure and network topology'
        },
        {
            value: DIAGRAM_TYPES.ORG_CHART,
            label: 'Organization',
            icon: FiUsers,
            description: 'Organizational hierarchy and reporting'
        },
        {
            value: DIAGRAM_TYPES.MIND_MAP,
            label: 'Mind Map',
            icon: FiTarget,
            description: 'Concept mapping and brainstorming'
        },
        {
            value: DIAGRAM_TYPES.SWIMLANE,
            label: 'Swimlane',
            icon: FiTrello,
            description: 'Cross-functional process flows'
        },
        {
            value: DIAGRAM_TYPES.GANTT,
            label: 'Gantt Chart',
            icon: FiCalendar,
            description: 'Project timelines and scheduling'
        }
    ];

    const getExamplesForDiagramType = (type) => {
        const examples = {
            [DIAGRAM_TYPES.FLOWCHART]: [
                { text: 'Create a user registration and login process', category: 'Authentication' },
                { text: 'Design an order fulfillment workflow', category: 'E-commerce' },
                { text: 'Model a customer support ticket system', category: 'Support' },
                { text: 'Create a software deployment pipeline', category: 'DevOps' },
                { text: 'Design a loan approval process with risk assessment', category: 'Finance' },
                { text: 'Create an emergency response protocol', category: 'Operations' }
            ],
            [DIAGRAM_TYPES.ER_DIAGRAM]: [
                { text: 'Design a comprehensive e-commerce database schema', category: 'E-commerce' },
                { text: 'Create a social media platform database structure', category: 'Social Media' },
                { text: 'Model a hospital management system database', category: 'Healthcare' },
                { text: 'Design a university course management system', category: 'Education' },
                { text: 'Create a banking system database with accounts and transactions', category: 'Finance' },
                { text: 'Model a project management system with tasks and resources', category: 'Project Management' }
            ],
            [DIAGRAM_TYPES.UML_CLASS]: [
                { text: 'Design a social media application class structure', category: 'Social Media' },
                { text: 'Model an e-commerce platform with products and orders', category: 'E-commerce' },
                { text: 'Create a game engine architecture', category: 'Gaming' },
                { text: 'Design a content management system', category: 'CMS' },
                { text: 'Model a banking application with accounts and transactions', category: 'Finance' },
                { text: 'Create a library management system class diagram', category: 'Education' }
            ],
            [DIAGRAM_TYPES.NETWORK]: [
                { text: 'Design a secure enterprise network with DMZ', category: 'Enterprise' },
                { text: 'Create a cloud-hybrid infrastructure setup', category: 'Cloud' },
                { text: 'Model a multi-site corporate network', category: 'Corporate' },
                { text: 'Design a data center network architecture', category: 'Data Center' },
                { text: 'Create a secure remote work network setup', category: 'Remote Work' },
                { text: 'Model an IoT device network infrastructure', category: 'IoT' }
            ],
            [DIAGRAM_TYPES.ORG_CHART]: [
                { text: 'Create a technology company organizational structure', category: 'Technology' },
                { text: 'Design a hospital department hierarchy', category: 'Healthcare' },
                { text: 'Model a university administrative structure', category: 'Education' },
                { text: 'Create a startup team organization chart', category: 'Startup' },
                { text: 'Design a government agency structure', category: 'Government' },
                { text: 'Model a retail chain management hierarchy', category: 'Retail' }
            ],
            [DIAGRAM_TYPES.MIND_MAP]: [
                { text: 'Create a product launch strategy mind map', category: 'Marketing' },
                { text: 'Design a learning path for web development', category: 'Education' },
                { text: 'Model business model canvas components', category: 'Business' },
                { text: 'Create a personal development plan', category: 'Personal' },
                { text: 'Design a project planning mind map', category: 'Project Management' },
                { text: 'Model innovation brainstorming concepts', category: 'Innovation' }
            ]
        };

        return examples[type] || examples[DIAGRAM_TYPES.FLOWCHART];
    };

    const selectedExamples = getExamplesForDiagramType(diagramType);
    const selectedDiagramType = diagramTypes.find(dt => dt.value === diagramType);

    return (
        <motion.div
            className="max-w-6xl mx-auto p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 transform -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full opacity-50 transform translate-y-24 -translate-x-24" />

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            <HiSparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-4xl font-bold text-gray-800 mb-3">
                            Generate Professional Diagrams
                        </h2>
                        <p className="text-xl text-gray-600">
                            Create flowcharts, ER diagrams, UML, network diagrams, and more with AI
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Diagram Type Selection */}
                        <div className="space-y-4">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                <HiTemplate className="w-4 h-4" />
                                <span>Diagram Type</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {diagramTypes.map(({ value, label, icon: Icon, description }) => (
                                    <motion.button
                                        key={value}
                                        type="button"
                                        onClick={() => setDiagramType(value)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${diagramType === value
                                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                            }`}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon className={`w-8 h-8 mx-auto mb-2 ${diagramType === value ? 'text-blue-500' : 'text-gray-500'
                                            }`} />
                                        <div className={`font-medium text-sm ${diagramType === value ? 'text-blue-700' : 'text-gray-700'
                                            }`}>
                                            {label}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {description}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Current Selection Display */}
                        {selectedDiagramType && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center space-x-3">
                                    <selectedDiagramType.icon className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <div className="font-semibold text-blue-700">
                                            Selected: {selectedDiagramType.label}
                                        </div>
                                        <div className="text-sm text-blue-600">
                                            {selectedDiagramType.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Process Description */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                <HiTemplate className="w-4 h-4" />
                                <span>Describe What You Want to Diagram</span>
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={`Describe the ${selectedDiagramType?.label.toLowerCase() || 'diagram'} you want to create...`}
                                rows={6}
                                required
                                disabled={loading}
                                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        {/* Style and Complexity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <HiSparkles className="w-4 h-4" />
                                    <span>Visual Style</span>
                                </label>
                                <select
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700"
                                >
                                    <option value="modern">Modern & Clean</option>
                                    <option value="colorful">Colorful & Vibrant</option>
                                    <option value="minimal">Minimal & Simple</option>
                                    <option value="enterprise">Enterprise & Professional</option>
                                    <option value="default">Default</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <HiCog className="w-4 h-4" />
                                    <span>Complexity Level</span>
                                </label>
                                <select
                                    value={complexity}
                                    onChange={(e) => setComplexity(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700"
                                >
                                    <option value="simple">Simple (15-30 elements)</option>
                                    <option value="medium">Medium (30-80 elements)</option>
                                    <option value="complex">Complex (80-200 elements)</option>
                                    <option value="enterprise">Enterprise (200+ elements)</option>
                                </select>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <motion.button
                            type="submit"
                            disabled={loading || !prompt.trim()}
                            className={`w-full py-5 px-8 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-3 ${loading || !prompt.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25'
                                }`}
                            whileHover={!loading && prompt.trim() ? { scale: 1.02, y: -2 } : {}}
                            whileTap={!loading && prompt.trim() ? { scale: 0.98 } : {}}
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span>Generating {selectedDiagramType?.label}...</span>
                                </>
                            ) : (
                                <>
                                    <HiPlay className="w-5 h-5" />
                                    <span>Generate {selectedDiagramType?.label}</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Examples Section */}
                    <div className="mt-12">
                        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700 mb-6">
                            <HiLightBulb className="w-5 h-5 text-yellow-500" />
                            <span>Try these {selectedDiagramType?.label.toLowerCase()} examples:</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedExamples.map((example, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setPrompt(example.text)}
                                    disabled={loading}
                                    className="p-4 text-left bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="text-xs font-medium text-blue-600 mb-1 group-hover:text-purple-600 transition-colors">
                                        {example.category}
                                    </div>
                                    <div className="text-sm text-gray-700 group-hover:text-gray-800 transition-colors">
                                        {example.text}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                            <FiActivity className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-blue-700 mb-2">Smart Generation</h3>
                            <p className="text-sm text-blue-600">AI creates comprehensive diagrams with proper relationships and styling</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                            <FiBox className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-purple-700 mb-2">Multiple Types</h3>
                            <p className="text-sm text-purple-600">Support for flowcharts, ER diagrams, UML, networks, and more</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                            <FiGrid className="w-8 h-8 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-green-700 mb-2">Professional Quality</h3>
                            <p className="text-sm text-green-600">Enterprise-grade diagrams ready for presentations and documentation</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DiagramPromptForm;
