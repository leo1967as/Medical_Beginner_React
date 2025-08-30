// Firebase Authentication Service
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "../config/firebase";

// Authentication service functions
export const authService = {
    // Create new user with email and password
    register: async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with display name
        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
        }
        
        return userCredential.user;
    },

    // Login user with email and password
    login: async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    // Logout current user
    logout: async () => {
        await signOut(auth);
        return true;
    },

    // Get current authenticated user
    getCurrentUser: () => {
        return auth.currentUser;
    },

    // Listen to auth state changes
    onAuthStateChanged: (callback) => {
        return onAuthStateChanged(auth, callback);
    },

    // Get auth instance
    getAuth: () => auth
};

export default authService;