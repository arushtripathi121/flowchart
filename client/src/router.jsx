import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AppShell from "./shells/AppShell";
import SignInPage from "./pages/SignInPage";
import Home from "./pages/Home";
import Generator from "./pages/Generator";
import Gallery from "./pages/Gallery";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Wrapper to decide root route
const RootPage = () => {
    const { user, bootstrapped } = useAuth();

    if (!bootstrapped) {
        return <div>Loading...</div>; // spinner/loader
    }

    return user ? <Home /> : <SignInPage />;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootPage /> // ✅ dynamically choose
    },
    {
        path: "/",
        element: <AppShell />,
        children: [
            {
                path: "home",
                element: (
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                )
            },
            {
                path: "generator",
                element: (
                    <ProtectedRoute>
                        <Generator />
                    </ProtectedRoute>
                )
            },
            {
                path: "gallery",
                element: (
                    <ProtectedRoute>
                        <Gallery />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);

export default router;
