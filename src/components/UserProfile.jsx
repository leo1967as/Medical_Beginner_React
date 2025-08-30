import React, { useState, useContext } from 'react';
import { useAuth } from '../context/UserContext';
import { usePatients } from '../context/PatientContext';

const UserProfile = () => {
    const { currentUser, logout, getCurrentUserName, getCurrentUserEmail } = useAuth();
    const { patients } = usePatients();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setShowLogoutConfirm(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className="user-profile">
            <div className="profile-header">
                <div className="profile-info">
                    <h3>ข้อมูลผู้ใช้</h3>
                    <div className="profile-details">
                        <p><strong>ชื่อผู้ใช้:</strong> {getCurrentUserName() || 'ไม่ได้ระบุ'}</p>
                        <p><strong>อีเมล:</strong> {getCurrentUserEmail()}</p>
                        <p><strong>จำนวนผู้ป่วย:</strong> {patients.length} คน</p>
                    </div>
                </div>
                
                <div className="profile-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </div>

            {showLogoutConfirm && (
                <div className="logout-confirm">
                    <div className="confirm-dialog">
                        <h4>ยืนยันการออกจากระบบ</h4>
                        <p>คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?</p>
                        <div className="confirm-buttons">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleLogout}
                            >
                                ออกจากระบบ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;