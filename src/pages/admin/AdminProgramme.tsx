import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface ProgrammeItem {
  id: string;
  jour: number;
  heureDebut: string;
  heureFin?: string;
  titre: string;
  lieu?: string;
  description?: string;
}

export default function AdminProgramme() {
  const [items, setItems] = useState<ProgrammeItem[]>([]);
  const [jour, setJour] = useState(1);
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [titre, setTitre] = useState('');
  const [lieu, setLieu] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  async function charger() {
    const { data } = await api.get<ProgrammeItem[]>('/programme');
    setItems(data);
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await api.post('/programme', {
      jour,
      heureDebut,
      heureFin: heureFin || undefined,
      titre,
      lieu: lieu || undefined,
      description: description || undefined,
    });
    setTitre('');
    setHeureDebut('');
    setHeureFin('');
    setLieu('');
    setDescription('');
    setMessage('Événement ajouté au programme.');
    charger();
  }

  return (
    <PageLayout title="Gestion du programme">
      <section className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Ajouter un créneau</h2>
        <p className="small-text">Entrez les horaires et le contenu du programme.</p>
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleSubmit} className="form-row">
          <label>
            Jour
            <input
              className="input"
              type="number"
              min={1}
              value={jour}
              onChange={(e) => setJour(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Heure début
            <input className="input" type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} required />
          </label>
          <label>
            Heure fin
            <input className="input" type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} />
          </label>
          <label>
            Titre
            <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} required />
          </label>
          <label>
            Lieu
            <input className="input" value={lieu} onChange={(e) => setLieu(e.target.value)} />
          </label>
          <label>
            Description
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </label>
          <button className="btn btn-primary" type="submit">
            Ajouter au programme
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="section-title">Programme actuel</h2>
        {items.length === 0 ? (
          <p>Aucun élément de programme.</p>
        ) : (
          <div className="grid">
            {items.map((item) => (
              <div key={item.id} className="card" style={{ padding: 18 }}>
                <p className="small-text">Jour {item.jour} • {item.heureDebut}{item.heureFin ? ` - ${item.heureFin}` : ''}</p>
                <h3>{item.titre}</h3>
                {item.lieu && <p className="small-text">Lieu: {item.lieu}</p>}
                {item.description && <p>{item.description}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
}
