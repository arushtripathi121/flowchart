import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FaBrain,
    FaPalette,
    FaMobile,
    FaArrowRight,
    FaCube,
    FaStar,
    FaChartLine
} from 'react-icons/fa';
import { HiLightningBolt } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

    // Enhanced features with commonly available icons
    const features = [
        {
            icon: FaBrain,
            title: 'AI-Powered',
            description: 'Advanced neural networks generate professional flowcharts from natural language in seconds',
            color: 'from-blue-500 via-indigo-500 to-purple-500',
            gradient: 'group-hover:from-blue-400 group-hover:via-indigo-400 group-hover:to-purple-400'
        },
        {
            icon: HiLightningBolt,
            title: 'Instant Results',
            description: 'Real-time generation with zero waiting time. Watch your ideas come to life instantly',
            color: 'from-amber-400 via-orange-500 to-red-500',
            gradient: 'group-hover:from-amber-300 group-hover:via-orange-400 group-hover:to-red-400'
        },
        {
            icon: FaCube,
            title: '3D Interactive',
            description: 'Immersive 3D flowchart visualization with depth and spatial navigation',
            color: 'from-emerald-400 via-teal-500 to-cyan-500',
            gradient: 'group-hover:from-emerald-300 group-hover:via-teal-400 group-hover:to-cyan-400'
        },
        {
            icon: FaStar,
            title: 'Smart Adaptive',
            description: 'Interface learns from your patterns and suggests optimized workflows',
            color: 'from-pink-400 via-purple-500 to-indigo-500',
            gradient: 'group-hover:from-pink-300 group-hover:via-purple-400 group-hover:to-indigo-400'
        }
    ];

    // Floating particles animation
    const particleVariants = {
        animate: {
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            <section className="px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
                <div className="max-w-7xl mx-auto">

                    {/* Hero Section with Progressive Typography */}
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <motion.div
                            className="relative inline-block mb-8"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none">
                                <motion.span
                                    className="block text-slate-800"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                >
                                    Create
                                </motion.span>
                                <motion.span
                                    className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                >
                                    Visualize
                                </motion.span>
                                <motion.span
                                    className="block text-slate-700 mt-2"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.8 }}
                                >
                                    Innovate
                                </motion.span>
                            </h1>

                            {/* Floating particles around title */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                    }}
                                    variants={particleVariants}
                                    animate="animate"
                                    transition={{ delay: i * 0.2 }}
                                />
                            ))}
                        </motion.div>

                        <motion.p
                            className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.8 }}
                        >
                            Transform your ideas into beautiful, professional flowcharts using
                            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI-powered technology</span> ✨
                        </motion.p>
                    </motion.div>

                    {/* User Profile Card - Modern Bento Style */}
                    {user && (
                        <motion.div
                            className="relative mb-20"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <div className="max-w-md mx-auto">
                                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 overflow-hidden">
                                    {/* Animated background gradient */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"
                                        animate={{
                                            background: [
                                                'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05))',
                                                'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
                                                'linear-gradient(225deg, rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05), rgba(59, 130, 246, 0.05))'
                                            ]
                                        }}
                                        transition={{ duration: 8, repeat: Infinity }}
                                    />

                                    <div className="relative z-10 text-center">
                                        <motion.div
                                            className="relative inline-block mb-6"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <img
                                                src={user.image || user.picture}
                                                alt="User"
                                                className="w-24 h-24 rounded-2xl mx-auto object-cover shadow-lg border-3 border-white"
                                            />
                                            <motion.div
                                                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white"
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </motion.div>

                                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{user.name}</h3>
                                        <p className="text-slate-600 mb-4">{user.email}</p>

                                        <motion.div
                                            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full text-sm font-medium text-slate-700"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <FaStar className="text-yellow-500" />
                                            <span>Pro Creator</span>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Features Grid - Bento Box Layout */}
                    <motion.div
                        className="mb-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => {
                                const IconComponent = feature.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        className="group relative h-72"
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.8 + index * 0.1,
                                            duration: 0.8,
                                            type: "spring",
                                            stiffness: 100
                                        }}
                                        whileHover={{ y: -10, scale: 1.02 }}
                                    >
                                        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 h-full overflow-hidden">
                                            {/* Animated gradient background */}
                                            <motion.div
                                                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-all duration-500`}
                                            />

                                            {/* Glowing border effect */}
                                            <motion.div
                                                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}
                                                style={{ transform: 'scale(1.05)' }}
                                            />

                                            <div className="relative z-10 h-full flex flex-col">
                                                <motion.div
                                                    className="mb-6"
                                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                                                        <IconComponent className="text-3xl" />
                                                    </div>
                                                </motion.div>

                                                <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors">
                                                    {feature.title}
                                                </h3>

                                                <p className="text-slate-600 leading-relaxed flex-grow group-hover:text-slate-700 transition-colors">
                                                    {feature.description}
                                                </p>

                                                {/* Hover indicator */}
                                                <motion.div
                                                    className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    initial={{ x: -20 }}
                                                    whileHover={{ x: 0 }}
                                                >
                                                    <div className="flex items-center text-sm font-medium text-slate-700">
                                                        <span>Explore</span>
                                                        <FaArrowRight className="ml-2 text-xs" />
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* CTA Section with 3D Elements */}
                    <motion.section
                        className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl overflow-hidden shadow-2xl"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        {/* Animated background pattern */}
                        <div className="absolute inset-0">
                            <motion.div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 70%), 
                                                     radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.3) 0%, transparent 70%)`
                                }}
                                animate={{
                                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                                }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />
                        </div>

                        <div className="relative z-10 px-8 py-16 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                {/* 3D Icon */}
                                <motion.div
                                    className="mb-8 inline-flex"
                                    animate={{
                                        rotateY: [0, 360],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                                        <FaChartLine className="text-5xl text-white" />
                                    </div>
                                </motion.div>

                                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                                    Ready to create
                                    <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        something amazing?
                                    </span>
                                </h2>

                                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                                    Join thousands of creators who are already transforming their ideas into stunning visual workflows
                                </p>

                                <Link to="/generator">
                                    <motion.button
                                        className="group relative px-12 py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-2xl overflow-hidden"
                                        whileHover={{
                                            scale: 1.05,
                                            y: -5,
                                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        {/* Button shine effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                        />

                                        <span className="relative flex items-center justify-center space-x-3">
                                            <span>Launch Generator</span>
                                            <motion.div
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <FaArrowRight />
                                            </motion.div>
                                        </span>
                                    </motion.button>
                                </Link>

                                {/* Stats or social proof */}
                                <motion.div
                                    className="mt-12 flex flex-wrap justify-center gap-8 text-slate-400"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">50k+</div>
                                        <div className="text-sm">Flowcharts Created</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">99.9%</div>
                                        <div className="text-sm">Uptime</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">⚡ 2.3s</div>
                                        <div className="text-sm">Avg Generation</div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.section>
                </div>
            </section>
        </div>
    );
};

export default Home;
