import React, { useState, useEffect } from 'react';
import { usePatients } from '../context/PatientContext';

const PatientModal = () => {
    const { 
        isModalOpen, 
        patientToEdit, 
        handleSavePatient, 
        closeModal 
    } = usePatients();
    
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        sex: '',
        weight: '',
        height: '',
        hn: '',
        contact: {
            phone: ''
        },
        health_profile: {
            allergies: {
                drug: '',
                food: '',
                other: ''
            },
            current_medications: [],
            chronic_conditions: [],
            past_surgical_history: '',
            family_history: '',
            lifestyle_factors: {
                smoking: '',
                alcohol: ''
            },
            additional_notes: ''
        }
    });

    useEffect(() => {
        if (patientToEdit) {
            setFormData(patientToEdit);
        } else {
            setFormData({
                name: '',
                age: '',
                sex: '',
                weight: '',
                height: '',
                hn: '',
                contact: {
                    phone: ''
                },
                health_profile: {
                    allergies: {
                        drug: '',
                        food: '',
                        other: ''
                    },
                    current_medications: [],
                    chronic_conditions: [],
                    past_surgical_history: '',
                    family_history: '',
                    lifestyle_factors: {
                        smoking: '',
                        alcohol: ''
                    },
                    additional_notes: ''
                }
            });
        }
    }, [patientToEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSavePatient(formData);
    };

    const addMedication = () => {
        const newMedication = {
            name: '',
            dose: '',
            frequency: ''
        };
        setFormData(prev => ({
            ...prev,
            health_profile: {
                ...prev.health_profile,
                current_medications: [...prev.health_profile.current_medications, newMedication]
            }
        }));
    };

    const updateMedication = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            health_profile: {
                ...prev.health_profile,
                current_medications: prev.health_profile.current_medications.map((med, i) => 
                    i === index ? { ...med, [field]: value } : med
                )
            }
        }));
    };

    const removeMedication = (index) => {
        setFormData(prev => ({
            ...prev,
            health_profile: {
                ...prev.health_profile,
                current_medications: prev.health_profile.current_medications.filter((_, i) => i !== index)
            }
        }));
    };

    const addCondition = () => {
        setFormData(prev => ({
            ...prev,
            health_profile: {
                ...prev.health_profile,
                chronic_conditions: [...prev.health_profile.chronic_conditions, '']
            }
        }));
    };

    const updateCondition = (index, value) => {
        setFormData(prev => ({
            ...prev,
            health_profile: {
                ...prev.health_profile,
                chronic_conditions: prev.health_profile.chronic_conditions.map((cond, i) => 
                    i === index ? value : cond
                )
            }
        }));
    };

    const removeCondition = (index) => {
        setFormData(prev => ({
            ...prev,
            health_profile: {
                ...prev.health_profile,
                chronic_conditions: prev.health_profile.chronic_conditions.filter((_, i) => i !== index)
            }
        }));
    };

    if (!isModalOpen) return null;

    return (
        <div className="modal show">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{patientToEdit ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มผู้ป่วยใหม่'}</h2>
                    <span className="close-button" onClick={closeModal}>&times;</span>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>HN *</label>
                            <input
                                type="text"
                                name="hn"
                                value={formData.hn}
                                onChange={handleInputChange}
                                placeholder="เลขทะเบียนผู้ป่วย"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>ชื่อ *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="ชื่อ-นามสกุล"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>อายุ *</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                required
                                min="0"
                                max="150"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>เพศ *</label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">เลือกเพศ</option>
                                <option value="ชาย">ชาย</option>
                                <option value="หญิง">หญิง</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>น้ำหนัก (kg) *</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.1"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>ส่วนสูง (cm) *</label>
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.1"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>โทรศัพท์</label>
                            <input
                                type="tel"
                                name="contact.phone"
                                value={formData.contact.phone}
                                onChange={handleInputChange}
                                placeholder="เบอร์โทรศัพท์"
                            />
                        </div>
                    </div>
                    
                    <div className="modal-section-title">แพ้ยา</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>แพ้ยา</label>
                            <input
                                type="text"
                                name="health_profile.allergies.drug"
                                value={formData.health_profile.allergies.drug}
                                onChange={handleInputChange}
                                placeholder="เช่น เพนนิซิลลิน"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>แพ้อาหาร</label>
                            <input
                                type="text"
                                name="health_profile.allergies.food"
                                value={formData.health_profile.allergies.food}
                                onChange={handleInputChange}
                                placeholder="เช่น น้ำตาล, ถั่ว"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>แพ้อื่นๆ</label>
                            <input
                                type="text"
                                name="health_profile.allergies.other"
                                value={formData.health_profile.allergies.other}
                                onChange={handleInputChange}
                                placeholder="เช่น ฝุ่น, สัตว์เลี้ยง"
                            />
                        </div>
                    </div>
                    
                    <div className="modal-section-title">ยาที่ใช้ปัจจุบัน</div>
                    <div className="form-group">
                        <button type="button" className="btn btn-secondary" onClick={addMedication}>
                            + เพิ่มยา
                        </button>
                    </div>
                    {formData.health_profile.current_medications.map((med, index) => (
                        <div key={index} className="form-grid" style={{ marginBottom: '15px' }}>
                            <div className="form-group">
                                <label>ชื่อยา</label>
                                <input
                                    type="text"
                                    value={med.name}
                                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                    placeholder="ชื่อยา"
                                />
                            </div>
                            <div className="form-group">
                                <label>ขนาด</label>
                                <input
                                    type="text"
                                    value={med.dose}
                                    onChange={(e) => updateMedication(index, 'dose', e.target.value)}
                                    placeholder="เช่น 500mg"
                                />
                            </div>
                            <div className="form-group">
                                <label>ความถี่</label>
                                <input
                                    type="text"
                                    value={med.frequency}
                                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                    placeholder="เช่น 3 ครั้ง/วัน"
                                />
                            </div>
                            <div className="form-group">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => removeMedication(index)}
                                    style={{ backgroundColor: 'var(--danger-color)', color: 'white' }}
                                >
                                    ลบ
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <div className="modal-section-title">โรคประจำตัว</div>
                    <div className="form-group">
                        <button type="button" className="btn btn-secondary" onClick={addCondition}>
                            + เพิ่มโรคประจำตัว
                        </button>
                    </div>
                    {formData.health_profile.chronic_conditions.map((condition, index) => (
                        <div key={index} className="form-grid" style={{ marginBottom: '15px' }}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <input
                                    type="text"
                                    value={condition}
                                    onChange={(e) => updateCondition(index, e.target.value)}
                                    placeholder="เช่น ความดันสูง, เบาหวาน"
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => removeCondition(index)}
                                    style={{ backgroundColor: 'var(--danger-color)', color: 'white', marginTop: '10px' }}
                                >
                                    ลบ
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <div className="form-grid">
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>ประวัติการผ่าตัด</label>
                            <input
                                type="text"
                                name="health_profile.past_surgical_history"
                                value={formData.health_profile.past_surgical_history}
                                onChange={handleInputChange}
                                placeholder="เช่น ผ่าตัดไส้ใหญ่เมื่อ 5 ปีที่แล้ว"
                            />
                        </div>
                        
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>ประวัติโรคในครอบครัว</label>
                            <input
                                type="text"
                                name="health_profile.family_history"
                                value={formData.health_profile.family_history}
                                onChange={handleInputChange}
                                placeholder="เช่น โรคหัวใจในครอบครัว"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>การสูบบุหรี่</label>
                            <select
                                name="health_profile.lifestyle_factors.smoking"
                                value={formData.health_profile.lifestyle_factors.smoking}
                                onChange={handleInputChange}
                            >
                                <option value="">ไม่ได้สูบ</option>
                                <option value="สูบบ่อย">สูบบ่อย</option>
                                <option value="สูบบางครั้ง">สูบบางครั้ง</option>
                                <option value="เลิกแล้ว">เลิกแล้ว</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>การดื่มแอลกอฮอล์</label>
                            <select
                                name="health_profile.lifestyle_factors.alcohol"
                                value={formData.health_profile.lifestyle_factors.alcohol}
                                onChange={handleInputChange}
                            >
                                <option value="">ไม่ดื่ม</option>
                                <option value="ดื่มน้อย">ดื่มน้อย</option>
                                <option value="ดื่มปานกลาง">ดื่มปานกลาง</option>
                                <option value="ดื่มมาก">ดื่มมาก</option>
                            </select>
                        </div>
                        
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>บันทึกเพิ่มเติม</label>
                            <textarea
                                name="health_profile.additional_notes"
                                value={formData.health_profile.additional_notes}
                                onChange={handleInputChange}
                                placeholder="ข้อมูลเพิ่มเติมอื่นๆ"
                            />
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            ยกเลิก
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {patientToEdit ? 'บันทึกการแก้ไข' : 'บันทึกผู้ป่วย'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientModal;