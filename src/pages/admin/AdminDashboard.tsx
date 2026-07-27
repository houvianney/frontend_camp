import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface StatLocalite {
  id: string;
  nom: string;
  participantCount: number;
  enseignantCount: number;
  staffCount: number;
  volontaireCount: number;
  totalCount: number;
  totalInscrits: number;
  valides: number;
  enAttente: number;
  montantCollecte: number;
  isSummaryRow?: boolean;
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

type ParticipantSortField = 'nom' | 'prenom' | 'sexe' | 'typeParticipant' | 'localite';

interface SortState {
  field: ParticipantSortField;
  direction: 'asc' | 'desc';
}

export default function AdminDashboard() {
  const [localites, setLocalites] = useState<StatLocalite[]>([]);
  const [ressources, setRessources] = useState<StatRessource[]>([]);
  const [selectedRessource, setSelectedRessource] = useState<StatRessource | null>(null);
  const [participants, setParticipants] = useState<RessourceParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantSortState, setParticipantSortState] = useState<SortState>({ field: 'nom', direction: 'asc' });
  const [selectedLocaliteId, setSelectedLocaliteId] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'stats' | 'resources'>('stats');

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
      setParticipantSortState({ field: 'nom', direction: 'asc' });
      setSelectedLocaliteId('');
      setSelectedType('');
    } catch (err) {
      console.error('Erreur chargement participants ressource', err);
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  }

  function handleParticipantSort(field: ParticipantSortField) {
    setParticipantSortState((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  const localiteOptions = useMemo(() => {
    return Array.from(
      new Set(participants
        .map((participant) => participant.localite?.nom)
        .filter(Boolean) as string[]),
    ).sort((a, b) => a.localeCompare(b));
  }, [participants]);

  const typeOptions = useMemo(() => {
    return Array.from(
      new Set(participants
        .map((participant) => participant.typeParticipant)
        .filter(Boolean) as string[]),
    ).sort((a, b) => a.localeCompare(b));
  }, [participants]);

  const sortedParticipants = useMemo(() => {
    let items = [...participants];

    if (selectedLocaliteId) {
      items = items.filter((participant) => participant.localite?.id === selectedLocaliteId);
    }

    if (selectedType) {
      items = items.filter((participant) => participant.typeParticipant === selectedType);
    }

    return items.sort((a, b) => {
      const getValue = (participant: RessourceParticipant) => {
        switch (participantSortState.field) {
          case 'nom':
            return (participant.nom || '').toLowerCase();
          case 'prenom':
            return (participant.prenom || '').toLowerCase();
          case 'sexe':
            return (participant.sexe || '').toLowerCase();
          case 'typeParticipant':
            return (participant.typeParticipant || '').toLowerCase();
          case 'localite':
            return (participant.localite?.nom || '').toLowerCase();
          default:
            return '';
        }
      };

      const left = getValue(a);
      const right = getValue(b);
      if (left < right) return participantSortState.direction === 'asc' ? -1 : 1;
      if (left > right) return participantSortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [participants, participantSortState, selectedLocaliteId, selectedType]);

  return (
    <PageLayout
      title="Tableau de bord — Admin"
      
    >
      

      <div className="section-switcher" role="tablist" aria-label="Choix de vue">
        <button
          type="button"
          className={`switch-btn ${activeView === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveView('stats')}
        >
          Statistiques
        </button>
        <button
          type="button"
          className={`switch-btn ${activeView === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveView('resources')}
        >
          Ressources distribuées
        </button>
      </div>

      {activeView === 'stats' ? (
        <section className="card" style={{ marginBottom: 24 }}>
          <h2 className="section-title">Statistiques par ville</h2>
          <p className="small-text">Vue temps réel des inscriptions et des montants collectés.</p>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Localité</th>
                  <th>Participant</th>
                  <th>Enseignant</th>
                  <th>Staff</th>
                  <th>Total</th>
                  <th>Montant collecté</th>
                </tr>
              </thead>
              <tbody>
                {localites.map((l) => (
                  <tr key={l.id} className={l.isSummaryRow ? 'table-summary-row' : ''}>
                    <td>{l.nom}</td>
                    {l.id === 'volontaires-summary' ? (
                      <>
                        <td>—</td>
                        <td>—</td>
                        <td>—</td>
                        <td>{l.totalCount}</td>
                        <td>{l.montantCollecte.toLocaleString('fr-FR')} FCFA</td>
                      </>
                    ) : (
                      <>
                        <td>{l.participantCount}</td>
                        <td>{l.enseignantCount}</td>
                        <td>{l.staffCount}</td>
                        <td>{l.totalCount}</td>
                        <td>{l.montantCollecte.toLocaleString('fr-FR')} FCFA</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="card" style={{ marginBottom: 24 }}>
          <h2 className="section-title">Ressources distribuées</h2>
          <p className="small-text">Suivi par type de ressource (repas / t-shirt / présence).</p>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Ressource</th>
                  <th>Type</th>
                  <th>Total distribué</th>
                  <th>Action</th>
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
      )}

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
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <label className="field" style={{ minWidth: 180, margin: 0 }}>
                  <span className="field-label">Localité</span>
                  <select className="select" value={selectedLocaliteId} onChange={(e) => setSelectedLocaliteId(e.target.value)}>
                    <option value="">Toutes les localités</option>
                    {participants
                      .map((p) => p.localite)
                      .filter((l): l is RessourceParticipant['localite'] => Boolean(l))
                      .filter((value, index, self) => self.findIndex((item) => item?.id === value?.id) === index)
                      .sort((a, b) => (a?.nom || '').localeCompare(b?.nom || ''))
                      .map((localite) => (
                        <option key={localite?.id} value={localite?.id || ''}>
                          {localite?.nom}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="field" style={{ minWidth: 180, margin: 0 }}>
                  <span className="field-label">Type</span>
                  <select className="select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="">Tous les types</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <button type="button" className="sortable-header" onClick={() => handleParticipantSort('nom')}>
                          Nom {participantSortState.field === 'nom' ? (participantSortState.direction === 'asc' ? '↑' : '↓') : ''}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="sortable-header" onClick={() => handleParticipantSort('prenom')}>
                          Prénom {participantSortState.field === 'prenom' ? (participantSortState.direction === 'asc' ? '↑' : '↓') : ''}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="sortable-header" onClick={() => handleParticipantSort('sexe')}>
                          Sexe {participantSortState.field === 'sexe' ? (participantSortState.direction === 'asc' ? '↑' : '↓') : ''}
                        </button>
                      </th>
                      <th>Âge</th>
                      <th>
                        <button type="button" className="sortable-header" onClick={() => handleParticipantSort('typeParticipant')}>
                          Type {participantSortState.field === 'typeParticipant' ? (participantSortState.direction === 'asc' ? '↑' : '↓') : ''}
                        </button>
                      </th>
                      <th>Type staff</th>
                      <th>
                        <button type="button" className="sortable-header" onClick={() => handleParticipantSort('localite')}>
                          Localité {participantSortState.field === 'localite' ? (participantSortState.direction === 'asc' ? '↑' : '↓') : ''}
                        </button>
                      </th>
                      <th>Contact</th>
                      <th>Téléphone</th>
                      <th>Email</th>
                      <th>Reçu le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParticipants.map((p) => (
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
          </>
          )}
        </section>
      )}
      {loading && <p>Chargement des statistiques...</p>}
    </PageLayout>
  );
}
