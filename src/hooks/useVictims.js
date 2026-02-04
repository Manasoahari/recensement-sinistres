import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { db, VICTIMS_COLLECTION } from '../services/firebase';

/**
 * Custom hook for managing victims data with Firebase
 * Provides real-time synchronization and CRUD operations
 */
export const useVictims = () => {
    const [victims, setVictims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Set up real-time listener
        const q = query(collection(db, VICTIMS_COLLECTION), orderBy('nom'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const victimsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setVictims(victimsData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching victims:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []);

    /**
     * Toggle checked status for a victim
     */
    const toggleChecked = async (victimId, currentStatus) => {
        try {
            const victimRef = doc(db, VICTIMS_COLLECTION, victimId);
            await updateDoc(victimRef, {
                checked: !currentStatus,
                lastModified: new Date().toISOString()
            });
        } catch (err) {
            console.error('Error updating victim:', err);
            throw err;
        }
    };

    /**
     * Batch import victims from Excel
     */
    const importVictims = async (victimsData) => {
        try {
            setLoading(true);
            const batch = writeBatch(db);

            victimsData.forEach((victim) => {
                // Sanitize CIN to create a valid Firebase document ID
                // Remove slashes, spaces, and special characters
                const sanitizeCIN = (cin) => {
                    if (!cin) return null;
                    return cin
                        .toString()
                        .replace(/\//g, '_')  // Replace slashes with underscores
                        .replace(/\s+/g, '_')  // Replace spaces with underscores
                        .replace(/[^a-zA-Z0-9_-]/g, '')  // Remove other special chars
                        .substring(0, 100);  // Limit length
                };

                // Use sanitized CIN as document ID if available, otherwise generate one
                const sanitizedCIN = sanitizeCIN(victim.cin);
                const docId = sanitizedCIN || `victim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const victimRef = doc(db, VICTIMS_COLLECTION, docId);

                // Remove the id field from victim data as we use it as document ID
                const { id, ...victimData } = victim;

                batch.set(victimRef, victimData, { merge: true });
            });

            await batch.commit();
            setLoading(false);
            return { success: true, count: victimsData.length };
        } catch (err) {
            console.error('Error importing victims:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    return {
        victims,
        loading,
        error,
        toggleChecked,
        importVictims
    };
};
