// File: backend/server.js (Optimized for serving a separate Frontend)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import diagnosisService from './diagnosisService.js';
import { fetchPatients } from './firebaseService.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.resolve();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://www.gstatic.com"],
      "connect-src": ["'self'", `http://localhost:${PORT}`, "http://localhost:5173"], // Allow connection from frontend
    },
  },
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// API Route
// API Route
app.get('/api/export', async (req, res) => {
    try {
        console.log('[Backend] Generating detailed CSV export...');
        const patients = await fetchPatients();
        
        // Define new CSV headers for one-row-per-consultation
        const headers = [
            // Patient Info
            'HN', 'ชื่อ', 'อายุ', 'เพศ', 'โทรศัพท์', 'น้ำหนัก (kg)', 'ส่วนสูง (cm)', 'BMI',
            'แพ้ยา', 'แพ้อาหาร', 'แพ้อื่นๆ', 'โรคประจำตัว', 'ยาที่ใช้ปัจจุบัน',
            'ประวัติการผ่าตัด', 'ประวัติโรคในครอบครัว', 'การสูบบุหรี่', 'การดื่มแอลกอฮอล์',
            'บันทึกเพิ่มเติม',
            // Consultation Info
            'วันเวลาที่ปรึกษา', 'อาการ', 'เป็นมานาน', 'อาหารมื้อล่าสุด',
            'ความดัน (BP)', 'ชีพจร (HR)', 'อัตราหายใจ (RR)', 'อุณหภูมิ (Temp)',
            // AI & Feedback Info
            'การประเมินหลัก AI',
            'Feedback (Rating)', 'Feedback (Notes)'
        ];

        const rows = [];

        for (const patient of patients) {
            // Prepare patient-level data once
            const profile = patient.health_profile || {};
            const allergies = profile.allergies || {};
            const lifestyle = profile.lifestyle_factors || {};
            const contact = patient.contact || {};
            const heightInMeters = patient.height ? patient.height / 100 : 0;
            const bmiValue = (patient.weight && heightInMeters > 0) ? (patient.weight / (heightInMeters * heightInMeters)).toFixed(2) : '';
            const medications = profile.current_medications ?
                profile.current_medications.map(med => `${med.name} ${med.dose} ${med.frequency}`).join('; ') : '';

            const patientBaseData = [
                patient.hn || '',
                patient.name || '',
                patient.age || '',
                patient.sex || '',
                contact.phone || '',
                patient.weight || '',
                patient.height || '',
                bmiValue,
                allergies.drug || '',
                allergies.food || '',
                allergies.other || '',
                profile.chronic_conditions ? profile.chronic_conditions.join(', ') : '',
                medications,
                profile.past_surgical_history || '',
                profile.family_history || '',
                lifestyle.smoking || '',
                lifestyle.alcohol || '',
                profile.additional_notes || '',
            ];

            // If patient has no history, they won't be in this detailed export.
            // Loop through each consultation to create a new row
            if (patient.history && patient.history.length > 0) {
                for (const consultation of patient.history) {
                    const symptoms = consultation.symptoms || {};
                    const vitals = consultation.vitals || {};
                    const aiResponse = consultation.aiResponse || {};
                    const feedback = consultation.feedback || {};

                    const consultationData = [
                        new Date(consultation.timestamp).toLocaleString('th-TH'),
                        symptoms.symptoms || '',
                        symptoms.symptom_duration || '',
                        symptoms.previous_meal || '',
                        vitals.bp || '',
                        vitals.hr || '',
                        vitals.rr || '',
                        vitals.temp || '',
                        aiResponse.primary_assessment || 'N/A',
                        feedback.rating || '',
                        feedback.notes || ''
                    ];

                    rows.push([...patientBaseData, ...consultationData]);
                }
            }
        }

        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        // Set response headers for CSV download with BOM
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=patient_consultation_data_${new Date().toISOString().split('T')[0]}.csv`);
        
        console.log(`[Backend] Exported ${rows.length} consultation records to CSV`);
        res.send('\uFEFF' + csvContent);
        
    } catch (error) {
        console.error("[Backend] Error in /api/export:", error);
        res.status(500).json({
            error: "เกิดข้อผิดพลาดในการสร้างไฟล์ CSV",
            details: error.message || "ไม่สามารถระบุสาเหตุได้"
        });
    }
});

app.post('/api/assess', async (req, res) => {
    console.log('[Backend] Received a new assessment request...');
    try {
        const userData = req.body;
        const { name, age, sex, weight, height, symptoms } = userData;
        if (!name || !age || !sex || !weight || !height || !symptoms) {
            return res.status(400).json({ 
                error: "ข้อมูลไม่ครบถ้วน", 
                details: "ข้อมูลพื้นฐาน (ชื่อ, อายุ, เพศ, น้ำหนัก, ส่วนสูง, อาการ) เป็นสิ่งจำเป็น" 
            });
        }
        const assessmentResult = await diagnosisService.getAiAssessment(userData);
        res.status(200).json(assessmentResult);
    } catch (error) {
        console.error("[Backend] Error in /api/assess:", error);
        res.status(500).json({
            error: "เกิดข้อผิดพลาดรุนแรงบนเซิร์ฟเวอร์",
            details: error.message || "ไม่สามารถระบุสาเหตุได้"
        });
    }
});

// Production: Serve static files from the React build
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 [Backend] Server is running on http://localhost:${PORT}`);
});