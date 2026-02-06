import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    collection,
    doc,
    updateDoc,
    query,
    orderBy,
    where,
    limit,
    startAfter,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { db, VICTIMS_COLLECTION } from '../services/firebase';

export const useVictims = (user) => {
    const [victims, setVictims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('todo'); // 'todo' or 'verified'
    const [searchQuery, setSearchQuery] = useState('');
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const PAGE_SIZE = 20;

    const fetchVictims = useCallback(async (isLoadMore = false) => {
        try {
            setLoading(true);

            let q = query(
                collection(db, VICTIMS_COLLECTION),
                where('checked', '==', filterStatus === 'verified'),
                orderBy('nom'),
                limit(PAGE_SIZE)
            );

            if (isLoadMore && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);

            const newVictims = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (isLoadMore) {
                setVictims(prev => [...prev, ...newVictims]);
            } else {
                setVictims(newVictims);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching victims:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [filterStatus, lastDoc]);

    // Initial load and filter change
    useEffect(() => {
        setLastDoc(null);
        setVictims([]);
        fetchVictims(false);
    }, [filterStatus]);

    const filteredVictims = useMemo(() => {
        if (!searchQuery.trim()) return victims;
        const term = searchQuery.toLowerCase();
        return victims.filter(v =>
            v.nom?.toLowerCase().includes(term) ||
            v.prenoms?.toLowerCase().includes(term) ||
            v.cin?.toLowerCase().includes(term)
        );
    }, [victims, searchQuery]);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchVictims(true);
        }
    };

    const toggleChecked = async (victimId, currentStatus) => {
        try {
            const victimRef = doc(db, VICTIMS_COLLECTION, victimId);
            await updateDoc(victimRef, {
                checked: !currentStatus,
                lastModified: new Date().toISOString()
            });

            // Optimistic update
            setVictims(prev => prev.filter(v => v.id !== victimId));
        } catch (err) {
            console.error('Error updating victim:', err);
            throw err;
        }
    };

    return {
        victims: filteredVictims,
        loading,
        error,
        toggleChecked,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        loadMore,
        hasMore
    };
};
