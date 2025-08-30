import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { fetchPatients, savePatient, updatePatient } from '../services/firebaseService';

const PatientContext = createContext();

export const usePatients = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientToEdit, setPatientToEdit] = useState(null);

    const loadPatients = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const patientData = await fetchPatients();
            setPatients(patientData);
        } catch (err) {
            setError("Failed to load patient data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    const selectPatientById = (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        setSelectedPatient(patient || null);
    };

    const handleSavePatient = async (patientData) => {
        try {
            setLoading(true);
            const savedId = await savePatient(patientData);
            await loadPatients(); // Reload all patients to get the latest data
            // If it was a new patient, select them. If it was an edit, re-select to get updated data.
            const newSelectedId = patientData.id || savedId;
            const updatedPatient = patients.find(p => p.id === newSelectedId) || { ...patientData, id: newSelectedId };
            setSelectedPatient(updatedPatient);
            closeModal();
        } catch (err) {
            setError("Failed to save patient.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
        const updatePatientHistory = async (patientId, newHistory) => {
        try {
            // --- START: REVISED FIX ---
            // The JSON.stringify/parse trick is a robust way to deep-clean an object
            // of any `undefined` values, which are not allowed by Firestore.
            // JSON.stringify omits keys with `undefined` values.
            const deeplyCleanedHistory = JSON.parse(JSON.stringify(newHistory));
            // --- END: REVISED FIX ---

            // Now, we are certain that `deeplyCleanedHistory` is clean.
            await updatePatient(patientId, { history: deeplyCleanedHistory });
            
            // Update local state to reflect the change immediately
            setPatients(prevPatients => prevPatients.map(p =>
                p.id === patientId ? { ...p, history: deeplyCleanedHistory } : p
            ));
            setSelectedPatient(prevPatient =>
                prevPatient && prevPatient.id === patientId ? { ...prevPatient, history: deeplyCleanedHistory } : prevPatient
            );
        } catch (err) {
            setError("Failed to update consultation history.");
            console.error(err);
        }
    };

    const openModal = (patient = null) => {
        setPatientToEdit(patient);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPatientToEdit(null);
    };

    const value = {
        patients,
        selectedPatient,
        loading,
        error,
        isModalOpen,
        patientToEdit,
        selectPatientById,
        handleSavePatient,
        updatePatientHistory,
        openModal,
        closeModal
    };

    return (
        <PatientContext.Provider value={value}>
            {children}
        </PatientContext.Provider>
    );
};