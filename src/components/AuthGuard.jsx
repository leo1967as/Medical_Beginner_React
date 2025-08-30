import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/UserContext';

const AuthGuard = ({ children }) => {
    const { currentUser, loading } = useAuth();
    
    // Add dependency to force re-render when currentUser changes
    useEffect(() => {
        // This effect doesn't do anything but forces re-render when currentUser changes
    }, [currentUser]);

    // Log authentication state
    console.log('[AuthGuard] Checking auth state:', {
        loading,
        currentUser: currentUser ? currentUser.email : null
    });

    // Show loading spinner while checking auth state
    if (loading) {
        console.log('[AuthGuard] Loading state: true');
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!currentUser) {
        console.log('[AuthGuard] No user found. Redirecting to /login.');
        return <Navigate to="/login" replace />;
    }

    // Render children if authenticated
    console.log('[AuthGuard] User found. Rendering protected content.');
    return children;
};

export default AuthGuard;