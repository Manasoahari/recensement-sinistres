import { useState } from 'react';
import { importFromExcel } from '../services/excelService';
import './ImportButton.css';

const ImportButton = ({ onImport }) => {
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validExtensions = ['.xlsb', '.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            alert('Format de fichier non valide. Veuillez sélectionner un fichier Excel (.xlsb, .xlsx, .xls)');
            return;
        }

        setImporting(true);
        setProgress('Lecture du fichier...');

        try {
            // Parse Excel file
            const victims = await importFromExcel(file);

            setProgress(`${victims.length} enregistrements trouvés. Importation...`);

            // Import to Firebase
            const result = await onImport(victims);

            setProgress(`✓ ${result.count} sinistrés importés avec succès!`);

            // Reset after 3 seconds
            setTimeout(() => {
                setProgress(null);
                setImporting(false);
            }, 3000);

        } catch (error) {
            console.error('Import error:', error);
            alert(`Erreur lors de l'importation: ${error.message}`);
            setProgress(null);
            setImporting(false);
        }

        // Reset file input
        e.target.value = '';
    };

    return (
        <div className="import-button-container">
            <label className={`import-button ${importing ? 'importing' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 14V4m0 10l-4-4m4 4l4-4M4 16h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{importing ? 'Importation...' : 'Importer Excel'}</span>
                <input
                    type="file"
                    accept=".xlsb,.xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={importing}
                    style={{ display: 'none' }}
                />
            </label>
            {progress && (
                <div className="import-progress">
                    {progress}
                </div>
            )}
        </div>
    );
};

export default ImportButton;
