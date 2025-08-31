// src/services/apiService.js (ฉบับแก้ไข)
import { auth } from '../config/firebase';

const API_ENDPOINT = '/api/assess';

const getAuthToken = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found.');
    return await currentUser.getIdToken();
};

export const getAiAssessment = async (payload) => {
    const token = await getAuthToken();
    
    // Remove properties that are not needed by the AI service
    const cleanPayload = { ...payload };
    delete cleanPayload.id;
    delete cleanPayload.history;

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // <--- เพิ่ม Token ที่นี่
        },
        body: JSON.stringify(cleanPayload),
    });

    if (!response.ok) {
        let errorMessage = 'Failed to fetch AI assessment';
        try {
            const errorData = await response.json();
            errorMessage = errorData.details || errorData.message || errorMessage;
        } catch (jsonError) {
            // If response is not JSON, read as text
            const errorText = await response.text();
            console.error('❌ [API Service] Non-JSON error response:', errorText.substring(0, 500));
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    return response.json();
};