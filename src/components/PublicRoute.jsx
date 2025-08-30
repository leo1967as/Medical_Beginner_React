import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/UserContext';

const PublicRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
                </div>
            </div>
        );
    }

    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;