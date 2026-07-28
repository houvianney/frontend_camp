import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [navigate, user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'La confirmation ne correspond pas au nouveau mot de passe.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      const nextUser = user ? { ...user, passwordMustChange: false } : null;
      updateUser(nextUser);
      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès.' });
      const cameFromLogin = Boolean((location.state as { fromLogin?: boolean } | null)?.fromLogin);
      const targetRoute = user.role === 'CONTROLEUR' ? '/controleur' : user.role === 'RESPONSABLE' ? '/responsable' : user.role === 'ADMIN' || user.role === 'ADMIN_SECONDARY' ? '/admin' : '/';
      window.setTimeout(() => {
        if (cameFromLogin) {
          navigate(targetRoute, { replace: true });
        } else {
          navigate(targetRoute, { replace: true });
        }
      }, 600);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Impossible de changer le mot de passe.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout title="Changer mon mot de passe">
      <section className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2 className="section-title">Sécuriser votre accès</h2>
        <p className="small-text">Ce formulaire s’affiche à la première connexion, puis vous pouvez le réutiliser depuis le menu Paramètres.</p>

        <form onSubmit={handleSubmit} className="form-row">
          <label>
            Ancien mot de passe
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 8,
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                }}
                aria-label={showCurrentPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showCurrentPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.05 10.05 0 0 1 12 19c-5 0-9.27-3-11-7 1.1-2.4 2.96-4.4 5.29-5.66" />
                    <path d="M1 1l22 22" />
                    <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          <label>
            Nouveau mot de passe
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 8,
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                }}
                aria-label={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.05 10.05 0 0 1 12 19c-5 0-9.27-3-11-7 1.1-2.4 2.96-4.4 5.29-5.66" />
                    <path d="M1 1l22 22" />
                    <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          <label>
            Confirmer le nouveau mot de passe
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 8,
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                }}
                aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.05 10.05 0 0 1 12 19c-5 0-9.27-3-11-7 1.1-2.4 2.96-4.4 5.29-5.66" />
                    <path d="M1 1l22 22" />
                    <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
          </button>
        </form>
      </section>
    </PageLayout>
  );
}
