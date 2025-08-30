# AI Clinical Portal - React + Vite Conversion

A modern React + Vite application for AI-powered medical diagnosis and patient management.

## Features

- **Patient Management**: Create, edit, and manage patient profiles
- **AI Diagnosis**: Get AI-powered medical assessments based on patient symptoms and health data
- **Consultation History**: Track and manage patient consultation history
- **Real-time Analysis**: Analyze past consultations with AI
- **Feedback System**: Provide feedback on AI analysis accuracy
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** with Hooks
- **Vite** for fast development and building
- **Firebase** for data persistence
- **Context API** for state management
- **CSS Custom Properties** for theming
- **Sarabun Font** for Thai typography

### Backend
- **Node.js** with Express
- **Google Gemini AI** for medical analysis
- **OpenRouter API** as primary AI service
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Project Structure

```
ai-clinical-portal/
├── backend/                 # Node.js backend server
│   ├── server.js           # Main server file
│   ├── diagnosisService.js # AI diagnosis logic
│   ├── .env               # Backend environment variables
│   └── package.json       # Backend dependencies
├── src/                    # React frontend source
│   ├── components/         # React components
│   │   ├── PatientSidebar.jsx
│   │   ├── PatientView.jsx
│   │   ├── PatientProfile.jsx
│   │   ├── AssessmentForm.jsx
│   │   ├── ConsultationHistory.jsx
│   │   ├── WelcomeScreen.jsx
│   │   └── PatientModal.jsx
│   ├── context/           # React Context
│   │   └── PatientContext.jsx
│   ├── services/          # API and Firebase services
│   │   ├── apiService.js
│   │   └── firebaseService.js
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── .env                   # Frontend environment variables
├── package.json           # Project dependencies
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-clinical-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   **Backend (.env in backend/ directory):**
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=google/gemini-pro
   ```

   **Frontend (.env in root directory):**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```

4. **Start the development servers**

   Start both frontend and backend concurrently:
   ```bash
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Frontend (port 5173)
   npm run dev:frontend
   
   # Backend (port 3001)
   npm run dev:backend
   ```

## Usage

1. **Add a new patient** using the "เพิ่มผู้ป่วยใหม่" button
2. **Fill in patient information** including medical history, allergies, etc.
3. **Create a consultation** by filling in the assessment form
4. **Analyze with AI** by clicking "วิเคราะห์ด้วย AI" in the consultation history
5. **View AI analysis** including risk assessment, care recommendations, and dietary advice
6. **Provide feedback** on AI analysis accuracy for research purposes

## API Endpoints

### POST /api/assess
Analyze patient data and return AI-powered medical assessment.

**Request Body:**
```json
{
  "name": "string",
  "age": "number",
  "sex": "string",
  "weight": "number",
  "height": "number",
  "symptoms": "string",
  "symptom_duration": "string",
  "previous_meal": "string",
  "vitals": {
    "bp": "string",
    "hr": "string",
    "rr": "string",
    "temp": "string"
  },
  "health_profile": {
    "allergies": {
      "drug": "string",
      "food": "string",
      "other": "string"
    },
    "current_medications": [
      {
        "name": "string",
        "dose": "string",
        "frequency": "string"
      }
    ],
    "chronic_conditions": ["string"],
    "past_surgical_history": "string",
    "family_history": "string",
    "lifestyle_factors": {
      "smoking": "string",
      "alcohol": "string"
    },
    "additional_notes": "string"
  }
}
```

**Response:**
```json
{
  "userInfo": {
    "name": "string",
    "age": "number",
    "sex": "string"
  },
  "bmi": {
    "value": "number",
    "category": "string",
    "weight": "number",
    "height": "number"
  },
  "analysis": {
    "primary_assessment": "string",
    "risk_analysis": [
      {
        "condition": "string",
        "risk_level": "high|medium|low|info",
        "rationale": "string"
      }
    ],
    "personalized_care": {
      "immediate_actions": ["string"],
      "general_wellness": ["string"],
      "activity_guidance": {
        "recommended": ["string"],
        "to_avoid": ["string"]
      }
    },
    "dietary_recommendations": {
      "concept": "string",
      "foods_to_eat": {
        "main_dishes": ["string"],
        "snacks_and_fruits": ["string"],
        "drinks": ["string"]
      },
      "foods_to_avoid": ["string"]
    },
    "red_flags": ["string"],
    "disclaimer": "string"
  }
}
```

## Development

### Building for Production

```bash
npm run build
```

This will create a `dist` folder with the optimized production build.

### Linting

```bash
npm run lint
```

## Security Considerations

- All API keys are stored in environment variables
- CORS is configured for development
- Helmet middleware provides security headers
- Input validation is performed on both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.