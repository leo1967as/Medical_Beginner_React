// Uses the Vite proxy, so we only need to specify the path
const API_ENDPOINT = '/api/assess';

export const getAiAssessment = async (payload) => {
    // Remove properties that are not needed by the AI service
    const cleanPayload = { ...payload };
    delete cleanPayload.id;
    delete cleanPayload.history;

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanPayload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch AI assessment');
    }
    return response.json();
};