// Using modular Firebase SDK for performance
import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    doc, 
    updateDoc 
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const patientsCollection = collection(db, "patients");

export const fetchPatients = async () => {
    const querySnapshot = await getDocs(patientsCollection);
    const patients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Ensure history is always an array
    patients.forEach(p => {
        if (!p.history) {
            p.history = [];
        }
    });
    return patients;
};

export const savePatient = async (patientData) => {
    if (patientData.id) {
        // Update existing patient
        const patientRef = doc(db, "patients", patientData.id);
        const { id, ...dataToUpdate } = patientData;
        await updateDoc(patientRef, dataToUpdate);
        return patientData.id;
    } else {
        // Add new patient
        const docRef = await addDoc(patientsCollection, { ...patientData, history: [] });
        return docRef.id;
    }
};

export const updatePatient = async (patientId, data) => {
    const patientRef = doc(db, "patients", patientId);
    
    // Clean the data to remove undefined values
    const cleanData = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            cleanData[key] = value;
        }
    }
    
    await updateDoc(patientRef, cleanData);
};