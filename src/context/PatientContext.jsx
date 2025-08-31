import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { fetchPatients, savePatient, updatePatient, deletePatient } from '../services/firebaseService';
import { useAuth } from './UserContext';

const PatientContext = createContext();

export const usePatients = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientToEdit, setPatientToEdit] = useState(null);
    const { getCurrentUserId } = useAuth();

    const loadPatients = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const userId = getCurrentUserId();
            const patientData = await fetchPatients(userId);
            setPatients(patientData);
        } catch (err) {
            setError("Failed to load patient data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [getCurrentUserId]);

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
            const userId = getCurrentUserId();
            const savedId = await savePatient(patientData, userId);
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
            // Get current user ID
            const userId = getCurrentUserId();
            if (!userId) {
                throw new Error("No authenticated user found");
            }
            
            // Generate unique operation ID for tracking
            const operationId = `update_${patientId}_${Date.now()}`;
            console.log(`🔄 [PatientContext] Starting history update ${operationId}`);
            
            // Deep clean the data to remove undefined values
            const deeplyCleanedHistory = JSON.parse(JSON.stringify(newHistory));
            
            // Update Firestore first
            await updatePatient(patientId, { history: deeplyCleanedHistory }, userId);
            
            // Update local state immediately
            setPatients(prevPatients => 
                prevPatients.map(p => 
                    p.id === patientId ? { ...p, history: deeplyCleanedHistory } : p
                )
            );
            
            setSelectedPatient(prevPatient => 
                prevPatient && prevPatient.id === patientId 
                    ? { ...prevPatient, history: deeplyCleanedHistory } 
                    : prevPatient
            );
            
            console.log(`✅ [PatientContext] Successfully completed history update ${operationId}`);
        } catch (err) {
            console.error('❌ [PatientContext] Error updating patient history:', err);
            setError("Failed to update consultation history.");
            throw err; // Re-throw for component-level error handling
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

    const handleDeletePatient = async (patientId) => {
        try {
            setLoading(true);
            const userId = getCurrentUserId();
            await deletePatient(patientId, userId);
            await loadPatients(); // Reload patients after deletion
            if (selectedPatient?.id === patientId) {
                setSelectedPatient(null);
            }
        } catch (err) {
            setError("Failed to delete patient.");
            console.error(err);
        } finally {
            setLoading(false);
        }
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
        handleDeletePatient,
        openModal,
        closeModal
    };

    return (
        <PatientContext.Provider value={value}>
            {children}
        </PatientContext.Provider>
    );
};