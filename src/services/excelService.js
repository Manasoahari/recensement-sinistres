import * as XLSX from 'xlsx';

/**
 * Import victims data from Excel (.xlsb) file
 * Maps Excel columns to Firebase structure
 */
/**
 * Helper function to safely convert any value to string
 */
const safeString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (value instanceof Date) return value.toISOString();
    return String(value);
};

/**
 * Helper function to safely get a number value
 */
const safeNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

export const importFromExcel = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // Convert to JSON with raw values
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: false, defval: '' });

                console.log('Données Excel importées:', jsonData.length, 'lignes');
                if (jsonData.length > 0) {
                    console.log('Première ligne:', jsonData[0]);
                }

                // Map Excel columns to Firebase structure
                const victims = jsonData.map((row, index) => {
                    // Normalize keys to lowercase for easier matching
                    const normalizedRow = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.toLowerCase().trim()] = row[key];
                    });

                    // Helper to get value by multiple possible names
                    const getVal = (names) => {
                        for (const name of names) {
                            if (normalizedRow[name.toLowerCase()] !== undefined) {
                                return normalizedRow[name.toLowerCase()];
                            }
                        }
                        return '';
                    };

                    const timestamp = safeString(getVal(['Timestamp', 'Horodatage']) || new Date().toISOString());
                    const nom = safeString(getVal(['Nom']));
                    const prenoms = safeString(getVal(['Prénoms', 'Prenoms'])) || null;
                    const dateNaissance = safeString(getVal(['Date de naissance', 'Naissance'])) || null;
                    const cin = safeString(getVal(['CIN', 'N° CIN']));
                    const nombre = safeNumber(getVal(['Nombre', 'Foyer', 'Nombre dans le foyer']));
                    const arrondissement = safeString(getVal(['Arrondissement']));
                    const fokontany = safeString(getVal(['Fokontany']));

                    return {
                        timestamp: timestamp,
                        nom: nom,
                        prenoms: prenoms,
                        dateNaissance: dateNaissance,
                        cin: cin,
                        nombre: nombre,
                        arrondissement: arrondissement,
                        fokontany: fokontany,
                        checked: false,
                        lastModified: new Date().toISOString(),
                        // Add unique ID based on CIN or index
                        id: cin || `victim_${index}_${Date.now()}`
                    };
                });

                console.log('Victimes converties:', victims.length);
                resolve(victims);
            } catch (error) {
                console.error('Erreur détaillée:', error);
                reject(new Error(`Erreur lors de la lecture du fichier: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Erreur lors de la lecture du fichier'));
        };

        reader.readAsArrayBuffer(file);
    });
};

/**
 * Export victims data to Excel (.xlsx) file
 * Includes all items with their checked status
 */
export const exportToExcel = (victims) => {
    // Map Firebase data to Excel format
    const excelData = victims.map(victim => ({
        'Timestamp': victim.timestamp || '',
        'Nom': victim.nom || '',
        'Prénoms': victim.prenoms || '',
        'Date de naissance': victim.dateNaissance || '',
        'CIN': victim.cin || '',
        'Nombre': victim.nombre || 0,
        'Arrondissement': victim.arrondissement || '',
        'Fokontany': victim.fokontany || '',
        'Vérifié': victim.checked ? 'Oui' : 'Non',
        'Dernière modification': victim.lastModified || ''
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
        { wch: 20 }, // Timestamp
        { wch: 20 }, // Nom
        { wch: 20 }, // Prénoms
        { wch: 15 }, // Date de naissance
        { wch: 15 }, // CIN
        { wch: 10 }, // Nombre
        { wch: 20 }, // Arrondissement
        { wch: 20 }, // Fokontany
        { wch: 10 }, // Vérifié
        { wch: 20 }  // Dernière modification
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sinistrés');

    // Generate file name with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `sinistres_${date}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);

    return fileName;
};
