import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const UserContext = createContext();

export const useAuth = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((user) => {
            console.log('[Auth State Change] User:', user ? { uid: user.uid, email: user.email } : null);
            setCurrentUser(user);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Register new user
    const register = async (email, password, displayName) => {
        setError(null);
        // เพิ่มการตรวจสอบรหัสผ่านสั้นไปที่ฝั่ง Client ก่อนส่ง
        if (password.length < 6) {
            throw new Error("auth/weak-password");
        }
        
        try {
            await authService.register(email, password, displayName);
            // The onAuthStateChanged listener will handle updating the currentUser state
            // No need to manually set it here
        } catch (error) {
            // แปลง error code เป็นข้อความภาษาไทยที่เข้าใจง่าย
            let friendlyMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
            switch (error.code) {
                case "auth/weak-password":
                    friendlyMessage = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
                    break;
                case "auth/email-already-in-use":
                    friendlyMessage = "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น";
                    break;
                case "auth/invalid-email":
                    friendlyMessage = "รูปแบบอีเมลไม่ถูกต้อง";
                    break;
                default:
                    friendlyMessage = error.message;
            }
            setError(friendlyMessage);
            throw error;
        }
    };

    // Login user
    const login = async (email, password) => {
        setError(null);
        try {
            await authService.login(email, password);
            // The onAuthStateChanged listener will handle updating the currentUser state
            // No need to manually set it here
        } catch (error) {
            // แปลง error code เป็นข้อความภาษาไทยที่เข้าใจง่าย
            let friendlyMessage = "เกิดข้อผิดพลาดที่ไม่รู้จัก";
            switch (error.code) {
                case "auth/invalid-credential": // Actual Firebase error code
                case "auth/wrong-password":
                case "auth/user-not-found":
                    friendlyMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
                    break;
                case "auth/invalid-email":
                    friendlyMessage = "รูปแบบอีเมลไม่ถูกต้อง";
                    break;
                case "auth/user-disabled":
                    friendlyMessage = "บัญชีผู้ใช้นี้ถูกระงับการใช้งาน";
                    break;
                case "auth/too-many-requests":
                    friendlyMessage = "มีการพยายามเข้าสู่ระบบผิดพลาดมากเกินไป กรุณาลองใหม่ในภายหลัง";
                    break;
                default:
                    friendlyMessage = error.message;
            }
            setError(friendlyMessage);
            throw error;
        }
    };

    // Logout user
    const logout = async () => {
        setError(null);
        try {
            await authService.logout();
            // The onAuthStateChanged listener will handle updating the currentUser state
            // No need to manually set it here
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    // Get current user ID
    const getCurrentUserId = () => {
        return currentUser ? currentUser.uid : null;
    };

    // Get current user email
    const getCurrentUserEmail = () => {
        return currentUser ? currentUser.email : null;
    };

    // Get current user display name
    const getCurrentUserName = () => {
        return currentUser ? currentUser.displayName : null;
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return currentUser !== null;
    };

    // Check if user is admin (you can implement admin logic here)
    const isAdmin = () => {
        // For now, we'll consider all authenticated users as regular users
        // You can implement admin logic based on user claims or custom claims
        return false;
    };

    const value = {
        currentUser,
        loading,
        error,
        register,
        login,
        logout,
        getCurrentUserId,
        getCurrentUserEmail,
        getCurrentUserName,
        isAuthenticated,
        isAdmin,
        clearError: () => setError(null)
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};