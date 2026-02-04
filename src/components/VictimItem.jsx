import './VictimItem.css';

const VictimItem = ({ victim, onToggleChecked }) => {
    const handleCheckboxChange = () => {
        onToggleChecked(victim.id, victim.checked);
    };

    return (
        <div className={`victim-item ${victim.checked ? 'checked' : ''}`}>
            <div className="checkbox-wrapper">
                <input
                    type="checkbox"
                    id={`victim-${victim.id}`}
                    checked={victim.checked || false}
                    onChange={handleCheckboxChange}
                    className="victim-checkbox"
                />
                <label htmlFor={`victim-${victim.id}`} className="checkbox-label"></label>
            </div>

            <div className="victim-info">
                <div className="victim-header">
                    <h3 className="victim-name">
                        {victim.nom}
                        {victim.prenoms && <span className="victim-prenoms"> {victim.prenoms}</span>}
                    </h3>
                    <span className="victim-cin">CIN: {victim.cin}</span>
                </div>

                <div className="victim-details">
                    <div className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>Foyer: {victim.nombre || 0}</span>
                    </div>

                    <div className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>{victim.arrondissement}</span>
                    </div>

                    <div className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M3 13.5c1-2.5 2.5-4 5-4s4 1.5 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>{victim.fokontany}</span>
                    </div>

                    {victim.dateNaissance && (
                        <div className="detail-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M2 6h12M5 2v2m6-2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>{victim.dateNaissance}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VictimItem;
