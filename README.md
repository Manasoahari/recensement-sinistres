# Recensement des Sinistrés

Application web de recensement et suivi des sinistrés avec synchronisation en temps réel.

## 🚀 Fonctionnalités

- ✅ Liste des sinistrés avec informations détaillées
- ✅ Recherche en temps réel (nom, CIN, arrondissement, fokontany)
- ✅ Cases à cocher pour marquer les sinistrés vérifiés
- ✅ Import de fichiers Excel (.xlsb, .xlsx, .xls)
- ✅ Export vers Excel avec statut de vérification
- ✅ Synchronisation en temps réel multi-utilisateurs
- ✅ Interface moderne et responsive
- ✅ Mode sombre avec design premium

## 📋 Prérequis

- Node.js 16+ et npm
- Compte Firebase (gratuit)
- Compte Vercel (gratuit, pour le déploiement)

## 🛠️ Installation

1. **Cloner ou naviguer vers le projet**
   ```bash
   cd "d:\Projet Web\site_web"
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Firebase**
   - Suivez le guide dans `FIREBASE_SETUP.md`
   - Créez un projet Firebase
   - Configurez Firestore
   - Copiez vos clés dans `.env.local`

4. **Lancer en développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir dans le navigateur**
   ```
   http://localhost:5173
   ```

## 📦 Structure du projet

```
site_web/
├── src/
│   ├── components/         # Composants React
│   │   ├── SearchBar.jsx   # Barre de recherche
│   │   ├── ImportButton.jsx # Bouton d'import Excel
│   │   ├── ExportButton.jsx # Bouton d'export Excel
│   │   ├── VictimItem.jsx   # Carte individuelle
│   │   └── VictimList.jsx   # Liste des sinistrés
│   ├── hooks/
│   │   └── useVictims.js    # Hook Firebase
│   ├── services/
│   │   ├── firebase.js      # Configuration Firebase
│   │   └── excelService.js  # Import/Export Excel
│   ├── App.jsx              # Composant principal
│   └── main.jsx             # Point d'entrée
├── .env.local               # Variables d'environnement
├── vercel.json              # Configuration Vercel
└── FIREBASE_SETUP.md        # Guide Firebase
```

## 🔧 Technologies utilisées

- **Frontend**: React 18 + Vite
- **Backend**: Firebase Firestore
- **Styling**: CSS moderne avec glassmorphism
- **Excel**: SheetJS (xlsx)
- **Déploiement**: Vercel

## 📊 Format des données Excel

Colonnes attendues:
- Timestamp
- Nom
- Prénoms (optionnel)
- Date de naissance (optionnel)
- CIN
- Nombre (dans le foyer)
- Arrondissement
- Fokontany

## 🚀 Déploiement sur Vercel

1. **Installer Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Déployer**
   ```bash
   vercel
   ```

3. **Configurer les variables d'environnement**
   - Allez dans Vercel Dashboard > Settings > Environment Variables
   - Ajoutez toutes les variables `VITE_FIREBASE_*`

4. **Redéployer**
   ```bash
   vercel --prod
   ```

## 👥 Utilisation multi-utilisateurs

L'application supporte plusieurs utilisateurs simultanés:
- Les modifications sont synchronisées en temps réel
- Chaque utilisateur voit les mises à jour instantanément
- Les cases cochées se synchronisent automatiquement

## 📝 Utilisation

1. **Importer les données**
   - Cliquez sur "Importer Excel"
   - Sélectionnez votre fichier .xlsb
   - Les données sont automatiquement importées dans Firebase

2. **Rechercher**
   - Utilisez la barre de recherche
   - Recherche par nom, CIN, arrondissement, ou fokontany

3. **Vérifier les sinistrés**
   - Cochez les cases pour marquer comme vérifié
   - Les modifications sont sauvegardées instantanément

4. **Exporter les données**
   - Cliquez sur "Exporter"
   - Un fichier Excel sera téléchargé avec toutes les données
   - Inclut une colonne "Vérifié" (Oui/Non)

## 🔒 Sécurité

⚠️ **Important**: Les règles Firestore par défaut permettent l'accès à tous. Pour la production:
1. Configurez Firebase Authentication
2. Mettez à jour les règles de sécurité Firestore
3. Limitez l'accès aux utilisateurs autorisés

## 🐛 Dépannage

Consultez `FIREBASE_SETUP.md` pour les problèmes courants.

## 📄 Licence

Ce projet est créé pour le recensement des sinistrés.

## 🤝 Support

Pour toute question, consultez la documentation Firebase ou Vercel.
