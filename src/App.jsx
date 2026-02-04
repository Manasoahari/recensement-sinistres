import { useState, useMemo } from 'react';
import { useVictims } from './hooks/useVictims';
import { db } from './services/firebase';
import SearchBar from './components/SearchBar';
import VictimList from './components/VictimList';
import './App.css';

function App() {
  const { victims, loading, error, toggleChecked, importVictims } = useVictims();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter victims based on search term
  const filteredVictims = useMemo(() => {
    if (!searchTerm.trim()) return victims;

    const term = searchTerm.toLowerCase();
    return victims.filter(victim => {
      return (
        victim.nom?.toLowerCase().includes(term) ||
        victim.prenoms?.toLowerCase().includes(term) ||
        victim.cin?.toLowerCase().includes(term) ||
        victim.arrondissement?.toLowerCase().includes(term) ||
        victim.fokontany?.toLowerCase().includes(term)
      );
    });
  }, [victims, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleImport = async (victimsData) => {
    return await importVictims(victimsData);
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="header-title">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 28c6.627 0 12-5.373 12-12S22.627 4 16 4 4 9.373 4 16s5.373 12 12 12z" stroke="currentColor" strokeWidth="2" />
                <path d="M16 12v8m-4-4h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div>
                <h1>Recensement des Sinistrés</h1>
                <p className="subtitle">Système de gestion et suivi</p>
              </div>
            </div>

          </div>
        </header>

        <main className="app-main">
          {error && (
            <div className="error-banner">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10 6v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Erreur: {error}</span>
            </div>
          )}

          <SearchBar onSearch={handleSearch} />

          <VictimList
            victims={filteredVictims}
            loading={loading}
            onToggleChecked={toggleChecked}
          />
        </main>

        <footer className="app-footer">
          <p>© 2026 Système de Recensement • Mise à jour en temps réel</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
