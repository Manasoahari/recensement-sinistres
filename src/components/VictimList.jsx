import VictimItem from './VictimItem';
import './VictimList.css';

const VictimList = ({ victims, loading, onToggleChecked }) => {
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des données...</p>
            </div>
        );
    }

    if (victims.length === 0) {
        return (
            <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <path d="M32 56c13.255 0 24-10.745 24-24S45.255 8 32 8 8 18.745 8 32s10.745 24 24 24z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M32 20v16m0 8h.02" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <h3>Aucun sinistré trouvé</h3>

            </div>
        );
    }

    return (
        <div className="victim-list">
            <div className="list-header">
                <h2>{victims.length} sinistré{victims.length > 1 ? 's' : ''}</h2>
                <span className="checked-count">
                    {victims.filter(v => v.checked).length} vérifié{victims.filter(v => v.checked).length > 1 ? 's' : ''}
                </span>
            </div>

            <div className="victims-grid">
                {victims.map((victim) => (
                    <VictimItem
                        key={victim.id}
                        victim={victim}
                        onToggleChecked={onToggleChecked}
                    />
                ))}
            </div>
        </div>
    );
};

export default VictimList;
