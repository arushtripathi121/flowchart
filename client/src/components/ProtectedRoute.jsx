import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, bootstrapped } = useAuth();

    if (!bootstrapped) {
        return (
            <div className="w-full flex items-center justify-center py-24 text-gray-600">
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
