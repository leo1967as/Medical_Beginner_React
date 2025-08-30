# Firebase Authentication System Guide

## Overview
This guide explains the Firebase authentication system implemented in the Medical Diagnosis Portal. The system provides secure user authentication and ensures that each user can only access their own patient data.

## Architecture

### Frontend Components
1. **UserContext** (`src/context/UserContext.jsx`)
   - Manages authentication state
   - Handles user registration, login, and logout
   - Provides user information to components

2. **Login Component** (`src/components/Login.jsx`)
   - Handles user login and registration forms
   - Shows loading states and error messages
   - Includes form validation

3. **AuthGuard Component** (`src/components/AuthGuard.jsx`)
   - Protects routes that require authentication
   - Redirects unauthenticated users to login page
   - Shows loading spinner during authentication checks

4. **UserProfile Component** (`src/components/UserProfile.jsx`)
   - Displays current user information
   - Provides logout functionality
   - Shows user-specific statistics

### Backend Components
1. **Authentication Middleware** (`backend/server.js`)
   - Verifies Firebase ID tokens
   - Protects API endpoints
   - Adds user information to request objects

2. **Firebase Admin SDK**
   - Handles server-side authentication
   - Manages user accounts
   - Verifies tokens

### Database Structure
- **Patients Collection**: Each patient document includes a `userId` field to link to the user who created them
- **User Access**: Users can only access patients they created or have explicit access to

## Security Features

### 1. Firebase Authentication
- Email/password authentication
- JWT token-based sessions
- Secure password storage

### 2. Firestore Security Rules
- User-based access control
- Data isolation between users
- Read/write permissions based on ownership

### 3. API Protection
- Bearer token authentication
- Server-side token verification
- User context in all API requests

## Setup Instructions

### 1. Firebase Configuration
1. Go to Firebase Console (https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication:
   - Email/Password provider
   - Set up allowed domains
4. Create Firestore Database:
   - Start in test mode
   - Set up security rules

### 2. Environment Variables
Create `.env` file in the root directory:
```env
# Frontend Environment Variables
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend Environment Variables
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_client_cert_url
```

### 3. Service Account Setup
1. In Firebase Console, go to Project Settings
2. Go to Service Accounts tab
3. Generate new private key
4. Add the key to your backend environment variables

## Testing Procedures

### 1. Authentication Flow Testing
1. Start the test server:
   ```bash
   cd backend
   node testAuth.js
   ```

2. Create test users:
   ```bash
   curl -X POST http://localhost:3002/api/test/create-user \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123", "displayName": "Test User"}'
   ```

3. Test authentication:
   ```bash
   # First, get an ID token from the frontend login
   # Then use it in the request:
   curl -X GET http://localhost:3002/api/test/auth \
     -H "Authorization: Bearer YOUR_ID_TOKEN"
   ```

### 2. Data Access Testing
1. Log in with different user accounts
2. Verify that each user only sees their own patients
3. Test that users cannot access other users' data
4. Verify that unauthenticated users are redirected to login

### 3. Security Testing
1. Test API endpoints without authentication tokens
2. Verify that unauthorized requests are rejected
3. Test data isolation between users
4. Verify that security rules are enforced

## Migration Guide

### For Existing Patients
If you have existing patient data without user IDs, use the migration script:

1. Set up admin credentials in `backend/.env`:
   ```env
   ADMIN_EMAIL=admin@medicalportal.com
   ADMIN_PASSWORD=admin123
   ```

2. Run the migration script:
   ```bash
   cd backend
   node migratePatients.js
   ```

3. The script will add a default user ID to all existing patients

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check Firebase configuration
   - Verify API keys are correct
   - Ensure authDomain is properly set

2. **Token Verification Errors**
   - Check Firebase Admin SDK configuration
   - Verify service account credentials
   - Ensure token is not expired

3. **Data Access Issues**
   - Check Firestore security rules
   - Verify patient documents have userId field
   - Ensure user context is properly set

### Debug Mode
Enable debug logging by setting environment variables:
```env
DEBUG=firebase:*
DEBUG=auth:*
```

## Best Practices

1. **Security**
   - Use strong passwords
   - Enable email verification
   - Set up password reset
   - Monitor authentication logs

2. **Performance**
   - Cache user sessions
   - Use Firebase SDK efficiently
   - Optimize database queries

3. **User Experience**
   - Provide clear error messages
   - Show loading states
   - Implement password strength indicators
   - Add password reset functionality

## Future Enhancements

1. **Multi-factor Authentication**
2. **Social Login (Google, Facebook)**
3. **Role-based Access Control**
4. **Session Management**
5. **Audit Logging**
6. **Password Expiration Policies**

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Check browser console for errors
4. Verify network requests in browser dev tools

## API Reference

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Protected API Endpoints
- `GET /api/patients` - Get user's patients
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/export` - Export patient data
- `POST /api/assess` - AI assessment

All protected endpoints require a valid Bearer token in the Authorization header.