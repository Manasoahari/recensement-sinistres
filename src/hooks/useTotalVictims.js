import { useState, useEffect, useMemo } from 'react';
import { victimService } from '../services/VictimService';

/**
 * Hook useTotalVictims
 * Consomme le VictimService pour obtenir l'intégralité des données en limitant les quotas.
 */
export const useTotalVictims = () => {
    const [victims, setVictims] = useState(victimService.getData());
    const [loading, setLoading] = useState(!victimService.isLoaded);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('todo');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // S'abonner aux mises à jour du service (mémoire & deltas Firestore)
        const unsubscribeFromService = victimService.subscribe((newData) => {
            setVictims(newData);
            setLoading(false);
        });

        // Lancement du chargement initial (une seule fois par session)
        if (!victimService.isLoaded) {
            victimService.loadAll()
                .then(() => setLoading(false))
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }

        // Activer l'écoute des changements en temps réel (uniquement les modifs)
        const unsubscribeFromFirestore = victimService.subscribeToChanges();

        return () => {
            unsubscribeFromService();
            if (unsubscribeFromFirestore) unsubscribeFromFirestore();
        };
    }, []);

    // Filtrage local ultra-performant (0 lecture Firestore)
    const filteredVictims = useMemo(() => {
        let result = victims.filter(v => v.checked === (filterStatus === 'verified'));

        if (searchQuery.trim()) {
            const term = searchQuery.toLowerCase();
            result = result.filter(v =>
                v.nom?.toLowerCase().includes(term) ||
                v.prenoms?.toLowerCase().includes(term) ||
                v.cin?.toLowerCase().includes(term) ||
                v.arrondissement?.toLowerCase().includes(term) ||
                v.fokontany?.toLowerCase().includes(term)
            );
        }
        return result;
    }, [victims, filterStatus, searchQuery]);

    const toggleChecked = async (victimId, currentStatus) => {
        try {
            // Le service s'occupe de la mise à jour Firestore ET de la mémoire
            await victimService.updateVictimStatus(victimId, !currentStatus);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return {
        victims: filteredVictims,
        loading,
        error,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        toggleChecked
    };
};
