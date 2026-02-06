# Guide de Configuration Meilisearch

Pour que la recherche globale fonctionne, vous devez disposer d'un serveur Meilisearch et synchroniser vos données Firestore vers celui-ci.

## 1. Hébergement de Meilisearch

Vous avez trois options principales :

*   **Self-hosted (Docker)** : Le plus simple pour tester localement.
    ```bash
    docker run -it --rm -p 7700:7700 -v $(pwd)/meili_data:/meili_data getmeili/meilisearch:latest
    ```
*   **Meilisearch Cloud** : Solution managée (offre gratuite disponible). [meilisearch.com](https://www.meilisearch.com/cloud)
*   **Hébergement VPS** : Installer sur DigitalOcean, AWS, etc.

## 2. Synchronisation Firestore -> Meilisearch

Firestore ne se synchronise pas tout seul. Vous devez pousser vos données vers Meilisearch.

### Option A : Extension Firebase (Recommandé)
Firebase propose une extension officielle pour Meilisearch :
1. Allez dans la [Firebase Console](https://console.firebase.google.com/).
2. Section **Extensions**.
3. Recherchez **"Search with Meilisearch"**.
4. Configurez-la avec l'URL de votre serveur et votre "Master Key".

### Option B : Script de synchronisation manuel
Si vous ne voulez pas d'extension, vous pouvez utiliser un script Node.js qui écoute les changements Firestore (`onSnapshot`) et met à jour l'index Meilisearch.

## 3. Configuration de l'Index

Une fois Meilisearch lancé, assurez-vous que les champs sont bien indexés. Via l'API ou le Dashboard :

*   **Index** : `victims`
*   **Searchable Attributes** : `nom`, `prenoms`, `cin`, `arrondissement`, `fokontany`
*   **Filterable Attributes** : `checked`

## 4. Configuration de l'App (.env.local)

Copiez vos accès dans le fichier `.env.local` du projet :

```env
VITE_MEILISEARCH_HOST="http://votre-url:7700"
VITE_MEILISEARCH_API_KEY="votre_search_key" # Utilisez une clé de recherche (pas la Master Key)
VITE_MEILISEARCH_INDEX="victims"
```

> [!IMPORTANT]
> N'utilisez **JAMAIS** votre `Master Key` dans le frontend. Utilisez toujours une `Default Search Key` générée par Meilisearch pour des raisons de sécurité.
