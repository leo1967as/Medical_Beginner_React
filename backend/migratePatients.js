// Migration script to add userId to existing patients
import 'dotenv/config';
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
}

const db = admin.firestore();
const patientsCollection = db.collection("patients");

async function migratePatients() {
    try {
        console.log("Starting patient migration...");
        
        // Get all patients without userId
        console.log("Fetching patients without userId...");
        const patientsSnapshot = await patientsCollection.where("userId", "==", null).get();
        
        const patients = [];
        patientsSnapshot.forEach(doc => {
            patients.push({ id: doc.id, ...doc.data() });
        });
        console.log(`Found ${patients.length} patients to migrate`);
        
        if (patients.length === 0) {
            console.log("No patients need migration");
            return;
        }
        
        // Assign a default userId to each patient
        const defaultUserId = "default_user_id"; // This should be replaced with actual user ID
        let migratedCount = 0;
        
        for (const patient of patients) {
            try {
                await patientsCollection.doc(patient.id).update({
                    userId: defaultUserId,
                    updatedAt: new Date().toISOString()
                });
                migratedCount++;
                console.log(`Migrated patient: ${patient.name || patient.id} (${patient.id})`);
            } catch (error) {
                console.error(`Error migrating patient ${patient.id}:`, error);
            }
        }
        
        console.log(`Migration completed. Successfully migrated ${migratedCount} out of ${patients.length} patients`);
        
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit(0);
    }
}

// Run migration
migratePatients();