import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import PatientProfile from './PatientProfile';
import AssessmentForm from './AssessmentForm';
import ConsultationHistory from './ConsultationHistory';
import WelcomeScreen from './WelcomeScreen';

const PatientView = () => {
    const { selectedPatient } = usePatients();
    const [activeTab, setActiveTab] = useState('profile');

    if (!selectedPatient) {
        return <WelcomeScreen />;
    }

    const tabs = [
        { id: 'profile', label: 'โปรไฟล์ผู้ป่วย' },
        { id: 'assessment', label: 'การประเมิน' },
        { id: 'history', label: 'ประวัติการปรึกษา' }
    ];

    return (
        <div className="patient-view">
            <div className="section-card">
                <div className="section-header">
                    <h2>โปรไฟล์ผู้ป่วย: {selectedPatient.name}</h2>
                </div>
                
                <div className="form-grid" style={{ marginBottom: '20px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ width: 'auto', marginRight: '10px' }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'profile' && <PatientProfile />}
                {activeTab === 'assessment' && <AssessmentForm />}
                {activeTab === 'history' && <ConsultationHistory />}
            </div>
        </div>
    );
};

export default PatientView;