# Guide Senior : Optimisation des Quotas Firestore

Ce document explique l'implémentation de la stratégie "Load Once" appliquée à votre projet.

## 1. Risques liés au chargement complet
Charger une collection entière n'est pas "mal" en soi, mais devient risqué si :
*   **Volume important** : Charger 100 000 docs consommera votre quota en un seul clic.
*   **Fréquence élevée** : Recharger les données à chaque changement de state ou navigation React multiplie les coûts par le nombre de composants.
*   **Absence de cache** : Sans cache, chaque rafraîchissement (F5) est facturé au plein tarif.

## 2. Solution Implémentée : Le triptyque d'Optimisation

### A. Persistence multi-onglet (Firebase SDK)
Dans `firebase.js`, nous avons activé `persistentLocalCache`. 
*   **Comment ça marche** : Firestore écrit les données dans IndexedDB. 
*   **Gain** : Au prochain chargement, le SDK compare les "snapshots". Si rien n'a changé côté serveur, **0 lecture** n'est facturée pour les documents déjà en cache.

### B. Le Singleton Pattern (VictimService.js)
Nous utilisons une classe unique (`VictimService`) instanciée une seule fois pour toute la durée de vie de l'application.
*   **Pourquoi** : Les données sont stockées dans une variable JavaScript simple (`this.victims`). 
*   **Accès** : L'accès à `this.victims` est instantané (0ms) et gratuit. Contrairement à un state local React, cette donnée survit au démontage des composants.

### C. Le Hook de Consommation (useTotalVictims.js)
Le hook ne déclenche `loadAll()` que si `isLoaded` est faux. 
*   **Sécurité** : Si 5 composants utilisent le hook en même temps, une seule promesse est créée grâce au `loadingPromise` dans le service.

## 3. impact Réel sur les Quotas

Imaginons une collection de **1 000 documents**.

| Scénario | Reads Firestore (Sans optimisation) | Reads Firestore (Avec optimisation) |
| :--- | :--- | :--- |
| **Chargement initial** | 1 000 | 1 000 |
| **Navigation interne** | 1 000 (à chaque mount) | **0** (Lecture mémoire) |
| **Rafraîchissement F5** | 1 000 | **0** (Si aucune modif serveur via Persistence) |
| **Ajout d'1 document** | 0 ou 1 000 (selon logique) | **1** (Via `onSnapshot` delta) |

## 4. Exemple d'utilisation Propre

```javascript
import { useTotalVictims } from './hooks/useTotalVictims';

const MyComponent = () => {
  const { victims, loading } = useTotalVictims();

  if (loading) return <Spinner />;

  // Ici, 'victims' contient toute la base, prête pour filtrage local ultra-rapide
  return (
    <ul>
      {victims.map(v => <li key={v.id}>{v.nom}</li>)}
    </ul>
  );
};
```

## Conclusion
En combinant la **Persistence SDK** (stockage disque), le **Singleton** (stockage mémoire) et le **onSnapshot** (mise à jour par delta), votre application peut gérer des milliers de documents pour le coût d'une seule lecture initiale.
