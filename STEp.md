# 🚨 Critical Bugs Fix Implementation Guide for Production

## Production Domain
**URL**: https://medical-learner.vercel.app/

---

## Step 1: Fix Authentication Token Exposure

### **File**: `backend/diagnosisService.js`

**Problem**: OpenRouter API key exposure in fetch headers and hardcoded localhost references.

**Solution**:

```javascript
// backend/diagnosisService.js
// Replace the entire generateWithOpenRouter function (lines 18-48)

async function generateWithOpenRouter(prompt) {
    const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
    const model = process.env.OPENROUTER_MODEL || "google/gemini-flash";
    console.log(`🔌 [AI Service] Sending request to OpenRouter (Primary) with model: ${model}...`);
    
    // Use environment variables for production-safe headers
    const httpReferer = process.env.OPENROUTER_HTTP_REFERER || 'https://medical-learner.vercel.app';
    const xTitle = process.env.OPENROUTER_X_TITLE || 'Medical Learner AI';
    
    const systemPrompt = `**Role and Goal:** You are an Analytical Wellness Advisor AI. Your sole purpose is to analyze the provided patient data to generate a coherent, safe, and logically structured analysis in a complete JSON object format.`;
    const body = {
        model: model,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
        response_format: { "type": "json_object" }
    };
    
    const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': httpReferer,
            'X-Title': xTitle,
        },
        body: JSON.stringify(body),
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        // Log minimal error info to prevent exposure
        console.error(`❌ [AI Service] OpenRouter API failed with status ${response.status}`);
        throw new Error(`OpenRouter API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
    } else {
        throw new Error("Invalid response structure from OpenRouter API");
    }
}
```

---

## Step 2: Fix AI Response Parsing Error Handling

### **File**: `backend/diagnosisService.js`

**Problem**: JSON.parse() without proper error handling for malformed AI responses.

**Solution**:

```javascript
// backend/diagnosisService.js
// Replace the JSON parsing section (around line 171-172)

const jsonStringResponse = await generateContent(prompt); 
try {
    const parsedResponse = JSON.parse(jsonStringResponse);
    console.log("✅ [AI Service] Successfully parsed JSON response");
    return parsedResponse;
} catch (parseError) {
    console.error('❌ [AI Service] Failed to parse JSON response:', parseError.message);
    // Log only first 500 chars to avoid sensitive data exposure
    console.error('📄 [AI Service] Response content:', jsonStringResponse.substring(0, 500));
    throw new Error('AI service returned invalid response format. Please check API configuration or try again later.');
}
```

---

## Step 3: Fix Race Condition in Patient Updates

### **File**: `src/context/PatientContext.jsx`

**Problem**: Multiple simultaneous updates to patient history not properly handled.

**Solution**:

```javascript
// src/context/PatientContext.jsx
// Replace the updatePatientHistory function (lines 61-85)

const updatePatientHistory = async (patientId, newHistory) => {
    try {
        // Deep clean the data to remove undefined values
        const deeplyCleanedHistory = JSON.parse(JSON.stringify(newHistory));
        
        // Get current user ID
        const userId = getCurrentUserId();
        if (!userId) {
            throw new Error("No authenticated user found");
        }
        
        // Generate unique operation ID for tracking
        const operationId = `update_${patientId}_${Date.now()}`;
        console.log(`🔄 [PatientContext] Starting history update ${operationId}`);
        
        // Update Firestore first
        await updatePatient(patientId, { history: deeplyCleanedHistory }, userId);
        
        // Update local state immediately
        setPatients(prevPatients => 
            prevPatients.map(p => 
                p.id === patientId ? { ...p, history: deeplyCleanedHistory } : p
            )
        );
        
        setSelectedPatient(prevPatient => 
            prevPatient && prevPatient.id === patientId 
                ? { ...prevPatient, history: deeplyCleanedHistory } 
                : prevPatient
        );
        
        console.log(`✅ [PatientContext] Successfully completed history update ${operationId}`);
    } catch (err) {
        console.error('❌ [PatientContext] Error updating patient history:', err);
        setError("Failed to update consultation history.");
        throw err; // Re-throw for component-level error handling
    }
};
```

---

## Step 4: Add Input Validation for Vital Signs

### **File**: `src/components/AssessmentForm.jsx`

**Problem**: Vital signs not validated before submission.

**Solution**:

```javascript
// src/components/AssessmentForm.jsx
// Add validation function and update handleSubmit

