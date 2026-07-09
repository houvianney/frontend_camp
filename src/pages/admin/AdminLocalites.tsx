import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface Localite {
  id: string;
  nom: string;
  description?: string;
}

export default function AdminLocalites() {
  const [localites, setLocalites] = useState<Localite[]>([]);
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string>('');

  async function charger() {
    const { data } = await api.get<Localite[]>('/localites');
    setLocalites(data);
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await api.post('/localites', { nom, description });
    setNom('');
    setDescription('');
    setMessage('Localité créée avec succès.');
    await charger();
  }

  async function supprimer(id: string) {
    if (!window.confirm('Supprimer cette localité ?')) return;
    try {
      await api.delete(`/localites/${id}`);
      setMessage('Localité supprimée.');
      await charger();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Impossible de supprimer cette localité.');
    }
  }

  return (
    <PageLayout title="Gestion des localités">
      <section className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Ajouter une localité</h2>
        <p className="small-text">Créez une localité pour rattacher les responsables et participants.</p>
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleSubmit} className="form-row">
          <label>
            Nom
            <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </label>
          <label>
            Description
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">
            Créer la localité
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="section-title">Localités existantes</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {localites.map((localite) => (
              <tr key={localite.id}>
                <td>{localite.nom}</td>
                <td>{localite.description || '—'}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => supprimer(localite.id)} title="Supprimer">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageLayout>
  );
}
