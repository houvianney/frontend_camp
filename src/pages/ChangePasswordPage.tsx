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
            <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </label>
          <label>
            Nouveau mot de passe
            <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </label>
          <label>
            Confirmer le nouveau mot de passe
            <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
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
