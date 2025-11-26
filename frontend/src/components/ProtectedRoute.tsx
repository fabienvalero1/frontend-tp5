import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
    rolesRequis: Array<'admin' | 'user' | 'guest'>;
    children: JSX.Element;
};

/**
 * Composant de route protégée par rôle.
 *
 * - Si l'utilisateur n'est pas authentifié => redirection vers /login
 * - Si l'utilisateur est authentifié mais n'a pas un des rôles requis => redirection vers /forbidden
 * - Sinon, on rend les enfants.
 */
export default function ProtectedRoute({ rolesRequis, children }: ProtectedRouteProps): JSX.Element {
    const { isAuthenticated, userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!userRole || !rolesRequis.includes(userRole)) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}