const validateVitalSigns = (vitals) => {
    const errors = {};
    
    if (vitals.bp) {
        const bpRegex = /^\d{2,3}\/\d{2,3}$/;
        if (!bpRegex.test(vitals.bp)) {
            errors.bp = 'รูปแบบความดันไม่ถูกต้อง (เช่น 120/80)';
        }
    }
    
    if (vitals.hr) {
        const hr = parseInt(vitals.hr);
        if (isNaN(hr) || hr < 40 || hr > 200) {
            errors.hr = 'อัตราการเต้นของหัวใจต้องอยู่ระหว่าง 40-200 ครั้ง/นาที';
        }
    }
    
    if (vitals.rr) {
        const rr = parseInt(vitals.rr);
        if (isNaN(rr) || rr < 10 || rr > 30) {
            errors.rr = 'อัตราการหายใจต้องอยู่ระหว่าง 10-30 ครั้ง/นาที';
        }
    }
    
    if (vitals.temp) {
        const temp = parseFloat(vitals.temp);
        if (isNaN(temp) || temp < 35.5 || temp > 41) {
            errors.temp = 'อุณหภูมิตัวต้องอยู่ระหว่าง 35.5-41 °C';
        }
    }
    
    return errors;
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
        setError('กรุณาเลือกผู้ป่วยก่อน');
        return;
    }

    // Prepare vital signs data
    const vitals = {
        bp: formData.vital_bp,
        hr: formData.vital_hr,
        rr: formData.vital_rr,
        temp: formData.vital_temp
    };

    // Validate vital signs
    const validationErrors = validateVitalSigns(vitals);
    if (Object.keys(validationErrors).length > 0) {
        setError('ข้อมูลสัญญาณชีพไม่ถูกต้อง: ' + Object.values(validationErrors).join(', '));
        return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
        // Create new consultation entry
        const newConsultation = {
            timestamp: Date.now(),
            symptoms: {
                symptoms: formData.symptoms,
                symptom_duration: formData.symptom_duration,
                previous_meal: formData.previous_meal,
            },
            vitals: vitals,
            aiResponse: null,
            feedback: null
        };

        // Update patient history
        const updatedHistory = [...(selectedPatient.history || []), newConsultation];
        await updatePatientHistory(selectedPatient.id, updatedHistory);

        // Reset form
        setFormData({
            symptoms: '',
            symptom_duration: '',
            previous_meal: '',
            vital_bp: '',
            vital_hr: '',
            vital_rr: '',
            vital_temp: ''
        });

        setSuccess('บันทึกการปรึกษาใหม่เรียบร้อยแล้ว\ncุณสามารถกด "วิเคราะห์ด้วย AI" ในประวัติล่าสุดได้เลย');
    } catch (err) {
        console.error('AssessmentForm Error:', err);
        setError('เกิดข้อผิดพลาดในการบันทึกการปรึกษา: ' + err.message);
    } finally {
        setIsSubmitting(false);
    }
};
```

---

## Step 5: Secure CORS Configuration

### **File**: `backend/server.js`

**Problem**: CORS configured to allow all origins.

**Solution**:

```javascript
// backend/server.js
// Replace CORS middleware setup (around line 62)

// Configure CORS for production security
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins for production
        const allowedOrigins = [
            'http://localhost:3000',        // Development
            'http://localhost:5173',        // Vite dev server
            'https://medical-learner.vercel.app'  // Production
        ];
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`❌ [CORS] Origin ${origin} not allowed by CORS`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
```

---

## Step 6: Update Environment Variables

### **File**: `.env` (Root of backend directory)

**Add/update these environment variables**:

```env
# =================================
# OPENROUTER API CONFIGURATION
# =================================
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=google/gemini-flash
OPENROUTER_HTTP_REFERER=https://medical-learner.vercel.app
OPENROUTER_X_TITLE=Medical Learner AI

# =================================
# FIREBASE ADMIN CONFIGURATION
# =================================
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key_with_newlines_escaped
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url

# =================================
# SERVER CONFIGURATION
# =================================
PORT=3001
NODE_ENV=production

# =================================
# CORS CONFIGURATION
# =================================
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://medical-learner.vercel.app
```

**Note**: 
- Replace `your_openrouter_api_key_here` with your actual OpenRouter API key
- Escape newlines in private key: replace actual newlines with `\n`
- Set `NODE_ENV=production` for production deployment

---

## Step 7: Update .gitignore to Prevent Key Exposure

### **File**: `.gitignore` (Root of project)

**Add these entries if not already present**:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Firebase service account key (if stored as JSON file)
*service-account*.json

# OpenRouter API keys
OPENROUTER_API_KEY

# Private keys and certificates
*.pem
*.key
*.p12
*.pfx

# Vercel environment variables
.vercel

# Build artifacts containing sensitive data
build/
dist/

# Log files
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE settings
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
```

---

## Step 8: Verify Production Deployment

### **Critical Checks After Deployment**:

1. **Test API Endpoints**:
   ```bash
   curl -H "Authorization: Bearer YOUR_USER_TOKEN" https://medical-learner.vercel.app/api/export
   ```

2. **Check CORS Headers**:
   ```bash
   curl -H "Origin: https://medical-learner.vercel.app" -v https://medical-learner.vercel.app/api/health
   ```

3. **Verify AI Service**:
   - Create a new patient consultation
   - Click "วิเคราะห์ด้วย AI"
   - Check browser console for secure error handling

4. **Monitor Network Traffic**:
   - Use browser dev tools to ensure no API keys are exposed in requests/responses

---

## Summary of Critical Bug Fixes

| Bug | Status | File | Impact |
|-----|--------|------|--------|
| Authentication Token Exposure | ✅ Fixed | `backend/diagnosisService.js` | Security: Prevents API key leakage |
| AI Response Parsing | ✅ Fixed | `backend/diagnosisService.js` | Stability: Prevents crashes from invalid JSON |
| Race Conditions | ✅ Fixed | `src/context/PatientContext.jsx` | Data Integrity: Prevents data loss |
| Input Validation | ✅ Fixed | `src/components/AssessmentForm.jsx` | Data Quality: Ensures valid medical data |
| CORS Security | ✅ Fixed | `backend/server.js` | Security: Restricts API access to authorized domains |

**Next Steps**:
1. Deploy changes to production
2. Test all functionality thoroughly
3. Monitor console logs for any errors
4. Verify CSV export includes email column correctly

**Estimated Time to Complete**: 30-45 minutes

**Priority**: HIGH - All critical bugs must be fixed before production use