import { useEffect } from 'react';
import './VerificationDialog.css';

const VerificationDialog = ({ victim, onConfirm }) => {
    useEffect(() => {
        if (!victim) return;

        const text = `${victim.nom} ${victim.prenoms || ''} est enregistré`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;

        // Find a French voice if available
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
        if (frenchVoice) {
            utterance.voice = frenchVoice;
        }

        window.speechSynthesis.speak(utterance);

        // Auto-confirm after a short delay (e.g., 2.5 seconds)
        const timer = setTimeout(() => {
            onConfirm();
        }, 2500);

        return () => {
            clearTimeout(timer);
            window.speechSynthesis.cancel();
        };
    }, [victim, onConfirm]);

    if (!victim) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog-content">
                <div className="dialog-icon-wrapper">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <h2>Enregistrement réussi</h2>
                <p className="victim-name-display">
                    <strong>{victim.nom} {victim.prenoms}</strong>
                </p>
                <p className="status-text">est enregistré</p>

                <button onClick={onConfirm} className="dialog-close-btn">
                    Continuer
                </button>
            </div>
        </div>
    );
};

export default VerificationDialog;
