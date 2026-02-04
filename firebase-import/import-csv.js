import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import csv from 'csv-parser';
import iconv from 'iconv-lite';

// ==================== CONFIGURATION FIREBASE ====================
const firebaseConfig = {
    apiKey: "AIzaSyC7jLRqJa2RXlGVJjxZ-xHTAtKKYRy-HZA",
    authDomain: "recensement-sinistres2.firebaseapp.com",
    projectId: "recensement-sinistres2",
    storageBucket: "recensement-sinistres2.firebasestorage.app",
    messagingSenderId: "682456219157",
    appId: "1:682456219157:web:b55f62247a3e427811581c"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== CONFIGURATION ====================
const FICHIER_CSV = 'data.csv';
const NOM_COLLECTION = 'victims';

// ==================== UTILITAIRES ====================

/**
 * Nettoie la collection Firestore pour repartir sur une base saine
 */
async function nettoyerBase() {
    console.log(`🧹 Nettoyage de la collection "${NOM_COLLECTION}"...`);
    const querySnapshot = await getDocs(collection(db, NOM_COLLECTION));

    if (querySnapshot.empty) {
        console.log("ℹ️ La collection est déjà vide.");
        return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ ${querySnapshot.size} documents supprimés. Base nettoyée !`);
}

// ==================== IMPORT CSV → FIREBASE ====================
async function importerDonnees() {
    try {
        // 1. Nettoyage optionnel (décommentez si vous voulez TOUT supprimer avant d'importer)
        await nettoyerBase();

        console.log(`📂 Lecture du fichier ${FICHIER_CSV} (Encodage: Windows-1252)...`);

        const resultats = [];

        // Lecture avec support des accents (iconv-lite)
        fs.createReadStream(FICHIER_CSV)
            .pipe(iconv.decodeStream('win1252')) // Correction de l'encodage pour é, à, etc.
            .pipe(csv({ separator: ';' }))
            .on('data', (data) => resultats.push(data))
            .on('end', async () => {
                console.log(`📦 ${resultats.length} lignes trouvées. Début de l'import...`);

                let compteur = 0;

                for (const item of resultats) {
                    // Mapping des données
                    const victimData = {
                        timestamp: String(item.Timestamp || Date.now()),
                        nom: String(item.Nom || '').trim(),
                        prenoms: String(item.Prenoms || item.Prénoms || '').trim(),
                        dateNaissance: String(item["Date de naissance"] || '').trim(),
                        // Nettoyage strict du CIN : on ne garde que les chiffres pour éviter l'encodage ''
                        cin: String(item.CIN || '').replace(/\D/g, ''),
                        nombre: parseInt(item.Nombre || item.NOMBRE || 0),
                        arrondissement: String(item.Arrondissement || '').trim(),
                        fokontany: String(item.Fokontany || '').trim(),
                        checked: false,
                        lastModified: new Date().toISOString()
                    };

                    // Utiliser le CIN comme ID s'il existe (propre), sinon générer un ID
                    const docId = victimData.cin || `victim_${compteur}_${Date.now()}`;

                    try {
                        await setDoc(doc(db, NOM_COLLECTION, docId), victimData);
                        compteur++;

                        if (compteur % 50 === 0) {
                            console.log(`✅ ${compteur}/${resultats.length} importés`);
                        }
                    } catch (err) {
                        console.error(`❌ Erreur sur la ligne ${compteur}:`, err.message);
                    }
                }

                console.log(`\n🎉 IMPORT TERMINÉ ! ${compteur} documents importés avec succès.`);
                process.exit(0);
            })
            .on('error', (err) => {
                console.error('❌ Erreur de lecture CSV:', err.message);
            });

    } catch (err) {
        console.error('❌ Erreur générale:', err.message);
        process.exit(1);
    }
}

importerDonnees();
