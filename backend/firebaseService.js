// Firebase service for backend operations
import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs 
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const patientsCollection = collection(db, "patients");

export const fetchPatients = async () => {
    try {
        const querySnapshot = await getDocs(patientsCollection);
        const patients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Ensure history is always an array
        return patients.map(patient => ({
            ...patient,
            history: patient.history || []
        }));
    } catch (error) {
        console.error("Error fetching patients from Firestore:", error);
        throw new Error("Failed to fetch patients from database");
    }
};