import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppShell from './shells/AppShell';
import SignInPage from './pages/SignInPage';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Gallery from './pages/Gallery';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: <SignInPage />
    },
    {
        path: '/',
        element: <AppShell />,
        children: [
            {
                path: '/home',
                element: (
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                )
            },
            {
                path: '/generator',
                element: (
                    <ProtectedRoute>
                        <Generator />
                    </ProtectedRoute>
                )
            },
            {
                path: '/gallery',
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
