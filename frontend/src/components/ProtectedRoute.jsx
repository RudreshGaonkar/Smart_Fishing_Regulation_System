import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Rediect to their correct dashboard if they try to access another role's dash
        return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
    }

    return children;
};

export default ProtectedRoute;
