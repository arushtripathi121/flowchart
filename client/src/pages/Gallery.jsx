import { motion } from 'framer-motion';
import { useFlowchart } from '../hooks/useFlowchart';
import { Link } from 'react-router-dom';
import {
    HiCollection,
    HiEye,
    HiCalendar,
    HiPlus,
    HiViewGrid
} from 'react-icons/hi';
import { FiLayers, FiLink } from 'react-icons/fi';

const Gallery = () => {
    const { history, loadFromHistory } = useFlowchart();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <HiCollection className="w-10 h-10 text-white" />
                    </motion.div>

                    <h1 className="text-5xl font-bold text-gray-800 mb-4">
                        Flowchart Gallery
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your recently generated flowcharts are stored here for easy access and reuse
                    </p>
                </motion.div>

                {history.length === 0 ? (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="bg-white rounded-3xl shadow-2xl p-16 max-w-lg mx-auto border border-gray-100">
                            <motion.div
                                className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-blue-100 rounded-2xl flex items-center justify-center"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <HiViewGrid className="w-12 h-12 text-gray-400" />
                            </motion.div>

                            <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                No flowcharts yet
                            </h3>
                            <p className="text-gray-600 mb-10 leading-relaxed">
                                Create your first flowchart to see it appear here. All your generated flowcharts will be saved automatically.
                            </p>
                            <Link to="/generator">
                                <motion.button
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 mx-auto"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <HiPlus className="w-5 h-5" />
                                    <span>Create Flowchart</span>
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        {history.map((flowchart, index) => (
                            <motion.div
                                key={flowchart.id}
                                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-500"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                onClick={() => loadFromHistory(flowchart)}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <h4 className="text-xl font-bold text-gray-800 line-clamp-2 flex-1 leading-tight">
                                            {flowchart.prompt.slice(0, 80)}
                                            {flowchart.prompt.length > 80 && '...'}
                                        </h4>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <HiCalendar className="w-4 h-4 mr-2" />
                                        <span>{new Date(flowchart.timestamp).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 rounded-full">
                                                <FiLayers className="w-4 h-4 text-blue-600" />
                                                <span className="text-blue-700 font-medium">{flowchart.metadata.nodeCount}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 px-3 py-1 bg-purple-50 rounded-full">
                                                <FiLink className="w-4 h-4 text-purple-600" />
                                                <span className="text-purple-700 font-medium">{flowchart.metadata.edgeCount}</span>
                                            </div>
                                        </div>
                                        <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                                            {flowchart.metadata.style}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 group-hover:from-blue-100 group-hover:via-purple-100 group-hover:to-pink-100 transition-all duration-500">
                                    <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                                        <HiEye className="w-5 h-5 mr-2" />
                                        <span>Click to view</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
