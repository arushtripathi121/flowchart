import { createContext, useContext, useEffect, useState } from "react";
import { refreshAuth, logout } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [bootstrapped, setBootstrapped] = useState(false);

    // Validate session on page load / refresh
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await refreshAuth(); // returns { user: {...} }
                setUser(res?.user || null); // ✅ correct path
            } catch {
                setUser(null);
            } finally {
                setBootstrapped(true);
            }
        };

        checkAuth();
    }, []);

    const signOut = async () => {
        try {
            await logout();
        } finally {
            setUser(null);
            localStorage.removeItem("user-info");
        }
    };

    const value = { user, setUser, signOut, bootstrapped };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
