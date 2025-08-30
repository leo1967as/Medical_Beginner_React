// src/components/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/UserContext';

const Login = () => {
    const { login, register, loading, error, clearError } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        setIsSubmitting(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                if (formData.password !== formData.confirmPassword) {
                    // The useAuth hook already sets the error, so we can just return
                    return;
                }
                await register(formData.email, formData.password, formData.displayName);
            }
        } catch (error) {
            // Error is already handled by the UserContext
            console.error('Authentication error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        clearError();
        setFormData({ email: '', password: '', displayName: '', confirmPassword: '' });
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>{isLogin ? 'เข้าสู่ระบบ Clinical Portal' : 'สร้างบัญชีใหม่'}</h2>
                    <p className="login-subtitle">
                        {isLogin 
                            ? 'กรุณากรอกข้อมูลเพื่อเข้าใช้งาน' 
                            : 'เริ่มต้นใช้งานด้วยการสร้างบัญชีของคุณ'
                        }
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="displayName">ชื่อ-นามสกุล</label>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                placeholder="กรอกชื่อและนามสกุล"
                                required={!isLogin}
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">อีเมล</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="example@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">รหัสผ่าน</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={isLogin ? "กรอกรหัสผ่าน" : "อย่างน้อย 6 ตัวอักษร"}
                            required
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="กรอกรหัสผ่านอีกครั้ง"
                                required={!isLogin}
                                autoComplete="new-password"
                            />
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading || isSubmitting}
                        style={{marginTop: '10px'}}
                    >
                        {(loading || isSubmitting) ? 'กำลังดำเนินการ...' : (isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}
                        <button
                            type="button"
                            className="btn-link"
                            onClick={toggleMode}
                        >
                            {isLogin ? 'สมัครสมาชิกที่นี่' : 'เข้าสู่ระบบ'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;