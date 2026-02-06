import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import './AdminPanel.css';

const AdminPanel = ({ onBack }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort: pending first, then by date
            usersData.sort((a, b) => {
                if (a.isApproved === b.isApproved) return 0;
                return a.isApproved ? 1 : -1;
            });
            setUsers(usersData);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const toggleApproval = async (userId, currentStatus) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                isApproved: !currentStatus
            });
        } catch (err) {
            console.error("Error updating approval status", err);
            alert("Erreur lors de la mise à jour de l'approbation.");
        }
    };

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Changer le rôle en ${newRole} ?`)) return;

        try {
            await updateDoc(doc(db, 'users', userId), {
                role: newRole
            });
        } catch (err) {
            console.error("Error updating role", err);
            alert("Erreur lors de la mise à jour du rôle.");
        }
    };

    return (
        <div className="admin-panel">
            <header className="admin-header">
                <button onClick={onBack} className="back-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Retour au Dashboard
                </button>
                <h2>Gestion des Utilisateurs</h2>
            </header>

            <div className="admin-content">
                {loading ? (
                    <div className="admin-loading">Chargement des utilisateurs...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Date d'inscription</th>
                                <th>Statut</th>
                                <th>Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={user.isApproved ? 'approved' : 'pending'}>
                                    <td>{user.email}</td>
                                    <td>{user.createdAt?.toDate ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${user.isApproved ? 'success' : 'warning'}`}>
                                            {user.isApproved ? 'Approuvé' : 'En attente'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.role === 'admin' ? 'danger' : 'secondary'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                onClick={() => toggleApproval(user.id, user.isApproved)}
                                                className={`approve-btn ${user.isApproved ? 'revoke' : 'approve'}`}
                                            >
                                                {user.isApproved ? 'Révoquer' : 'Approuver'}
                                            </button>
                                            <button
                                                onClick={() => toggleRole(user.id, user.role)}
                                                className="role-btn"
                                            >
                                                Changer Rôle
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
