import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const result = await login(email, password);
      if (result.requiresPasswordChange) {
        navigate('/change-password', { state: { fromLogin: true } });
        return;
      }
      navigate('/');
    } catch {
      setError('Identifiants invalides');
    }
  }

  return (
    <div className="page-shell" style={{ maxWidth: 420, margin: '60px auto' }}>
      <div className="card">
        <h1>Connexion</h1>
        <p className="small-text">Accédez à votre espace administrateur, responsable ou contrôleur.</p>

        <form onSubmit={handleSubmit} className="form-row">
          <label>
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
