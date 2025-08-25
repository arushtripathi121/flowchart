import { createContext, useContext, useEffect, useState } from 'react';
import { refreshAuth, logout } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [bootstrapped, setBootstrapped] = useState(false);

    // Run on every refresh to validate session
    useEffect(() => {
        refreshAuth()
            .then((res) => setUser(res?.data?.user || null))
            .catch(() => setUser(null))
            .finally(() => setBootstrapped(true));
    }, []);

    const signOut = async () => {
        try {
            await logout();
        } finally {
            setUser(null);
            localStorage.removeItem('user-info');
        }
    };

    const value = { user, setUser, signOut, bootstrapped };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
