import { collection, getDocs, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db, VICTIMS_COLLECTION } from './firebase';

/**
 * VictimService (Singleton)
 * Gère le chargement unique des données victims par session.
 */
class VictimService {
    constructor() {
        this.victims = [];
        this.isLoaded = false;
        this.subscribers = new Set();
        this.loadingPromise = null;
    }

    /**
     * Charge la collection complète une seule fois.
     * Utilise une promesse pour éviter les appels multiples simultanés.
     */
    async loadAll() {
        if (this.isLoaded) return this.victims;
        if (this.loadingPromise) return this.loadingPromise;

        this.loadingPromise = (async () => {
            try {
                console.log('[VictimService] Chargement initial de la collection...');

                // On récupère tout une seule fois. 
                // Firestore utilisera automatiquement le cache SQLite (Persistence) si disponible.
                const q = query(collection(db, VICTIMS_COLLECTION));
                const snapshot = await getDocs(q);

                this.victims = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                this.isLoaded = true;
                this.notifySubscribers();
                return this.victims;
            } catch (error) {
                console.error('[VictimService] Erreur chargement:', error);
                throw error;
            } finally {
                this.loadingPromise = null;
            }
        })();

        return this.loadingPromise;
    }

    /**
     * S'abonne aux changements (optionnel - pour garder la donnée à jour sans tout relire)
     * Utilise onSnapshot pour ne lire que les DELTAS (coût minimal).
     */
    subscribeToChanges() {
        const q = query(collection(db, VICTIMS_COLLECTION));
        return onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const docData = { id: change.doc.id, ...change.doc.data() };
                if (change.type === "added") {
                    const index = this.victims.findIndex(v => v.id === docData.id);
                    if (index === -1) this.victims.push(docData);
                }
                if (change.type === "modified") {
                    const index = this.victims.findIndex(v => v.id === docData.id);
                    if (index !== -1) this.victims[index] = docData;
                }
                if (change.type === "removed") {
                    this.victims = this.victims.filter(v => v.id !== docData.id);
                }
            });
            this.isLoaded = true;
            this.notifySubscribers();
        });
    }

    async updateVictimStatus(victimId, newChecked) {
        try {
            const victimRef = doc(db, VICTIMS_COLLECTION, victimId);
            await updateDoc(victimRef, {
                checked: newChecked,
                lastModified: new Date().toISOString()
            });
            // La mise à jour de this.victims sera gérée par le listener onSnapshot
        } catch (error) {
            console.error('[VictimService] Erreur mise à jour:', error);
            throw error;
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => callback([...this.victims]));
    }

    getData() {
        return this.victims;
    }
}

export const victimService = new VictimService();
