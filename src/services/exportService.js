// src/services/exportService.js (ฉบับแก้ไข)
import { auth } from '../config/firebase';

const getAuthToken = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found.');
    return await currentUser.getIdToken();
};

export const exportPatientData = async () => {
    try {
        const token = await getAuthToken();
        const response = await fetch('/api/export', {
            headers: {
                'Authorization': `Bearer ${token}` // <--- เพิ่ม Token ที่นี่
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to export patient data');
        }
        
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `patient_data_${new Date().toISOString().split('T')[0]}.csv`;
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error exporting patient data:', error);
        throw new Error('ไม่สามารถสร้างไฟล์ CSV ได้');
    }
};