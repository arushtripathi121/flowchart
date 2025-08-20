import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiSparkles,
    HiTemplate,
    HiCog,
    HiPlay
} from 'react-icons/hi';

import { HiLightBulb } from "react-icons/hi2";
const PromptForm = ({ onSubmit, loading }) => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('modern');
    const [complexity, setComplexity] = useState('medium');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        onSubmit(prompt, style, complexity);
    };

    const examples = [
        {
            text: 'Create a user registration process flowchart',
            category: 'Authentication'
        },
        {
            text: 'Design a customer support ticket workflow',
            category: 'Support'
        },
        {
            text: 'Show an e-commerce checkout process',
            category: 'E-commerce'
        },
        {
            text: 'Create a software deployment pipeline',
            category: 'DevOps'
        },
        {
            text: 'Design a loan approval process',
            category: 'Finance'
        },
        {
            text: 'Create a data processing workflow',
            category: 'Analytics'
        }
    ];

    return (
        <motion.div
            className="max-w-5xl mx-auto p-6"
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
                            Generate Your Flowchart
                        </h2>
                        <p className="text-xl text-gray-600">
                            Describe your process and let AI create a beautiful flowchart
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                <HiTemplate className="w-4 h-4" />
                                <span>Process Description</span>
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the process you want to visualize..."
                                rows={5}
                                required
                                disabled={loading}
                                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <HiSparkles className="w-4 h-4" />
                                    <span>Style</span>
                                </label>
                                <select
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700"
                                >
                                    <option value="default">Default</option>
                                    <option value="modern">Modern</option>
                                    <option value="minimal">Minimal</option>
                                    <option value="colorful">Colorful</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <HiCog className="w-4 h-4" />
                                    <span>Complexity</span>
                                </label>
                                <select
                                    value={complexity}
                                    onChange={(e) => setComplexity(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700"
                                >
                                    <option value="simple">Simple</option>
                                    <option value="medium">Medium</option>
                                    <option value="complex">Complex</option>
                                </select>
                            </div>
                        </div>

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
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <HiPlay className="w-5 h-5" />
                                    <span>Generate Flowchart</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-10">
                        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700 mb-6">
                            < HiLightBulb className="w-5 h-5 text-yellow-500" />
                            <span>Try these examples:</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {examples.map((example, index) => (
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
                </div>
            </div>
        </motion.div>
    );
};

export default PromptForm;
