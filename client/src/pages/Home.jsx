import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FaBrain,
    FaRocket,
    FaPalette,
    FaMobile,
    FaChartLine,
    FaArrowRight
} from 'react-icons/fa';
import { HiLightningBolt } from 'react-icons/hi';

const Home = () => {
    const features = [
        {
            icon: FaBrain,
            title: 'AI-Powered',
            description: 'Advanced AI generates flowcharts from natural language',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: HiLightningBolt,
            title: 'Instant Results',
            description: 'Get professional flowcharts in seconds',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            icon: FaPalette,
            title: 'Beautiful Design',
            description: 'Multiple styles and customization options',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: FaMobile,
            title: 'Interactive',
            description: 'Zoom, pan, and edit your generated flowcharts',
            color: 'from-green-500 to-emerald-500'
        }
    ];

    return (
        <div className="min-h-screen">
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h1
                            className="text-5xl md:text-7xl font-bold text-gray-800 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            Create Beautiful Flowcharts with
                            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                AI Magic
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            Transform your ideas into professional flowcharts instantly.
                            Just describe your process and watch AI create stunning visualizations.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <Link to="/generator">
                                <motion.button
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaRocket className="text-lg" />
                                    <span>Start Creating</span>
                                </motion.button>
                            </Link>

                            <Link to="/gallery">
                                <motion.button
                                    className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center space-x-2"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaChartLine className="text-lg" />
                                    <span>View Examples</span>
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    className="relative group"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                >
                                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full relative overflow-hidden">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

                                        <div className="relative z-10">
                                            <div className="text-4xl mb-4 text-gray-700">
                                                <IconComponent />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-20">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                            Ready to visualize your ideas?
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Join thousands of users creating amazing flowcharts with AI
                        </p>
                        <Link to="/generator">
                            <motion.button
                                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Get Started Now</span>
                                <FaArrowRight className="text-sm" />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
