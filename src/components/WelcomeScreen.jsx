import React from 'react';

const WelcomeScreen = () => {
    return (
        <div className="welcome-screen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <h1>ระบบวินิจฉัย AI ทางการแพทย์</h1>
            <p>เลือกผู้ป่วยจากแถวด้านซ้ายเพื่อเริ่มใช้งาน</p>
            <p style={{ fontSize: '0.9rem', marginTop: '20px', opacity: 0.7 }}>
                หรือคลิก "เพิ่มผู้ป่วยใหม่" เพื่อสร้างโปรไฟล์ผู้ป่วยใหม่
            </p>
        </div>
    );
};

export default WelcomeScreen;