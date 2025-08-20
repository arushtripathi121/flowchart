import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome, HiLightningBolt, HiCollection } from 'react-icons/hi';
// import { GiFlowChart } from 'react-icons/gi';
import { FaChartLine } from "react-icons/fa";

const Navigation = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: HiHome },
        { path: '/generator', label: 'Generator', icon: HiLightningBolt },
        { path: '/gallery', label: 'Gallery', icon: HiCollection }
    ];

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <motion.div
                        className="flex items-center space-x-3 text-xl font-bold text-gray-800"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaChartLine className="text-2xl text-blue-600" />
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            FlowGen AI
                        </span>
                    </motion.div>

                    <div className="flex space-x-1">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative"
                                >
                                    <motion.div
                                        className={`px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium transition-all duration-300 ${location.pathname === item.path
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navigation;
