import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import { getAiAssessment } from '../services/apiService';

const AssessmentForm = () => {
    const { selectedPatient, updatePatientHistory } = usePatients();
    const [formData, setFormData] = useState({
        symptoms: '',
        symptom_duration: '',
        previous_meal: '',
        vital_bp: '',
        vital_hr: '',
        vital_rr: '',
        vital_temp: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    if (!selectedPatient) {
        return <p>กรุณาเลือกผู้ป่วยก่อน</p>;
    }

    return (
        <div>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>
                บันทึกการปรึกษาใหม่
            </h3>
            
            {error && (
                <div style={{ 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    borderLeft: '4px solid var(--danger-color)'
                }}>
                    {error}
                </div>
            )}
            
            {success && (
                <div style={{ 
                    backgroundColor: '#d4edda', 
                    color: '#155724', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    borderLeft: '4px solid var(--success-color)'
                }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>อาการ *</label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleInputChange}
                            required
                            placeholder="ระบุอาการที่ผู้ป่วยมี"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>เป็นมานาน *</label>
                        <input
                            type="text"
                            name="symptom_duration"
                            value={formData.symptom_duration}
                            onChange={handleInputChange}
                            required
                            placeholder="เช่น 2 วัน, 1 สัปดาห์"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>อาหารมื้อล่าสุด</label>
                        <input
                            type="text"
                            name="previous_meal"
                            value={formData.previous_meal}
                            onChange={handleInputChange}
                            placeholder="เช่น ข้าวผัด, น้ำตาล"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>ความดัน (mmHg)</label>
                        <input
                            type="text"
                            name="vital_bp"
                            value={formData.vital_bp}
                            onChange={handleInputChange}
                            placeholder="เช่น 120/80"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>ชีพจร (bpm)</label>
                        <input
                            type="text"
                            name="vital_hr"
                            value={formData.vital_hr}
                            onChange={handleInputChange}
                            placeholder="เช่น 72"
                        />
                    </div>
                    
                    {/* <div className="form-group">
                        <label>หายใจ (ครั้ง/นาที)</label>
                        <input
                            type="text"
                            name="vital_rr"
                            value={formData.vital_rr}
                            onChange={handleInputChange}
                            placeholder="เช่น 16"
                        />
                    </div> */}
                    
                    <div className="form-group">
                        <label>อุณหภูมิ (°C)</label>
                        <input
                            type="text"
                            name="vital_temp"
                            value={formData.vital_temp}
                            onChange={handleInputChange}
                            placeholder="เช่น 36.5"
                        />
                    </div>
                </div>
                
                <div style={{ marginTop: '30px', marginBottom: '20px' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการปรึกษา'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssessmentForm;