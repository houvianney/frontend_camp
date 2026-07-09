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

export default function AdminDashboard() {
  const [localites, setLocalites] = useState<StatLocalite[]>([]);
  const [ressources, setRessources] = useState<StatRessource[]>([]);
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {loading && <p>Chargement des statistiques...</p>}
    </PageLayout>
  );
}
