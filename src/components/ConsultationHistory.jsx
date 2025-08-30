import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import { getAiAssessment } from '../services/apiService';

const ConsultationHistory = () => {
    const { selectedPatient, updatePatientHistory } = usePatients();
    const [expandedHistory, setExpandedHistory] = useState(new Set());
    const [feedbackStates, setFeedbackStates] = useState({});

    const toggleHistory = (timestamp) => {
        const newExpanded = new Set(expandedHistory);
        if (newExpanded.has(timestamp)) {
            newExpanded.delete(timestamp);
        } else {
            newExpanded.add(timestamp);
        }
        setExpandedHistory(newExpanded);
    };

    const handleAnalyze = async (timestamp) => {
        if (!selectedPatient) return;

        const historyEntry = selectedPatient.history.find(h => h.timestamp === timestamp);
        if (!historyEntry) return;

        try {
            const payload = {
                ...selectedPatient,
                symptoms: historyEntry.symptoms.symptoms,
                symptom_duration: historyEntry.symptoms.symptom_duration,
                previous_meal: historyEntry.symptoms.previous_meal,
                vitals: historyEntry.vitals
            };
            delete payload.id;
            delete payload.history;

            const result = await getAiAssessment(payload);
            
            // Update the specific history entry
            const updatedHistory = selectedPatient.history.map(h => 
                h.timestamp === timestamp ? { ...h, aiResponse: result.analysis } : h
            );
            
            await updatePatientHistory(selectedPatient.id, updatedHistory);
            
            // Update local state to reflect the change
            setExpandedHistory(new Set([...expandedHistory, timestamp]));
        } catch (error) {
            console.error('Error fetching AI assessment:', error);
            alert(`วิเคราะห์ล้มเหลว: ${error.message}`);
        }
    };

    const handleFeedback = async (timestamp, rating, notes) => {
        if (!selectedPatient) return;

        const updatedHistory = selectedPatient.history.map(h => 
            h.timestamp === timestamp ? { ...h, feedback: { rating, notes } } : h
        );
        
        await updatePatientHistory(selectedPatient.id, updatedHistory);
        
        // Update local feedback state
        setFeedbackStates(prev => ({
            ...prev,
            [timestamp]: { rating, notes }
        }));
    };

    const getFeedbackClass = (rating) => {
        switch (rating) {
            case 'accurate': return 'accurate';
            case 'partial': return 'partial';
            case 'inaccurate': return 'inaccurate';
            default: return '';
        }
    };

    if (!selectedPatient || !selectedPatient.history || selectedPatient.history.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--light-text-color)' }}>
                <p>ยังไม่มีประวัติการปรึกษา</p>
                <p>กรุณาเพิ่มการปรึกษาใหม่ในส่วน "การประเมิน"</p>
            </div>
        );
    }

    return (
        <div>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>
                ประวัติการปรึกษา ({selectedPatient.history.length} รายการ)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {selectedPatient.history
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map(historyEntry => {
                        const date = new Date(historyEntry.timestamp);
                        const formattedDate = date.toLocaleString('th-TH', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        const isExpanded = expandedHistory.has(historyEntry.timestamp);
                        const feedback = historyEntry.feedback || feedbackStates[historyEntry.timestamp] || {};
                        
                        return (
                            <div key={historyEntry.timestamp} className="history-item">
                                <div 
                                    className="history-header" 
                                    onClick={() => toggleHistory(historyEntry.timestamp)}
                                >
                                    <div className="history-header-date">
                                        {formattedDate}
                                    </div>
                                    <div>
                                        {historyEntry.aiResponse ? (
                                            <span style={{ color: 'var(--success-color)' }}>
                                                ✅ วิเคราะห์แล้ว
                                            </span>
                                        ) : (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAnalyze(historyEntry.timestamp);
                                                }}
                                                style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                                            >
                                                วิเคราะห์ด้วย AI
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {isExpanded && (
                                    <div className="history-content show">
                                        <p><strong>อาการ:</strong> {historyEntry.symptoms.symptoms}</p>
                                        <p><strong>เป็นมานาน:</strong> {historyEntry.symptoms.symptom_duration}</p>
                                        <p><strong>อาหารมื้อล่าสุด:</strong> {historyEntry.symptoms.previous_meal || 'ไม่ได้ระบุ'}</p>
                                        
                                        <p><strong>สัญญาณชีพ:</strong></p>
                                        <ul style={{ marginLeft: '20px' }}>
                                            {historyEntry.vitals.bp && <li>ความดัน: {historyEntry.vitals.bp} mmHg</li>}
                                            {historyEntry.vitals.hr && <li>ชีพจร: {historyEntry.vitals.hr}/min</li>}
                                            {historyEntry.vitals.rr && <li>หายใจ: {historyEntry.vitals.rr}/min</li>}
                                            {historyEntry.vitals.temp && <li>อุณหภูมิ: {historyEntry.vitals.temp}°C</li>}
                                        </ul>
                                        
                                                                                {historyEntry.aiResponse && (
                                            <div className="ai-analysis-container">
                                                <h4 style={{ color: 'var(--primary-color)', marginTop: '15px' }}>
                                                    ผลการวิเคราะห์ AI:
                                                </h4>
                                                
                                                <div className="result-section">
                                                    <h3>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M9 11l3 3L22 4"></path>
                                                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                                                        </svg>
                                                        การประเมินหลัก
                                                    </h3>
                                                    <p>{historyEntry.aiResponse.primary_assessment}</p>
                                                </div>
                                                
                                                <div className="result-section">
                                                    <h3>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
                                                        </svg>
                                                        การวิเคราะห์ความเสี่ยง
                                                    </h3>
                                                    <div className="risk-analysis-grid">
                                                        {historyEntry.aiResponse.risk_analysis?.map((risk, index) => (
                                                            <div key={index} className={`risk-card ${risk.risk_level}`}>
                                                                <div className="risk-card-header">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        {risk.risk_level === 'high' && <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>}
                                                                        {risk.risk_level === 'medium' && <circle cx="12" cy="12" r="10"></circle>}
                                                                        {risk.risk_level === 'low' && <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>}
                                                                        {risk.risk_level === 'info' && <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>}
                                                                    </svg>
                                                                    {risk.condition}
                                                                </div>
                                                                <p>{risk.rationale}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="result-section">
                                                    <h3>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"></path>
                                                        </svg>
                                                        การดูแลส่วนตัว
                                                    </h3>
                                                    <div className="care-grid">
                                                        <div className="care-section">
                                                            <h4>การดำเนินการทันที</h4>
                                                            <ul>
                                                                {historyEntry.aiResponse.personalized_care?.immediate_actions?.map((action, index) => (
                                                                    <li key={index}>{action}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="care-section">
                                                            <h4>สุขภาพทั่วไป</h4>
                                                            <ul>
                                                                {historyEntry.aiResponse.personalized_care?.general_wellness?.map((action, index) => (
                                                                    <li key={index}>{action}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="care-section">
                                                            <h4>กิจกรรม</h4>
                                                            <ul>
                                                                <li><strong>แนะนำ:</strong> {historyEntry.aiResponse.personalized_care?.activity_guidance?.recommended?.join(', ')}</li>
                                                                <li><strong>ควรหลีกเลี่ยง:</strong> {historyEntry.aiResponse.personalized_care?.activity_guidance?.to_avoid?.join(', ')}</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="result-section">
                                                    <h3>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                                                        </svg>
                                                        อาหารและโภชนาการ
                                                    </h3>
                                                    <div className="diet-grid">
                                                        <div className="foods-list foods-eat">
                                                            <h4>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                                                </svg>
                                                                แนะนำให้รับประทาน
                                                            </h4>
                                                            <div>
                                                                <p><strong>หลักการ:</strong> {historyEntry.aiResponse.dietary_recommendations?.concept}</p>
                                                                <p><strong>อาหารหลัก:</strong> {historyEntry.aiResponse.dietary_recommendations?.foods_to_eat?.main_dishes?.join(', ')}</p>
                                                                <p><strong>ขนม/ผลไม้:</strong> {historyEntry.aiResponse.dietary_recommendations?.foods_to_eat?.snacks_and_fruits?.join(', ')}</p>
                                                                <p><strong>เครื่องดื่ม:</strong> {historyEntry.aiResponse.dietary_recommendations?.foods_to_eat?.drinks?.join(', ')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="foods-list foods-avoid">
                                                            <h4>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M18 6L6 18M6 6l12 12"></path>
                                                                </svg>
                                                                ควรหลีกเลี่ยง
                                                            </h4>
                                                            <ul>
                                                                {historyEntry.aiResponse.dietary_recommendations?.foods_to_avoid?.map((food, index) => (
                                                                    <li key={index}>{food}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {historyEntry.aiResponse.red_flags?.length > 0 && (
                                                    <div className="result-section red-flags-section">
                                                        <h3>
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                                                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                                            </svg>
                                                            อันตรายที่ต้องระวัง
                                                        </h3>
                                                        <ul>
                                                            {historyEntry.aiResponse.red_flags.map((flag, index) => (
                                                                <li key={index}>{flag}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                
                                                <div className="disclaimer">
                                                    {historyEntry.aiResponse.disclaimer}
                                                </div>
                                                
                                                <div className="feedback-section">
                                                    <h4>ความคิดเห็นเกี่ยวกับผลการวิเคราะห์</h4>
                                                    <div className="feedback-buttons">
                                                        <button
                                                            className={`btn accurate ${feedback.rating === 'accurate' ? 'selected' : ''}`}
                                                            onClick={() => handleFeedback(historyEntry.timestamp, 'accurate', feedback.notes)}
                                                        >
                                                            แม่นยำ
                                                        </button>
                                                        <button
                                                            className={`btn partial ${feedback.rating === 'partial' ? 'selected' : ''}`}
                                                            onClick={() => handleFeedback(historyEntry.timestamp, 'partial', feedback.notes)}
                                                        >
                                                            บางส่วน
                                                        </button>
                                                        <button
                                                            className={`btn inaccurate ${feedback.rating === 'inaccurate' ? 'selected' : ''}`}
                                                            onClick={() => handleFeedback(historyEntry.timestamp, 'inaccurate', feedback.notes)}
                                                        >
                                                            ไม่แม่นยำ
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        placeholder="บันทึกความคิดเห็นเพิ่มเติม (ถ้ามี)"
                                                        value={feedback.notes || ''}
                                                        onChange={(e) => handleFeedback(historyEntry.timestamp, feedback.rating, e.target.value)}
                                                        style={{ width: '100%', marginTop: '10px', padding: '8px' }}
                                                    />
                                                    <button
                                                        className="btn btn-save-feedback"
                                                        onClick={() => handleFeedback(historyEntry.timestamp, feedback.rating, feedback.notes)}
                                                    >
                                                        บันทึกความคิดเห็น
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default ConsultationHistory;