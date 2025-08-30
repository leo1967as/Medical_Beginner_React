import React from 'react';
import { usePatients } from '../context/PatientContext';

const PatientProfile = () => {
    const { selectedPatient } = usePatients();

    if (!selectedPatient) {
        return <p>กรุณาเลือกผู้ป่วย</p>;
    }

    const profile = selectedPatient.health_profile || {};
    const allergies = profile.allergies || {};
    const lifestyle = profile.lifestyle_factors || {};
    const contact = selectedPatient.contact || {};

    const displayValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return 'ไม่มี';
        }
        if (Array.isArray(value) && value.length === 0) {
            return 'ไม่มี';
        }
        if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
            return 'ไม่มี';
        }
        return value;
    };

    return (
        <div className="form-grid">
            <div className="form-group">
                <label>HN</label>
                <div>{displayValue(selectedPatient.hn)}</div>
            </div>
            <div className="form-group">
                <label>ชื่อ</label>
                <div>{selectedPatient.name}</div>
            </div>
            <div className="form-group">
                <label>อายุ</label>
                <div>{selectedPatient.age} ปี</div>
            </div>
            <div className="form-group">
                <label>เพศ</label>
                <div>{selectedPatient.sex}</div>
            </div>
            {/* <div className="form-group">
                <label>โทรศัพท์</label>
                <div>{displayValue(contact.phone)}</div>
            </div> */}
            <div className="form-group">
                <label>น้ำหนัก</label>
                <div>{selectedPatient.weight} kg</div>
            </div>
            <div className="form-group">
                <label>ส่วนสูง</label>
                <div>{selectedPatient.height} cm</div>
            </div>
            <div className="form-group">
                <label>BMI</label>
                <div>
                    {(() => {
                        const heightInMeters = selectedPatient.height / 100;
                        const bmiValue = (selectedPatient.weight / (heightInMeters * heightInMeters)).toFixed(2);
                        let category = '';
                        if (bmiValue < 18.5) category = 'น้ำหนักน้อยกว่าเกณฑ์';
                        else if (bmiValue < 23) category = 'น้ำหนักปกติ (สมส่วน)';
                        else if (bmiValue < 25) category = 'น้ำหนักเกิน';
                        else if (bmiValue < 30) category = 'โรคอ้วนระดับที่ 1';
                        else category = 'โรคอ้วนระดับที่ 2 (อันตราย)';
                        return `${bmiValue} (${category})`;
                    })()}
                </div>
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>แพ้ยา</label>
                <div>{displayValue(allergies.drug)}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>แพ้อาหาร</label>
                <div>{displayValue(allergies.food)}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>แพ้อื่นๆ</label>
                <div>{displayValue(allergies.other)}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>โรคประจำตัว</label>
                <div>{displayValue((profile.chronic_conditions || []).join(', '))}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>ยาที่ใช้ปัจจุบัน</label>
                <div>
                    {profile.current_medications && profile.current_medications.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {profile.current_medications.map((med, index) => (
                                <li key={index} style={{ marginBottom: '5px' }}>
                                    {med.name} {med.dose} {med.frequency}
                                </li>
                            ))}
                        </ul>
                    ) : displayValue('ไม่มี')}
                </div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>ประวัติการผ่าตัด</label>
                <div>{displayValue(profile.past_surgical_history)}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>ประวัติโรคในครอบครัว</label>
                <div>{displayValue(profile.family_history)}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>การสูบบุหรี่</label>
                <div>{displayValue(lifestyle.smoking)}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>การดื่มแอลกอฮอล์</label>
                <div>{displayValue(lifestyle.alcohol)}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>บันทึกเพิ่มเติม</label>
                <div>{displayValue(profile.additional_notes)}</div>
            </div>
        </div>
    );
};

export default PatientProfile;