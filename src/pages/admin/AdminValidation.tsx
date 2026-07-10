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
        .map((item) => {
          const p = item.participant as Participant;
          const typeValue = p?.typeParticipant || 'Participant';
          const nom = p?.nom || '—';
          const prenom = p?.prenom || '—';
          const classe = (p as any)?.classe || '—';

          let accent = '#2563eb';
          const typeLower = (typeValue || '').toLowerCase();
          const sexe = ((p as any)?.sexe || '').toLowerCase();
          if (typeLower.includes('enseignant')) accent = '#16a34a';
          else if (typeLower.includes('staff') || typeLower.includes('staffs')) accent = '#7c3aed';
          else if (typeLower.includes('volont') || typeLower.includes('volontaire') || typeLower.includes('volunteer')) accent = '#f97316';
          else {
            if (sexe === 'masculin' || sexe === 'm') accent = '#2563eb';
            if (sexe === 'feminin' || sexe === 'féminin' || sexe === 'f') accent = '#ec4899';
          }

          return `
            <div style="display:flex;gap:20px;margin-bottom:24px;page-break-after:always;">
              <div style="width:320px;min-height:420px;border:4px solid ${accent};border-radius:24px;padding:22px;box-sizing:border-box;background:white;display:flex;flex-direction:column;justify-content:flex-start;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                  <img src="/icon_iyf.png" alt="logo" style="width:48px;height:48px;object-fit:contain;" />
                  <div style="font-weight:700;color:${accent};">16e édition</div>
                </div>
                <div style="text-align:center;font-size:1.3rem;font-weight:800;margin-bottom:8px;color:${accent};">Youth Leader Camp</div>
                <div style="text-align:center;font-weight:700;margin-bottom:12px;color:${accent};">${typeValue}</div>
                <div style="text-align:left;font-size:1.05rem;font-weight:700;margin-bottom:6px;color:#0f172a;"><span style="color:#475569;">Nom :</span> <strong>${nom}</strong></div>
                <div style="text-align:left;font-size:1.05rem;font-weight:700;margin-bottom:6px;color:#0f172a;"><span style="color:#475569;">Prénom :</span> <strong>${prenom}</strong></div>
                <div style="text-align:left;color:#0f172a;margin-bottom:6px;"><span style="color:#475569;">Classe :</span> <strong>${classe}</strong></div>
              </div>
              <div style="width:320px;min-height:420px;border:4px solid ${accent};border-radius:24px;padding:22px;box-sizing:border-box;background:white;display:flex;align-items:center;justify-content:center;">
                  <div style="text-align:center;">
                  <div style="font-weight:700;margin-bottom:12px;color:${accent};">Code QR</div>
                  <img src="${item.qrDataUrl}" alt="QR code" style="width:260px;height:260px;object-fit:contain;" />
                </div>
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
              .badge-page { display: flex; gap: 20px; margin-bottom: 24px; page-break-after: always; }
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
