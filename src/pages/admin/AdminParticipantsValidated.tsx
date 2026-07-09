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
  classe?: string | null;
  adresse?: string | null;
  contact?: string | null;
  telephone?: string | null;
  email?: string | null;
  membreOng?: boolean | null;
  typeParticipant?: string | null;
  montantTotal?: number | string | null;
  montantPaye?: number | string | null;
  statut?: 'EN_ATTENTE' | 'VALIDE';
  localite?: { id?: string; nom?: string } | null;
  inscritPar?: { nom?: string; prenom?: string; role?: string } | null;
  createdAt?: string;
}

type SortField = 'nom' | 'prenom' | 'localite' | 'contact' | 'sexe' | 'age' | 'profession' | 'typeParticipant' | 'montantPaye' | 'montantTotal' | 'inscritPar' | 'createdAt';

interface SortState {
  field: SortField;
  direction: 'asc' | 'desc';
}

export default function AdminParticipantsValidated() {
  const [valides, setValides] = useState<Participant[]>([]);
  const [localites, setLocalites] = useState<Localite[]>([]);
  const [selectedPrint, setSelectedPrint] = useState<string[]>([]);
  const [selectedLocaliteId, setSelectedLocaliteId] = useState('');
  const [selectedSexe, setSelectedSexe] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortState, setSortState] = useState<SortState>({ field: 'nom', direction: 'asc' });

  async function charger() {
    setLoading(true);
    try {
      const [participantsRes, localitesRes] = await Promise.all([
        api.get('/participants', { params: { statut: 'VALIDE' } }),
        api.get('/localites'),
      ]);
      setValides(participantsRes.data);
      setLocalites(localitesRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { charger(); }, []);

  function togglePrint(id: string) {
    setSelectedPrint((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  function handleSort(field: SortField) {
    setSortState((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  async function regenerer(id: string) {
    try {
      await api.post(`/badges/participant/${id}/regenerer`);
      await charger();
    } catch (err) {
      console.error(err);
    }
  }

  async function imprimerBadges() {
    if (!selectedPrint.length) return;
    try {
      const badges = await Promise.all(
        selectedPrint.map(async (id) => {
          const participant = valides.find((item) => item.id === id);
          const qrResponse = await api.get(`/badges/participant/${id}/qr`);
          const qrDataUrl = typeof qrResponse.data === 'string' && qrResponse.data.startsWith('data:')
            ? qrResponse.data
            : `data:image/png;base64,${qrResponse.data}`;
          return { participant, qrDataUrl };
        }),
      );

      const printWindow = window.open('', '_blank', 'width=1100,height=900');
      if (!printWindow) return;

      const cards = badges
        .filter((item) => item.participant)
        .map((item) => {
          const typeValue = item.participant?.typeParticipant || 'Participant';
          const nom = item.participant?.nom || '—';
          const prenom = item.participant?.prenom || '—';
          const classe = item.participant?.classe || item.participant?.profession || '—';

          return `
            <div class="badge-card">
              <div class="badge-header">IYF Youth Leader Camp 2026</div>
              <div class="badge-type">${typeValue}</div>
              <div class="badge-field"><span>Nom :</span> <strong>${nom}</strong></div>
              <div class="badge-field"><span>Prénom :</span> <strong>${prenom}</strong></div>
              <div class="badge-field"><span>Classe :</span> <strong>${classe}</strong></div>
              <div class="badge-qr-wrap">
                <div class="badge-title">Code QR</div>
                <img src="${item.qrDataUrl}" alt="QR code" class="qr-image" />
              </div>
            </div>
          `;
        })
        .join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Badges à imprimer</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fb; padding: 24px; }
              .badge-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
              .badge-card { width: 100%; min-height: 320px; border: 2px solid #0f172a; border-radius: 20px; padding: 18px; box-sizing: border-box; background: white; page-break-inside: avoid; }
              .badge-header { text-align: center; font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
              .badge-title { font-size: 1rem; font-weight: 700; color: #0f172a; text-align: center; margin-bottom: 8px; }
              .badge-type { text-align: center; font-size: 1rem; font-weight: 700; color: #334155; margin-bottom: 10px; }
              .badge-field { font-size: 0.95rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px; }
              .badge-field span { color: #475569; }
              .badge-qr-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; }
              .qr-image { width: 140px; height: 140px; object-fit: contain; display: block; }
              @media print { body { background: white; padding: 0; } .badge-grid { gap: 12px; } }
            </style>
          </head>
          <body><div class="badge-grid">${cards}</div></body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (err) {
          console.error(err);
        }
      }, 800);
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

  const sexOptions = useMemo(() => {
    return Array.from(new Set(valides.map((participant) => participant.sexe).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
  }, [valides]);

  const typeOptions = useMemo(() => {
    return Array.from(new Set(valides.map((participant) => participant.typeParticipant).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
  }, [valides]);

  const sortedParticipants = useMemo(() => {
    let items = [...valides];

    if (selectedLocaliteId) {
      const selectedLocalite = localites.find((localite) => localite.id === selectedLocaliteId);
      items = items.filter((participant) => {
        const sameId = participant.localite?.id && selectedLocalite?.id ? participant.localite.id === selectedLocalite.id : false;
        const sameName = participant.localite?.nom && selectedLocalite?.nom ? participant.localite.nom === selectedLocalite.nom : false;
        return sameId || sameName;
      });
    }

    if (selectedSexe) {
      items = items.filter((participant) => participant.sexe === selectedSexe);
    }

    if (selectedType) {
      items = items.filter((participant) => participant.typeParticipant === selectedType);
    }

    items.sort((a, b) => {
      let left: string | number | boolean | undefined;
      let right: string | number | boolean | undefined;

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
        default:
          left = '';
          right = '';
      }

      if (left < right) return sortState.direction === 'asc' ? -1 : 1;
      if (left > right) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [valides, localites, selectedLocaliteId, selectedSexe, selectedType, sortState]);

  return (
    <PageLayout title="Participants du camp">
      <section className="card card-sm" style={{ marginBottom: 18 }}>
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="section-title">Liste des participants validés</h2>
            <p className="small-text">Tableau administrateur, triable par colonne, avec filtres par sexe, type et localité. Le tri par défaut est alphabétique sur le nom.</p>
          </div>
          <label className="field" style={{ minWidth: 160, margin: 0 }}>
            <span className="field-label">Sexe</span>
            <select className="select" value={selectedSexe} onChange={(e) => setSelectedSexe(e.target.value)}>
              <option value="">Tous</option>
              {sexOptions.map((sexe) => (
                <option key={sexe} value={sexe}>{sexe}</option>
              ))}
            </select>
          </label>
          <label className="field" style={{ minWidth: 160, margin: 0 }}>
            <span className="field-label">Type</span>
            <select className="select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">Tous</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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
          <button className="btn btn-success" onClick={imprimerBadges} disabled={!selectedPrint.length || loading}>
            Imprimer la sélection ({selectedPrint.length})
          </button>
        </div>
      </section>

      {loading ? <p className="small-text">Chargement...</p> : (
        <section className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedPrint.length === valides.length && valides.length > 0} onChange={() => setSelectedPrint(valides.length ? valides.map((p) => p.id) : [])} /></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('nom')}>Nom {sortState.field === 'nom' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('prenom')}>Prénom {sortState.field === 'prenom' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('localite')}>Localité {sortState.field === 'localite' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('contact')}>Contact {sortState.field === 'contact' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('sexe')}>Sexe {sortState.field === 'sexe' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('age')}>Âge {sortState.field === 'age' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('profession')}>Profession {sortState.field === 'profession' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('typeParticipant')}>Type {sortState.field === 'typeParticipant' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('montantPaye')}>Montant versé {sortState.field === 'montantPaye' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('inscritPar')}>Agent inscrit {sortState.field === 'inscritPar' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th><button type="button" className="sortable-header" onClick={() => handleSort('createdAt')}>Date {sortState.field === 'createdAt' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}</button></th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedParticipants.map((p) => (
                  <tr key={p.id}>
                    <td><input type="checkbox" checked={selectedPrint.includes(p.id)} onChange={() => togglePrint(p.id)} /></td>
                    <td><strong>{formatValue(p.nom)}</strong></td>
                    <td>{formatValue(p.prenom)}</td>
                    <td>{formatValue(p.localite?.nom)}</td>
                    <td>{formatValue(p.contact)}</td>
                    <td>{formatValue(p.sexe)}</td>
                    <td>{p.age ? `${p.age} ans` : '—'}</td>
                    <td>{formatValue(p.profession)}</td>
                    <td>{formatValue(p.typeParticipant)}</td>
                    <td>{Number(p.montantPaye || 0)} FCFA</td>
                    <td>{p.inscritPar ? `${p.inscritPar.prenom || ''} ${p.inscritPar.nom || ''}`.trim() : '—'}</td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-success" onClick={() => regenerer(p.id)}>
                          Régénérer badge
                        </button>
                      </div>
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
