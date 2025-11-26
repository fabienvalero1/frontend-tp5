// src/App.tsx
import React, { JSX } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Tableau from './components/Tableau';
import ThemeToggle from './components/ThemeToggle';
import PageConnexion from './components/PageConnexion';
import PageForbidden from './components/PageForbidden';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

export default function App(): JSX.Element {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: 16 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h1 style={{ margin: 0 }}>Mon application</h1>
                <div style={{ display: 'flex', gap: 16 }}>
                    <ThemeToggle />
                    {isAuthenticated && (
                        <button onClick={handleLogout} style={{ marginLeft: 8 }}>Déconnexion</button>
                    )}
                </div>
            </header>

            <Routes>
                {/* Redirection de la racine vers /login pour respecter la convention */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Page de connexion */}
                <Route path="/login" element={<PageConnexion />} />

                {/* Route protégée par rôle (exemple : admin ou user peuvent voir /users) */}
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute rolesRequis={['admin', 'user']}>
                            <Tableau />
                        </ProtectedRoute>
                    }
                />

                {/* Page interdite */}
                <Route path="/forbidden" element={<PageForbidden />} />
            </Routes>
        </div>
    );
}