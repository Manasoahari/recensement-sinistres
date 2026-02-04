# Guide de Configuration Firebase

## Étape 1: Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Donnez un nom à votre projet (ex: "recensement-sinistres")
4. Suivez les étapes de configuration

## Étape 2: Créer une application Web

1. Dans votre projet Firebase, cliquez sur l'icône Web (`</>`)
2. Donnez un nom à votre application
3. Cochez "Configurer Firebase Hosting" (optionnel)
4. Cliquez sur "Enregistrer l'application"

## Étape 3: Obtenir les clés de configuration

Vous verrez un objet de configuration qui ressemble à ceci:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Étape 4: Configurer Firestore

1. Dans le menu de gauche, cliquez sur "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Démarrer en mode test" (pour le développement)
   - **Important**: Changez les règles en production!
4. Choisissez une région (ex: europe-west1)

## Étape 5: Configurer les règles de sécurité

Pour le développement, utilisez ces règles (dans Firestore > Règles):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /victims/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANT**: Pour la production, utilisez des règles plus strictes!

## Étape 6: Configurer l'application

1. Ouvrez le fichier `.env.local` dans votre projet
2. Remplacez les valeurs par celles de votre configuration Firebase:

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

## Étape 7: Tester localement

```bash
npm run dev
```

Ouvrez http://localhost:5173 dans votre navigateur.

## Étape 8: Déployer sur Vercel

1. Créez un compte sur [Vercel](https://vercel.com)
2. Installez Vercel CLI (optionnel):
   ```bash
   npm i -g vercel
   ```
3. Déployez:
   ```bash
   vercel
   ```
4. Configurez les variables d'environnement dans Vercel Dashboard:
   - Allez dans Settings > Environment Variables
   - Ajoutez toutes les variables VITE_FIREBASE_*

## Règles de sécurité recommandées pour la production

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /victims/{victimId} {
      // Permettre la lecture à tous
      allow read: if true;
      
      // Permettre l'écriture seulement pour les utilisateurs authentifiés
      // (vous pouvez ajouter Firebase Auth plus tard)
      allow write: if true; // Changez ceci en production!
    }
  }
}
```

## Dépannage

### Erreur de Quota (Quota Exceeded)
Si vous voyez une erreur "Quota Exceeded", cela signifie que vous avez atteint la limite gratuite de Firebase (50 000 lectures par jour).
- **Solution 1 (Attendre)** : Le quota se réinitialise chaque jour à minuit (Heure du Pacifique).
- **Solution 2 (Mise à niveau)** : Passez au plan **"Blaze"** (Pay-as-you-go) dans la console Firebase. C'est toujours gratuit pour un petit usage, mais cela lève les limites strictes du plan gratuit.

### Erreur: "Firebase: Error (auth/api-key-not-valid)"
- Vérifiez que votre API key est correcte dans `.env.local`
- Assurez-vous que les variables commencent par `VITE_`

### Erreur: "Missing or insufficient permissions"
- Vérifiez les règles de sécurité Firestore
- Assurez-vous que la collection "victims" est accessible

### L'application ne se met pas à jour en temps réel
- Vérifiez votre connexion Internet
- Ouvrez la console du navigateur pour voir les erreurs
- Vérifiez que Firestore est bien configuré
