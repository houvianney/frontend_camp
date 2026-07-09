import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface Participant {
  id: string;
  nom: string;
  prenom: string;
  montantTotal: string;
  montantPaye: string;
  statut: 'EN_ATTENTE' | 'VALIDE';
  localite?: { nom: string };
  typeParticipant?: string | null;
  contact?: string | null;
}

interface MessageState {
  type: 'success' | 'error';
  text: string;
}

export default function AdminValidation() {
  const [attente, setAttente] = useState<Participant[]>([]);
  const [valides, setValides] = useState<Participant[]>([]);
  const [selectedPending, setSelectedPending] = useState<string[]>([]);
  const [selectedPrint, setSelectedPrint] = useState<string[]>([]);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [loading, setLoading] = useState(false);

  async function charger() {
    setLoading(true);
    const [attenteRes, validesRes] = await Promise.all([
      api.get('/participants', { params: { statut: 'EN_ATTENTE' } }),
      api.get('/participants', { params: { statut: 'VALIDE' } }),
    ]);
    setAttente(attenteRes.data);
    setValides(validesRes.data);
    setLoading(false);
  }

  useEffect(() => {
    charger();
  }, []);

  function togglePending(id: string) {
    setSelectedPending((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }

  function togglePrint(id: string) {
    setSelectedPrint((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }

  async function valider(id: string) {
    try {
      await api.post(`/participants/${id}/valider`);
      setMessage({ type: 'success', text: 'Participant validé et badge généré.' });
      await charger();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Impossible de valider ce participant.' });
    }
  }

  async function validerSelection() {
    if (!selectedPending.length) {
      setMessage({ type: 'error', text: 'Sélectionnez au moins un participant à valider.' });
      return;
    }

    try {
      await api.post('/participants/valider-many', { participantIds: selectedPending });
      setSelectedPending([]);
      setMessage({ type: 'success', text: `${selectedPending.length} participant(s) validé(s) avec succès.` });
      await charger();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Validation multiple impossible.' });
    }
  }

  async function regenerer(id: string) {
    try {
      await api.post(`/badges/participant/${id}/regenerer`);
      setMessage({ type: 'success', text: 'Badge régénéré avec succès.' });
      await charger();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Impossible de régénérer le badge.' });
    }
  }

  async function imprimerBadges() {
    if (!selectedPrint.length) {
      setMessage({ type: 'error', text: 'Sélectionnez au moins un participant validé à imprimer.' });
      return;
    }

    try {
      const badges = await Promise.all(
        selectedPrint.map(async (id) => {
          const participant = valides.find((item) => item.id === id);
          const qrResponse = await api.get(`/badges/participant/${id}/qr`);
          return { participant, qrDataUrl: qrResponse.data };
        }),
      );

      const printWindow = window.open('', '_blank', 'width=1100,height=900');
      if (!printWindow) {
        setMessage({ type: 'error', text: 'Le navigateur a bloqué la fenêtre d’impression.' });
        return;
      }

      const cards = badges
        .filter((item) => item.participant)
        .map((item) => `
          <div class="badge-page">
            <div class="badge-card front">
              <div class="badge-top">${item.participant?.prenom ?? ''} ${item.participant?.nom ?? ''}</div>
              <div class="badge-title">Badge participant</div>
              <div class="badge-meta">Localité : ${item.participant?.localite?.nom ?? '—'}</div>
              <div class="badge-meta">Type : ${item.participant?.typeParticipant ?? 'Participant'}</div>
              <div class="badge-meta">Contact : ${item.participant?.contact ?? '—'}</div>
            </div>
            <div class="badge-card back">
              <div class="badge-title">Code QR</div>
              <img src="${item.qrDataUrl}" alt="QR code" class="qr-image" />
            </div>
          </div>
        `)
        .join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Badges à imprimer</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fb; padding: 24px; }
              .badge-page { display: flex; gap: 20px; margin-bottom: 24px; page-break-after: always; }
              .badge-card { width: 320px; min-height: 420px; border: 2px solid #0f172a; border-radius: 24px; padding: 22px; box-sizing: border-box; background: white; }
              .front { display: flex; flex-direction: column; justify-content: space-between; }
              .back { display: flex; flex-direction: column; align-items: center; justify-content: center; }
              .badge-top { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
              .badge-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 10px; }
              .badge-meta { color: #334155; margin-bottom: 8px; }
              .qr-image { width: 220px; height: 220px; object-fit: contain; }
              @media print { body { background: white; padding: 0; } .badge-page { margin-bottom: 0; } }
            </style>
          </head>
          <body>${cards}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Impossible de préparer l’impression.' });
    }
  }

  return (
    <PageLayout title="Gestion des participants">
      {message && <div className={`alert alert-${message.type}`} style={{ marginBottom: 18 }}>{message.text}</div>}

      <div className="grid grid-2" style={{ gap: 24 }}>
        <section className="card">
          <div className="toolbar" style={{ marginBottom: 16 }}>
            <div>
              <h2 className="section-title">Inscriptions en attente</h2>
              <p className="small-text">Validez plusieurs inscriptions d’un coup et générez leurs badges.</p>
            </div>
            <button className="btn btn-primary" onClick={validerSelection} disabled={!selectedPending.length || loading}>
              Valider la sélection ({selectedPending.length})
            </button>
          </div>

          {loading ? <p>Chargement...</p> : (
            <table className="table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedPending.length === attente.length && attente.length > 0} onChange={() => setSelectedPending(attente.length ? attente.map((p) => p.id) : [])} /></th>
                  <th>Nom</th>
                  <th>Localité</th>
                  <th>Montant</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attente.map((p) => (
                  <tr key={p.id}>
                    <td><input type="checkbox" checked={selectedPending.includes(p.id)} onChange={() => togglePending(p.id)} /></td>
                    <td>{p.prenom} {p.nom}</td>
                    <td>{p.localite?.nom}</td>
                    <td>{p.montantPaye} / {p.montantTotal}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => valider(p.id)}>
                        Valider
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <div className="toolbar" style={{ marginBottom: 16 }}>
            <div>
              <h2 className="section-title">Participants validés</h2>
              <p className="small-text">Régénérez un badge, puis imprimez le front/verso avec le QR.</p>
            </div>
            <button className="btn btn-success" onClick={imprimerBadges} disabled={!selectedPrint.length}>
              Imprimer les badges ({selectedPrint.length})
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedPrint.length === valides.length && valides.length > 0} onChange={() => setSelectedPrint(valides.length ? valides.map((p) => p.id) : [])} /></th>
                <th>Nom</th>
                <th>Localité</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {valides.map((p) => (
                <tr key={p.id}>
                  <td><input type="checkbox" checked={selectedPrint.includes(p.id)} onChange={() => togglePrint(p.id)} /></td>
                  <td>{p.prenom} {p.nom}</td>
                  <td>{p.localite?.nom}</td>
                  <td>{p.typeParticipant ?? 'Participant'}</td>
                  <td>
                    <div className="page-actions">
                      <button className="btn btn-success" onClick={() => regenerer(p.id)}>
                        Régénérer badge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </PageLayout>
  );
}
