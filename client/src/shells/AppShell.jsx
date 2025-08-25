import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';

const AppShell = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navigation />
            <motion.main
                className="pt-20 min-h-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Outlet />
            </motion.main>
        </div>
    );
};

export default AppShell;
