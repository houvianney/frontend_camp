import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface Ressource {
  id: string;
  code: string;
  libelle: string;
  type: string;
}

export default function AdminRessources() {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [code, setCode] = useState('');
  const [libelle, setLibelle] = useState('');
  const [type, setType] = useState<'PRESENCE' | 'TSHIRT' | 'NOURRITURE'>('PRESENCE');
  const [message, setMessage] = useState('');

  async function charger() {
    const { data } = await api.get<Ressource[]>('/ressources');
    setRessources(data);
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await api.post('/ressources', { code, libelle, type });
    setCode('');
    setLibelle('');
    setType('PRESENCE');
    setMessage('Ressource créée avec succès.');
    await charger();
  }

  async function supprimer(id: string) {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      await api.delete(`/ressources/${id}`);
      setMessage('Ressource supprimée.');
      await charger();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Impossible de supprimer cette ressource.');
    }
  }

  return (
    <PageLayout title="Gestion des ressources">
      <section className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Créer une ressource</h2>
        <p className="small-text">Ajoutez les ressources utiles à l’organisation du contrôle. Les jours et créneaux seront gérés côté contrôleur si nécessaire.</p>
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleSubmit} className="form-row">
          <label>
            Code
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} required />
          </label>
          <label>
            Libellé
            <input className="input" value={libelle} onChange={(e) => setLibelle(e.target.value)} required />
          </label>
          <label>
            Type
            <select className="select" value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="PRESENCE">Présence</option>
              <option value="TSHIRT">T-shirt</option>
              <option value="NOURRITURE">Nourriture</option>
            </select>
          </label>
          <button className="btn btn-primary" type="submit">Créer la ressource</button>
        </form>
      </section>

      <section className="card">
        <h2 className="section-title">Ressources existantes</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Libellé</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ressources.map((ressource) => (
              <tr key={ressource.id}>
                <td>{ressource.code}</td>
                <td>{ressource.libelle}</td>
                <td>{ressource.type}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => supprimer(ressource.id)} title="Supprimer">
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
