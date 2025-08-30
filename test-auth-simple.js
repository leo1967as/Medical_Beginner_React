// Simple test to verify Firebase authentication is working
// This script tests the authentication service directly

// Import the authentication service
import { authService } from './src/services/authService.js';

console.log("🔍 Testing Firebase Authentication Service...");
console.log("📋 Testing authentication service functions:");

// Test if authService has the required functions
const requiredFunctions = ['register', 'login', 'logout', 'getCurrentUser', 'onAuthStateChanged'];

requiredFunctions.forEach(func => {
    if (typeof authService[func] === 'function') {
        console.log(`✅ ${func}: Available`);
    } else {
        console.log(`❌ ${func}: Missing`);
    }
});

// Test if auth instance is available
try {
    const auth = authService.getAuth();
    if (auth) {
        console.log("✅ Auth instance: Available");
        console.log("📝 Auth current user:", auth.currentUser);
    } else {
        console.log("❌ Auth instance: Not available");
    }
} catch (error) {
    console.log("❌ Auth instance error:", error.message);
}

console.log("\n🎯 Test completed. If all functions are available, authentication service is properly configured.");
console.log("💡 Note: This test only checks if the service is properly imported and functions exist.");
console.log("💡 Actual authentication testing requires user interaction in the browser.");