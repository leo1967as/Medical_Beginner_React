// backend/firebaseService.js (ฉบับแก้ไข)

import admin from 'firebase-admin';

export const fetchPatients = async (userId) => {
    if (!userId) {
        console.error("fetchPatients called without a userId.");
        return []; // ไม่ควรเกิดขึ้นถ้า verifyToken ทำงานถูกต้อง
    }
    
    // ดึง db instance จาก admin ที่ถูก initialize แล้ว (ภายในฟังก์ชัน)
    const db = admin.firestore();
    
    try {
        const patientsCollection = db.collection("patients");
        // Query เฉพาะ patient ที่มี userId ตรงกับ user ที่ login อยู่
        const querySnapshot = await patientsCollection.where("userId", "==", userId).get();
        
        const patients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Ensure history is always an array
        return patients.map(patient => ({
            ...patient,
            history: patient.history || []
        }));
    } catch (error) {
        console.error("Error fetching patients from Firestore:", error);
        throw new Error("Failed to fetch patients from the database.");
    }
};