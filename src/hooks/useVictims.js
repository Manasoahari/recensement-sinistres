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
import { meiliClient, VICTIMS_INDEX } from '../services/meilisearch';

export const useVictims = (user) => {
    const [victims, setVictims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('todo'); // 'todo' or 'verified'
    const [searchQuery, setSearchQuery] = useState('');
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // Meilisearch states
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const PAGE_SIZE = 20;

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchVictims = useCallback(async (isLoadMore = false) => {
        // If we are searching, we don't fetch from Firestore here
        if (searchQuery.trim()) return;

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
    }, [filterStatus, lastDoc, searchQuery]);

    // Handle Meilisearch global search
    useEffect(() => {
        const performSearch = async () => {
            const apiKey = import.meta.env.VITE_MEILISEARCH_API_KEY;
            const isConfigured = apiKey && apiKey !== 'YOUR_MEILISEARCH_SEARCH_KEY';

            if (!debouncedQuery.trim() || !isConfigured) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const index = meiliClient.index(VICTIMS_INDEX);
                const response = await index.search(debouncedQuery, {
                    filter: `checked = ${filterStatus === 'verified'}`,
                    limit: PAGE_SIZE
                });

                setSearchResults(response.hits);
                setHasMore(false);
            } catch (err) {
                console.error('Meilisearch error:', err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [debouncedQuery, filterStatus]);

    // Initial load and filter change (only when NOT searching)
    useEffect(() => {
        if (!searchQuery.trim()) {
            setLastDoc(null);
            setVictims([]);
            fetchVictims(false);
        }
    }, [filterStatus, searchQuery]);

    // Local search fallback
    const localSearchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const term = searchQuery.toLowerCase();
        return victims.filter(v =>
            v.nom?.toLowerCase().includes(term) ||
            v.prenoms?.toLowerCase().includes(term) ||
            v.cin?.toLowerCase().includes(term) ||
            v.arrondissement?.toLowerCase().includes(term) ||
            v.fokontany?.toLowerCase().includes(term)
        );
    }, [victims, searchQuery]);

    const displayVictims = useMemo(() => {
        if (searchQuery.trim()) {
            // Use Meilisearch results if available, otherwise fallback to local search
            if (searchResults.length > 0) return searchResults;
            return localSearchResults;
        }
        return victims;
    }, [victims, searchResults, localSearchResults, searchQuery]);

    const loadMore = () => {
        if (!loading && hasMore && !searchQuery.trim()) {
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

            // Optimistic update for both lists
            setVictims(prev => prev.filter(v => v.id !== victimId));
            setSearchResults(prev => prev.filter(v => v.id !== victimId));
        } catch (err) {
            console.error('Error updating victim:', err);
            throw err;
        }
    };

    return {
        victims: displayVictims,
        loading: loading || isSearching,
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
