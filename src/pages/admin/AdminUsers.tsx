import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface Localite {
  id: string;
  nom: string;
}

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  localite?: Localite;
  controleType?: string;
  actif: boolean;
}

type RoleType = 'RESPONSABLE' | 'CONTROLEUR' | 'ADMIN_SECONDARY';

const roleOptions: Array<{ value: RoleType; label: string; description: string; bulletPoints: string[] }> = [
  {
    value: 'RESPONSABLE',
    label: 'Responsable de localité',
    description: 'Peut inscrire et suivre les participants de sa localité.',
    bulletPoints: ['Gestion des inscriptions', 'Suivi des paiements', 'Accès à sa localité'],
  },
  {
    value: 'CONTROLEUR',
    label: 'Contrôleur',
    description: 'Peut valider les passages et les distributions.',
    bulletPoints: ['Validation de présence', 'Gestion des ressources', 'Accès au scanner'],
  },
  {
    value: 'ADMIN_SECONDARY',
    label: 'Admin secondaire',
    description: 'Accède à l’administration complète, sans pouvoir créer de nouveaux administrateurs.',
    bulletPoints: ['Tous les droits d’administration', 'Gestion des utilisateurs et contenus', 'Aucune création d’admin'],
  },
];

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin principal',
  ADMIN_SECONDARY: 'Admin secondaire',
  RESPONSABLE: 'Responsable de localité',
  CONTROLEUR: 'Contrôleur',
};

export default function AdminUsers() {
  const [localites, setLocalites] = useState<Localite[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleType>('RESPONSABLE');
  const [localiteId, setLocaliteId] = useState('');
  const [controleType, setControleType] = useState<'PRESENCE' | 'TSHIRT' | 'NOURRITURE'>('PRESENCE');
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  async function charger() {
    const [localitesRes, usersRes] = await Promise.all([
      api.get<Localite[]>('/localites'),
      api.get<User[]>('/users'),
    ]);
    setLocalites(localitesRes.data);
    setUsers(usersRes.data);
  }

  useEffect(() => {
    charger();
  }, []);

  function resetForm() {
    setNom('');
    setPrenom('');
    setEmail('');
    setTelephone('');
    setPassword('');
    setRole('RESPONSABLE');
    setLocaliteId('');
    setControleType('PRESENCE');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');

    try {
      await api.post('/users', {
        nom,
        prenom,
        email,
        telephone,
        password,
        role,
        localiteId: role === 'RESPONSABLE' ? localiteId : undefined,
        controleType: role === 'CONTROLEUR' ? controleType : undefined,
      });

      resetForm();
      setMessage('Compte créé avec succès.');
      await charger();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Impossible de créer le compte.');
    }
  }

  async function desactiver(id: string) {
    try {
      await api.patch(`/users/${id}/desactiver`);
      setMessage('Utilisateur désactivé.');
      await charger();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'La désactivation a échoué.');
    }
  }

  async function reactiver(id: string) {
    try {
      await api.patch(`/users/${id}/reactiver`);
      setMessage('Utilisateur réactivé.');
      await charger();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'La réactivation a échoué.');
    }
  }

  async function supprimer(id: string) {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage('Utilisateur supprimé.');
      await charger();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'La suppression a échoué.');
    }
  }

  const selectedRole = roleOptions.find((option) => option.value === role);

  return (
    <PageLayout title="Gérer les utilisateurs">
      <section className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Créer un compte</h2>
        <p className="small-text">Ajoutez un administrateur secondaire, un responsable de localité ou un contrôleur avec un profil clair et sécurisé.</p>
        {message && <div className="alert alert-success">{message}</div>}
        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="user-form-wrapper">
          <div className="user-form-grid">
            <div className="form-column">
              <h3>Informations personnelles</h3>
              <div className="field-grid">
                <label className="field">
                  <span className="field-label">Nom</span>
                  <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </label>
                <label className="field">
                  <span className="field-label">Prénom</span>
                  <input className="input" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                </label>
                <label className="field">
                  <span className="field-label">Email</span>
                  <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label className="field">
                  <span className="field-label">Téléphone</span>
                  <input className="input" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                </label>
                <label className="field field-full">
                  <span className="field-label">Mot de passe</span>
                  <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
              </div>
            </div>

            <div className="form-column">
              <h3>Profil et accès</h3>
              <label className="field">
                <span className="field-label">Rôle</span>
                <select className="select" value={role} onChange={(e) => setRole(e.target.value as RoleType)}>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="field-help">{selectedRole?.description}</span>
              </label>

              

              {role === 'RESPONSABLE' && (
                <label className="field">
                  <span className="field-label">Localité</span>
                  <select className="select" value={localiteId} onChange={(e) => setLocaliteId(e.target.value)} required>
                    <option value="">Sélectionnez</option>
                    {localites.map((localite) => (
                      <option key={localite.id} value={localite.id}>
                        {localite.nom}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {role === 'CONTROLEUR' && (
                <label className="field">
                  <span className="field-label">Type de contrôle</span>
                  <select className="select" value={controleType} onChange={(e) => setControleType(e.target.value as any)}>
                    <option value="PRESENCE">Présence</option>
                    <option value="TSHIRT">T-shirt</option>
                    <option value="NOURRITURE">Nourriture</option>
                  </select>
                </label>
              )}

              <button className="btn btn-primary" type="submit">
                Créer le compte
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="section-title">Utilisateurs actifs</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Localité / Contrôle</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.prenom} {user.nom}</td>
                <td>{roleLabels[user.role] || user.role}</td>
                <td>{user.role === 'RESPONSABLE' ? user.localite?.nom : user.controleType}</td>
                <td>{user.email}</td>
                <td>{user.actif ? 'Actif' : 'Désactivé'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {user.actif ? (
                      <button className="btn btn-danger" onClick={() => desactiver(user.id)}>
                        Désactiver
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => reactiver(user.id)}>
                        Réactiver
                      </button>
                    )}
                    <button className="btn btn-danger" onClick={() => supprimer(user.id)} title="Supprimer">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageLayout>
  );
}
