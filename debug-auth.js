// เพิ่มบรรทัดนี้ที่บนสุดของไฟล์
import 'dotenv/config'; 

// Debug script to test Firebase authentication
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// แก้ไขให้ Firebase configuration อ่านจาก process.env ที่โหลดโดย dotenv
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log("🔍 Debugging Firebase Authentication...");
console.log("📋 Configuration Check:");

// Check each configuration parameter
const configChecks = {
    apiKey: firebaseConfig.apiKey ? "✅ Set" : "❌ Missing",
    authDomain: firebaseConfig.authDomain ? "✅ Set" : "❌ Missing",
    projectId: firebaseConfig.projectId ? "✅ Set" : "❌ Missing",
    storageBucket: firebaseConfig.storageBucket ? "✅ Set" : "❌ Missing",
    messagingSenderId: firebaseConfig.messagingSenderId ? "✅ Set" : "❌ Missing",
    appId: firebaseConfig.appId ? "✅ Set" : "❌ Missing"
};

Object.entries(configChecks).forEach(([key, status]) => {
    console.log(`   ${key}: ${status}`);
});

// ตรวจสอบว่ามีค่า config ที่จำเป็นหรือไม่ก่อนดำเนินการต่อ
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
    console.error("\n❌ Fatal error: Missing required Firebase configuration in your .env file.");
    console.error("💡 Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_AUTH_DOMAIN are set.");
    process.exit(1); // ออกจากสคริปต์ถ้า config ไม่ครบ
}


try {
    // Initialize Firebase
    console.log("\n🚀 Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized successfully");

    // Get auth instance
    console.log("\n🔐 Getting auth instance...");
    const auth = getAuth(app);
    console.log("✅ Auth instance created successfully");

    // Test user creation with a test user
    console.log("\n🧪 Testing user creation...");
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "password123";
    const testDisplayName = "Test User";

    console.log("📝 Test credentials:");
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Display Name: ${testDisplayName}`);

    // Try to create user
    createUserWithEmailAndPassword(auth, testEmail, testPassword)
        .then((userCredential) => {
            console.log("✅ User created successfully!");
            console.log("👤 User UID:", userCredential.user.uid);
            console.log("📧 User Email:", userCredential.user.email);
            
            // Update display name
            return updateProfile(userCredential.user, { displayName: testDisplayName });
        })
        .then(() => {
            console.log("✅ Display name updated successfully!");
            console.log("👤 Display Name:", auth.currentUser.displayName);
        })
        .catch((error) => {
            console.error("❌ Error creating user:");
            console.error("   Error Code:", error.code);
            console.error("   Error Message:", error.message);
            
            // Provide more specific error information
            switch (error.code) {
                case "auth/email-already-in-use":
                    console.error("💡 This email is already registered");
                    break;
                case "auth/invalid-email":
                    console.error("💡 Invalid email format");
                    break;
                case "auth/operation-not-allowed":
                    console.error("💡 Email/password sign-in is not enabled");
                    break;
                case "auth/weak-password":
                    console.error("💡 Password is too weak (minimum 6 characters)");
                    break;
                case "auth/configuration-not-found":
                    console.error("💡 Firebase configuration not found");
                    break;
                default:
                    console.error("💡 Unknown error occurred");
            }
        });

} catch (error) {
    console.error("❌ Fatal error:");
    console.error("   Error Code:", error.code);
    console.error("   Error Message:", error.message);
    
    if (error.code === "auth/configuration-not-found") {
        console.error("\n💡 Troubleshooting steps:");
        console.error("   1. Check if Firebase app is properly initialized");
        console.error("   2. Verify API key is correct");
        console.error("   3. Check if authDomain matches your Firebase project");
        console.error("   4. Ensure Firebase project is enabled");
    }
}