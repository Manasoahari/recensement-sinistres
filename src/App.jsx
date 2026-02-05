import { useState, useMemo } from 'react';
import { useVictims } from './hooks/useVictims';
import { db } from './services/firebase';
import { AuthProvider, useAuth } from './hooks/useAuth';
import SearchBar from './components/SearchBar';
import VictimList from './components/VictimList';
import Login from './components/Login';
import Register from './components/Register';

import './App.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const {
    victims,
    loading,
    error,
    toggleChecked,
    setFilterStatus,
    setSearchQuery,
    loadMore,
    hasMore,
    filterStatus
  } = useVictims(user);

  const handleSearch = (term) => {
    setSearchQuery(term);
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
            <div className="header-user">
              <span className="user-email">{user?.email}</span>
              <button onClick={logout} className="logout-btn">Déconnexion</button>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab-button ${filterStatus === 'todo' ? 'active' : ''}`}
              onClick={() => setFilterStatus('todo')}
            >
              À Vérifier
            </button>
            <button
              className={`tab-button ${filterStatus === 'verified' ? 'active' : ''}`}
              onClick={() => setFilterStatus('verified')}
            >
              Vérifiés
            </button>
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
            victims={victims}
            loading={loading}
            onToggleChecked={toggleChecked}
          />

          {hasMore && !loading && victims.length > 0 && (
            <div className="load-more-container">
              <button onClick={loadMore} className="load-more-button">
                Charger plus...
              </button>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <p>© 2026 Système de Recensement • Mise à jour en temps réel</p>
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  if (user) {
    return <Dashboard />;
  }

  if (isRegistering) {
    return <Register onSwitchToLogin={() => setIsRegistering(false)} />;
  }

  return <Login onSwitchToRegister={() => setIsRegistering(true)} />;
};

export default App;
