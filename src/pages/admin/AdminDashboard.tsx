import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface StatLocalite {
  id: string;
  nom: string;
  totalInscrits: number;
  valides: number;
  enAttente: number;
  montantCollecte: number;
}

interface StatRessource {
  id: string;
  code: string;
  libelle: string;
  type: string;
  totalDistribue: number;
}

interface RessourceParticipant {
  id: string;
  nom: string;
  prenom: string;
  age?: number | null;
  sexe?: string | null;
  profession?: string | null;
  adresse?: string | null;
  contact?: string | null;
  telephone?: string | null;
  email?: string | null;
  typeParticipant?: string | null;
  typeStaff?: string | null;
  localite?: { id?: string; nom?: string } | null;
  scannedAt?: string;
}

export default function AdminDashboard() {
  const [localites, setLocalites] = useState<StatLocalite[]>([]);
  const [ressources, setRessources] = useState<StatRessource[]>([]);
  const [selectedRessource, setSelectedRessource] = useState<StatRessource | null>(null);
  const [participants, setParticipants] = useState<RessourceParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  async function charger() {
    setLoading(true);
    const [localitesRes, ressourcesRes] = await Promise.all([
      api.get('/localites/stats'),
      api.get('/ressources/stats'),
    ]);
    setLocalites(localitesRes.data);
    setRessources(ressourcesRes.data);
    setLoading(false);
  }

  useEffect(() => {
    charger();
  }, []);

  async function afficherParticipants(ressource: StatRessource) {
    setSelectedRessource(ressource);
    setParticipantsLoading(true);
    try {
      const { data } = await api.get<RessourceParticipant[]>(`/ressources/${ressource.id}/participants`);
      setParticipants(data);
    } catch (err) {
      console.error('Erreur chargement participants ressource', err);
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  }

  return (
    <PageLayout
      title="Tableau de bord — Admin"
      
    >
      

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <section className="card">
          <h2 className="section-title">Statistiques par localité</h2>
          <p className="small-text">Vue temps réel des inscriptions et des montants collectés.</p>
          <div className="card" style={{ padding: 0, boxShadow: 'none', border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Localité</th>
                  <th>Inscrits</th>
                  <th>Validés</th>
                  <th>En attente</th>
                  <th>Montant collecté</th>
                </tr>
              </thead>
              <tbody>
                {localites.map((l) => (
                  <tr key={l.id}>
                    <td>{l.nom}</td>
                    <td>{l.totalInscrits}</td>
                    <td>{l.valides}</td>
                    <td>{l.enAttente}</td>
                    <td>{l.montantCollecte.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Ressources distribuées</h2>
          <p className="small-text">Suivi par type de ressource (repas / t-shirt / présence).</p>
          <div className="card" style={{ padding: 0, boxShadow: 'none', border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ressource</th>
                  <th>Type</th>
                  <th>Total distribué</th>
                </tr>
              </thead>
              <tbody>
                {ressources.map((r) => (
                  <tr key={r.id}>
                    <td>{r.libelle}</td>
                    <td>{r.type}</td>
                    <td>{r.totalDistribue}</td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => afficherParticipants(r)}>
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedRessource && (
        <section className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 className="section-title">Participants pour {selectedRessource.libelle}</h2>
              <p className="small-text">Total distribué : {selectedRessource.totalDistribue}. Appuyez sur Voir pour afficher la liste complète.</p>
            </div>
            <button className="btn" onClick={() => setSelectedRessource(null)}>
              Fermer
            </button>
          </div>
          {participantsLoading ? (
            <p>Chargement des participants…</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Sexe</th>
                    <th>Âge</th>
                    <th>Type</th>
                    <th>Type staff</th>
                    <th>Localité</th>
                    <th>Contact</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Reçu le</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nom}</td>
                      <td>{p.prenom}</td>
                      <td>{p.sexe || '—'}</td>
                      <td>{p.age ?? '—'}</td>
                      <td>{p.typeParticipant || '—'}</td>
                      <td>{p.typeStaff || '—'}</td>
                      <td>{p.localite?.nom || '—'}</td>
                      <td>{p.contact || '—'}</td>
                      <td>{p.telephone || '—'}</td>
                      <td>{p.email || '—'}</td>
                      <td>{p.scannedAt ? new Date(p.scannedAt).toLocaleString('fr-FR') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      {loading && <p>Chargement des statistiques...</p>}
    </PageLayout>
  );
}
