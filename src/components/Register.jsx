import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

const Register = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setLoading(true);
        try {
            await register(email, password);
        } catch (err) {
            console.error("Registration failed", err);
            let msg = "Échec de l'inscription.";
            if (err.code === 'auth/email-already-in-use') {
                msg = "Cet email est déjà utilisé.";
            } else if (err.code === 'auth/weak-password') {
                msg = "Le mot de passe est trop faible.";
            } else if (err.code === 'auth/invalid-email') {
                msg = "L'adresse email est invalide.";
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Inscription</h2>
                <p>Créer un nouveau compte</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="exemple@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Au moins 6 caractères"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmer le mot de passe</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Inscription...' : "S'inscrire"}
                    </button>
                </form>

                <div className="auth-switch">
                    <p>Déjà un compte ? <button onClick={onSwitchToLogin} className="link-btn">Se connecter</button></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
