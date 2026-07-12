import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface Localite {
  id: string;
  nom: string;
}

interface Participant {
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
  membreOng?: boolean | null;
  typeParticipant?: string | null;
  typeStaff?: string | null;
  montantTotal?: number | string | null;
  montantPaye?: number | string | null;
  statut?: 'EN_ATTENTE' | 'VALIDE';
  localite?: { id?: string; nom?: string } | null;
  inscritPar?: { nom?: string; prenom?: string; role?: string } | null;
  createdAt?: string;
}

type SortField = 'nom' | 'prenom' | 'localite' | 'contact' | 'sexe' | 'age' | 'profession' | 'typeParticipant' | 'typeStaff' | 'montantPaye' | 'montantTotal' | 'inscritPar' | 'createdAt' | 'statut';
interface SortState {
  field: SortField;
  direction: 'asc' | 'desc';
}

const sortLabels: Record<SortField, string> = {
  nom: 'Nom',
  prenom: 'Prénom',
  localite: 'Localité',
  contact: 'Contact',
  sexe: 'Sexe',
  age: 'Âge',
  profession: 'Profession',
  typeParticipant: 'Type',
  typeStaff: 'Type staff',
  montantPaye: 'Montant versé',
  montantTotal: 'Montant total',
  inscritPar: 'Agent inscrit',
  createdAt: 'Date d’inscription',
  statut: 'Statut',
};

