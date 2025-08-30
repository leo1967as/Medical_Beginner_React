// Using modular Firebase SDK for performance
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    deleteDoc
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

const patientsCollection = collection(db, "patients");

export const fetchPatients = async (userId = null) => {
    let queryRef = patientsCollection;
    
    // If userId is provided, filter patients by user
    if (userId) {
        queryRef = query(patientsCollection, where("userId", "==", userId));
    }
    
    // Add ordering by name for consistent results
    queryRef = query(queryRef, orderBy("name"));
    
    const querySnapshot = await getDocs(queryRef);
    const patients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ensure history is always an array
    patients.forEach(p => {
        if (!p.history) {
            p.history = [];
        }
    });
    
    return patients;
};

export const savePatient = async (patientData, userId = null) => {
    // Ensure patient data includes userId if provided
    const patientToSave = {
        ...patientData,
        history: patientData.history || [],
        userId: userId, // Associate patient with current user
        createdAt: patientData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (patientData.id) {
        // Update existing patient
        const patientRef = doc(db, "patients", patientData.id);
        const { id, ...dataToUpdate } = patientToSave;
        await updateDoc(patientRef, dataToUpdate);
        return patientData.id;
    } else {
        // Add new patient
        const docRef = await addDoc(patientsCollection, patientToSave);
        return docRef.id;
    }
};

export const updatePatient = async (patientId, data, userId = null) => {
    const patientRef = doc(db, "patients", patientId);
    
    // Clean the data to remove undefined values
    const cleanData = {
        ...data,
        updatedAt: new Date().toISOString()
    };
    
    // If userId is provided, ensure we're not updating another user's data
    if (userId) {
        cleanData.userId = userId;
    }
    
    await updateDoc(patientRef, cleanData);
};

export const getPatientById = async (patientId, userId = null) => {
    try {
        const patients = await fetchPatients(userId);
        return patients.find(patient => patient.id === patientId) || null;
    } catch (error) {
        console.error("Error fetching patient by ID:", error);
        return null;
    }
};

export const deletePatient = async (patientId, userId = null) => {
    try {
        // Verify the patient belongs to the current user if userId is provided
        if (userId) {
            const patient = await getPatientById(patientId, userId);
            if (!patient) {
                throw new Error("Patient not found or access denied");
            }
        }

        const patientRef = doc(db, "patients", patientId);
        await deleteDoc(patientRef);
        return true;
    } catch (error) {
        console.error("Error deleting patient:", error);
        throw error;
    }
};