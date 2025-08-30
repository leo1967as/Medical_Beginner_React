# Firebase Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. "Firebase: Error (auth/configuration-not-found)"

**Problem**: Firebase authentication is not properly configured.

**Solutions**:
1. **Check Firebase Configuration**:
   - Verify all Firebase environment variables are set in `.env` file
   - Ensure API key is correct and not expired
   - Check that authDomain matches your Firebase project

2. **Verify Firebase Initialization**:
   ```javascript
   // Check if Firebase app is properly initialized
   import { getApp } from "firebase/app";
   try {
       const app = getApp();
       console.log("Firebase app already initialized");
   } catch (error) {
       console.log("Firebase app not initialized yet");
   }
   ```

3. **Test Configuration**:
   ```bash
   node test-auth.js
   ```

### 2. "400 Bad Request" on Login/Register

**Problem**: Invalid request parameters or missing required fields.

**Solutions**:
1. **Check Email Format**: Ensure email is properly formatted
2. **Password Requirements**: 
   - Minimum 6 characters
   - No special characters that might cause issues
3. **Form Validation**: Check all required fields are filled

### 3. React Warning: "Uncontrolled Input"

**Problem**: Input element changing from uncontrolled to controlled.

**Solutions**:
1. **Initialize State Properly**:
   ```javascript
   const [formData, setFormData] = useState({
       email: '',
       password: '',
       displayName: ''
   });
   ```

2. **Use Conditional Values**:
   ```javascript
   value={formData.email || ''}
   ```

### 4. Authentication Not Working in Development

**Problem**: Authentication works in some environments but not others.

**Solutions**:
1. **Check CORS Settings**: Ensure your development server allows requests to Firebase
2. **Environment Variables**: Verify `.env` file is properly loaded
3. **Browser Cache**: Clear browser cache and cookies

### 5. User Data Not Loading

**Problem**: Patients are not loading after authentication.

**Solutions**:
1. **Check User Context**: Verify `currentUser` is properly set
2. **Firestore Security Rules**: Ensure rules allow reading patient data
3. **Patient Filtering**: Confirm `userId` is being passed to `fetchPatients`

### 6. Each User Can See Other Users' Data

**Problem**: Data isolation is not working properly.

**Solutions**:
1. **Verify Patient Structure**: Ensure all patients have `userId` field
2. **Check Firestore Rules**: Verify security rules enforce user isolation
3. **Backend API**: Ensure backend endpoints check user permissions

## Step-by-Step Debugging

### Step 1: Verify Firebase Configuration
```javascript
// Add this to your main.jsx or App.jsx
import { getAuth } from "firebase/auth";
import { auth } from "./config/firebase";

console.log("Firebase Auth Status:", {
    currentUser: auth.currentUser,
    config: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Missing",
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "Set" : "Missing"
    }
});
```

### Step 2: Test Authentication Flow
```javascript
// Test individual authentication functions
import { authService } from "./services/authService";

// Test login
authService.login("test@example.com", "password123")
    .then(result => console.log("Login result:", result))
    .catch(error => console.error("Login error:", error));

// Test registration
authService.register("newuser@example.com", "password123", "Test User")
    .then(result => console.log("Registration result:", result))
    .catch(error => console.error("Registration error:", error));
```

### Step 3: Check User Context
```javascript
// In your component
const { currentUser, loading } = useAuth();

console.log("User Context:", {
    currentUser,
    loading,
    uid: currentUser?.uid,
    email: currentUser?.email
});
```

### Step 4: Verify Patient Data Loading
```javascript
// In your PatientContext
const { patients, loading, error } = usePatients();

console.log("Patient Data:", {
    patientsCount: patients.length,
    loading,
    error,
    firstPatient: patients[0]
});
```

## Environment Variables Setup

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Backend (.env)
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Firebase Console Checklist

1. **Project Settings**:
   - ✅ API key is enabled
   - ✅ Auth domain is whitelisted
   - ✅ App is registered

2. **Authentication Section**:
   - ✅ Email/Password provider is enabled
   - ✅ Sign-in method is configured
   - ✅ Authorized domains include your development URL

3. **Firestore Database**:
   - ✅ Database is created
   - ✅ Security rules are deployed
   - ✅ Indexes are created for queries

## Testing Procedures

### 1. Unit Testing Authentication
```javascript
// Test authentication service
describe('Authentication Service', () => {
    test('should register user successfully', async () => {
        const result = await authService.register('test@example.com', 'password123', 'Test User');
        expect(result.user).toBeDefined();
        expect(result.error).toBeNull();
    });
});
```

### 2. Integration Testing
```javascript
// Test complete authentication flow
describe('Authentication Flow', () => {
    test('should register, login, and access patient data', async () => {
        // Register user
        const registerResult = await authService.register('test@example.com', 'password123', 'Test User');
        expect(registerResult.user).toBeDefined();
        
        // Login user
        const loginResult = await authService.login('test@example.com', 'password123');
        expect(loginResult.user).toBeDefined();
        
        // Access patient data
        const patients = await fetchPatients(loginResult.user.uid);
        expect(Array.isArray(patients)).toBe(true);
    });
});
```

## Performance Optimization

### 1. Firebase SDK Loading
```javascript
// Lazy load Firebase SDK
const loadFirebase = async () => {
    if (typeof window !== 'undefined') {
        const { initializeApp } = await import('firebase/app');
        const { getAuth } = await import('firebase/auth');
        // Initialize Firebase
    }
};
```

### 2. Authentication State Persistence
```javascript
// Enable persistence
import { browserLocalPersistence } from "firebase/auth";

// In your auth service initialization
const auth = getAuth();
auth.setPersistence(browserLocalPersistence);
```

## Security Best Practices

### 1. Environment Variables
- Never commit API keys to version control
- Use environment-specific configurations
- Rotate API keys regularly

### 2. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /patients/{patientId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Input Validation
```javascript
// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password strength
const isStrongPassword = (password) => {
    return password.length >= 6;
};
```

## Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `auth/user-not-found` | User does not exist | Check email or register new user |
| `auth/wrong-password` | Incorrect password | Verify password or reset |
| `auth/email-already-in-use` | Email already registered | Use different email or login |
| `auth/weak-password` | Password too weak | Use stronger password |
| `auth/invalid-email` | Invalid email format | Check email format |
| `auth/configuration-not-found` | Firebase not configured | Check environment variables |

## Getting Help

1. **Firebase Console**: Check error logs and analytics
2. **Browser DevTools**: Network tab for API calls
3. **React DevTools**: Component state inspection
4. **Console Logs**: Check for error messages

## Next Steps

If you continue to experience issues:

1. **Check Firebase Documentation**: [Firebase Auth Docs](https://firebase.google.com/docs/auth)
2. **Review React-Firebase Integration**: Ensure proper component lifecycle
3. **Test in Different Browsers**: Rule out browser-specific issues
4. **Create Minimal Reproducer**: Isolate the specific issue

Remember to test each fix incrementally and verify the changes work as expected before moving to the next step.