export default function AdminParticipantsPending() {
  const [attente, setAttente] = useState<Participant[]>([]);
  const [localites, setLocalites] = useState<Localite[]>([]);
  const [selectedPending, setSelectedPending] = useState<string[]>([]);
  const [selectedLocaliteId, setSelectedLocaliteId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortState, setSortState] = useState<SortState>({ field: 'nom', direction: 'asc' });

  async function charger() {
    setLoading(true);
    try {
      const [participantsRes, localitesRes] = await Promise.all([
        api.get('/participants', { params: { statut: 'EN_ATTENTE' } }),
        api.get('/localites'),
      ]);
      setAttente(participantsRes.data);
      setLocalites(localitesRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { charger(); }, []);

  function togglePending(id: string) {
    setSelectedPending((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  function handleSort(field: SortField) {
    setSortState((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  async function valider(id: string) {
    try {
      await api.post(`/participants/${id}/valider`);
      await charger();
    } catch (err) {
      console.error(err);
    }
  }

  async function validerSelection() {
    if (!selectedPending.length) return;
    try {
      await api.post('/participants/valider-many', { participantIds: selectedPending });
      setSelectedPending([]);
      await charger();
    } catch (err) {
      console.error(err);
    }
  }

  function formatValue(value: unknown) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  const sortedParticipants = useMemo(() => {
    let items = [...attente];

    const term = search.trim().toLowerCase();
    if (term) {
      items = items.filter((participant) => {
        const combined = `${participant.nom || ''} ${participant.prenom || ''} ${participant.contact || ''} ${participant.localite?.nom || ''}`.toLowerCase();
        return combined.includes(term);
      });
    }

    if (selectedLocaliteId) {
      const selectedLocalite = localites.find((localite) => localite.id === selectedLocaliteId);
      items = items.filter((participant) => {
        const sameId = participant.localite?.id && selectedLocalite?.id ? participant.localite.id === selectedLocalite.id : false;
        const sameName = participant.localite?.nom && selectedLocalite?.nom ? participant.localite.nom === selectedLocalite.nom : false;
        return sameId || sameName;
      });
    }

    items.sort((a, b) => {
      let left: string | number = '';
      let right: string | number = '';

      switch (sortState.field) {
        case 'nom':
          left = a.nom?.toLowerCase() || '';
          right = b.nom?.toLowerCase() || '';
          break;
        case 'prenom':
          left = a.prenom?.toLowerCase() || '';
          right = b.prenom?.toLowerCase() || '';
          break;
        case 'localite':
          left = a.localite?.nom?.toLowerCase() || '';
          right = b.localite?.nom?.toLowerCase() || '';
          break;
        case 'contact':
          left = a.contact || '';
          right = b.contact || '';
          break;
        case 'sexe':
          left = a.sexe || '';
          right = b.sexe || '';
          break;
        case 'age':
          left = Number(a.age) || 0;
          right = Number(b.age) || 0;
          break;
        case 'profession':
          left = a.profession?.toLowerCase() || '';
          right = b.profession?.toLowerCase() || '';
          break;
        case 'typeParticipant':
          left = a.typeParticipant?.toLowerCase() || '';
          right = b.typeParticipant?.toLowerCase() || '';
          break;
        case 'typeStaff':
          left = a.typeStaff?.toLowerCase() || '';
          right = b.typeStaff?.toLowerCase() || '';
          break;
        case 'montantPaye':
          left = Number(a.montantPaye || 0);
          right = Number(b.montantPaye || 0);
          break;
        case 'montantTotal':
          left = Number(a.montantTotal || 0);
          right = Number(b.montantTotal || 0);
          break;
        case 'inscritPar':
          left = `${a.inscritPar?.prenom || ''} ${a.inscritPar?.nom || ''}`.trim().toLowerCase();
          right = `${b.inscritPar?.prenom || ''} ${b.inscritPar?.nom || ''}`.trim().toLowerCase();
          break;
        case 'createdAt':
          left = a.createdAt || '';
          right = b.createdAt || '';
          break;
        case 'statut':
          left = a.statut || '';
          right = b.statut || '';
          break;
        default:
          left = '';
          right = '';
      }

      if (left < right) return sortState.direction === 'asc' ? -1 : 1;
      if (left > right) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [attente, localites, selectedLocaliteId, search, sortState]);

  return (
    <PageLayout title="Inscriptions en attente">
      <section className="card card-sm" style={{ marginBottom: 18 }}>
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="section-title">Liste des inscriptions en attente</h2>
            <p className="small-text">Tableau administrateur, triable par colonne, avec filtre par localité. Le tri par défaut est alphabétique sur le nom.</p>
          </div>
          <label className="field" style={{ minWidth: 220, margin: 0 }}>
            <span className="field-label">Recherche</span>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, prénom, contact..." />
          </label>
          <label className="field" style={{ minWidth: 220, margin: 0 }}>
            <span className="field-label">Localité</span>
            <select className="select" value={selectedLocaliteId} onChange={(e) => setSelectedLocaliteId(e.target.value)}>
              <option value="">Toutes les localités</option>
              {localites.map((localite) => (
                <option key={localite.id} value={localite.id}>
                  {localite.nom}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-primary" onClick={validerSelection} disabled={!selectedPending.length || loading}>
            Valider la sélection ({selectedPending.length})
          </button>
        </div>
      </section>

      {loading ? <p className="small-text">Chargement...</p> : (
        <section className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedPending.length === attente.length && attente.length > 0} onChange={() => setSelectedPending(attente.length ? attente.map((p) => p.id) : [])} /></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('nom')}>Nom {sortState.field === 'nom' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('prenom')}>Prénom {sortState.field === 'prenom' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('localite')}>Localité {sortState.field === 'localite' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('contact')}>Contact {sortState.field === 'contact' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('sexe')}>Sexe {sortState.field === 'sexe' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('age')}>Âge {sortState.field === 'age' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('profession')}>Profession {sortState.field === 'profession' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('typeParticipant')}>Type {sortState.field === 'typeParticipant' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('typeStaff')}>Type staff {sortState.field === 'typeStaff' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('montantPaye')}>Montant versé {sortState.field === 'montantPaye' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('inscritPar')}>Agent inscrit {sortState.field === 'inscritPar' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('createdAt')}>Date {sortState.field === 'createdAt' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('statut')}>Statut {sortState.field === 'statut' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedParticipants.map((p) => (
                  <tr key={p.id}>
                    <td><input type="checkbox" checked={selectedPending.includes(p.id)} onChange={() => togglePending(p.id)} /></td>
                    <td><strong>{formatValue(p.nom)}</strong></td>
                    <td>{formatValue(p.prenom)}</td>
                    <td>{formatValue(p.localite?.nom)}</td>
                    <td>{formatValue(p.contact)}</td>
                    <td>{formatValue(p.sexe)}</td>
                    <td>{p.age ? `${p.age} ans` : '—'}</td>
                    <td>{formatValue(p.profession)}</td>
                    <td>{formatValue(p.typeParticipant)}</td>
                    <td>{formatValue(p.typeStaff)}</td>
                    <td>{Number(p.montantPaye || 0)} FCFA</td>
                    <td>{p.inscritPar ? `${p.inscritPar.prenom || ''} ${p.inscritPar.nom || ''}`.trim() : '—'}</td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                    <td><span className="pill pill-accent">{p.statut || 'EN_ATTENTE'}</span></td>
                    <td>
                      <button className="btn btn-primary" onClick={() => valider(p.id)}>
                        Valider
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
