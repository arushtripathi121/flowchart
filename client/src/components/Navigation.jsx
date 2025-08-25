import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome, HiLightningBolt, HiCollection } from 'react-icons/hi';
import { FaChartLine, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { path: '/home', label: 'Home', icon: HiHome },
        { path: '/generator', label: 'Generator', icon: HiLightningBolt },
        { path: '/gallery', label: 'Gallery', icon: HiCollection }
    ];

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <motion.nav
            className="top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg"
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

                    <div className="flex items-center space-x-4">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link key={path} to={path} className="relative">
                                <motion.div
                                    className={`px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium transition-all duration-300 ${location.pathname === path
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{label}</span>
                                </motion.div>
                            </Link>
                        ))}

                        {!user ? (
                            <Link
                                to="/"
                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                            >
                                Sign in
                            </Link>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg flex items-center space-x-2 hover:bg-gray-300 transition"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navigation;
