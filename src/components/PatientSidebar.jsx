import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import { useAuth } from '../context/UserContext';
import UserProfile from './UserProfile';
import { Link } from 'react-router-dom';

const PatientSidebar = () => {
    const {
        patients,
        selectedPatient,
        selectPatientById,
        loading,
        error,
        openModal
    } = usePatients();
    const { getCurrentUserName, getCurrentUserEmail } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.hn && patient.hn.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handlePatientClick = (patientId) => {
        selectPatientById(patientId);
    };

    const handleAddPatient = () => {
        openModal();
    };

    if (loading) {
        return (
            <div className="patient-sidebar">
                <div className="sidebar-header">
                    <h2>กำลังหลอดข้อมูล...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="patient-sidebar">
                <div className="sidebar-header">
                    <h2>ผิดพลาด</h2>
                </div>
                <div className="patient-list">
                    <p style={{ color: 'var(--danger-color)', textAlign: 'center', padding: '20px' }}>
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-sidebar">
            <div className="sidebar-header">
                <h2>รายชื่อผู้ป่วย</h2>
                <UserProfile />
                <div className="search-patient">
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อหรือ HN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleAddPatient}
                    style={{ marginTop: '15px', marginRight: '10px' }}
                >
                    + เพิ่มผู้ป่วยใหม่
                </button>

            </div>
            
            <div className="patient-list">
                {filteredPatients.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--light-text-color)', padding: '20px' }}>
                        {searchQuery ? 'ไม่พบผู้ป่วยที่ตรงกับคำค้นหา' : 'ไม่พบผู้ป่วย'}
                    </p>
                ) : (
                    filteredPatients
                        .sort((a, b) => a.name.localeCompare(b.name, 'th'))
                        .map(patient => (
                            <div
                                key={patient.id}
                                className={`patient-item ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                                onClick={() => handlePatientClick(patient.id)}
                            >
                                <div className="patient-item-name">
                                    {patient.name} {patient.hn && `(${patient.hn})`}
                                </div>
                                <div className="patient-item-details">
                                    อายุ: {patient.age} ปี, เพศ: {patient.sex}
                                </div>
                            </div>
                        ))
                )}
            </div>
            
            <div className="sidebar-footer">
                <p style={{ fontSize: '0.85rem', color: 'var(--light-text-color)' }}>
                    ระบบวินิจฉัย AI ทางการแพทย์
                                    <Link  to="/informdownload" className="btn btn-secondary" style={{ marginTop: '15px', textDecoration: 'none' , marginLeft: '10px' }}>
                    📊
                </Link>
                </p>
            </div>
        </div>
    );
};

export default PatientSidebar;