import { useState } from 'react';
import { exportToExcel } from '../services/excelService';
import './ExportButton.css';

const ExportButton = ({ victims }) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = () => {
        if (victims.length === 0) {
            alert('Aucune donnée à exporter');
            return;
        }

        setExporting(true);

        try {
            const fileName = exportToExcel(victims);

            // Show success message
            setTimeout(() => {
                setExporting(false);
            }, 1000);

        } catch (error) {
            console.error('Export error:', error);
            alert(`Erreur lors de l'exportation: ${error.message}`);
            setExporting(false);
        }
    };

    return (
        <button
            className={`export-button ${exporting ? 'exporting' : ''}`}
            onClick={handleExport}
            disabled={exporting || victims.length === 0}
        >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v10m0-10l4 4m-4-4L6 8m10 8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{exporting ? 'Exportation...' : `Exporter (${victims.length})`}</span>
        </button>
    );
};

export default ExportButton;
