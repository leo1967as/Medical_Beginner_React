import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import { exportPatientData } from '../services/exportService';

const DataExport = () => {
    const { patients, loading } = usePatients();
    const [isExporting, setIsExporting] = useState(false);

    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';

        // Define CSV headers
        const headers = [
            'HN', 'ชื่อ', 'อายุ', 'เพศ', 'โทรศัพท์', 'น้ำหนัก', 'ส่วนสูง', 'BMI',
            'แพ้ยา', 'แพ้อาหาร', 'แพ้อื่นๆ', 'โรคประจำตัว', 'ยาที่ใช้ปัจจุบัน',
            'ประวัติการผ่าตัด', 'ประวัติโรคในครอบครัว', 'การสูบบุหรี่', 'การดื่มแอลกอฮอล์',
            'บันทึกเพิ่มเติม', 'จำนวนการปรึกษา'
        ];

        // Convert patient data to CSV rows
        const rows = data.map(patient => {
            const profile = patient.health_profile || {};
            const allergies = profile.allergies || {};
            const lifestyle = profile.lifestyle_factors || {};
            const contact = patient.contact || {};
            
            // Calculate BMI
            const heightInMeters = patient.height / 100;
            const bmiValue = patient.weight ? (patient.weight / (heightInMeters * heightInMeters)).toFixed(2) : '';
            
            // Format medications
            const medications = profile.current_medications ? 
                profile.current_medications.map(med => `${med.name} ${med.dose} ${med.frequency}`).join('; ') : '';
            
            // Count consultations
            const consultationCount = patient.history ? patient.history.length : 0;

            return [
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
                consultationCount
            ];
        });

        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        return csvContent;
    };

    const downloadCSV = async () => {
        setIsExporting(true);
        
        try {
            await exportPatientData();
        } catch (error) {
            console.error('Error downloading CSV:', error);
            alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ CSV');
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div className="spinner"></div>
                <p>กำลังโหลดข้อมูลผู้ป่วย...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ 
                background: 'var(--card-background)', 
                borderRadius: '12px', 
                padding: '30px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--border-color)'
            }}>
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>
                    ดาวน์โหลดข้อมูลผู้ป่วย
                </h2>
                
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: 'var(--light-text-color)', marginBottom: '10px' }}>
                        ดาวน์โหลดข้อมูลผู้ป่วยทั้งหมดในระบบเป็นไฟล์ CSV
                    </p>
                    <p style={{ color: 'var(--light-text-color)', fontSize: '0.9rem' }}>
                        จำนวนผู้ป่วย: {patients.length} คน
                    </p>
                </div>

                <button
                    onClick={downloadCSV}
                    disabled={isExporting || patients.length === 0}
                    className="btn btn-primary"
                    style={{ 
                        width: '100%', 
                        maxWidth: '300px',
                        marginTop: '20px'
                    }}
                >
                    {isExporting ? 'กำลังสร้างไฟล์...' : 'ดาวน์โหลด CSV'}
                </button>

                {patients.length === 0 && (
                    <p style={{ 
                        color: 'var(--light-text-color)', 
                        textAlign: 'center', 
                        marginTop: '20px' 
                    }}>
                        ไม่มีข้อมูลผู้ป่วยในระบบ
                    </p>
                )}
            </div>
        </div>
    );
};

export default DataExport;