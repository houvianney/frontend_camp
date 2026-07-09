import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';

interface RessourceInfo {
  id: string;
  code: string;
  libelle: string;
  jour: number | null;
  creneau: string | null;
  dejaDistribue: boolean;
}

interface LookupResult {
  participant: { id: string; nom: string; prenom: string; tailleTshirt: string | null };
  typeControle: string;
  ressources: RessourceInfo[];
}

const SCANNER_ELEMENT_ID = 'qr-reader';

function getControleLabel(type?: string | null) {
  switch (type) {
    case 'PRESENCE':
      return 'Présence';
    case 'TSHIRT':
      return 'T-shirt';
    case 'NOURRITURE':
      return 'Nourriture';
    default:
      return 'contrôle';
  }
}

function getActionLabel(type?: string | null) {
  switch (type) {
    case 'PRESENCE':
      return 'Valider la présence';
    case 'TSHIRT':
      return 'Valider le t-shirt';
    case 'NOURRITURE':
      return 'Valider le repas';
    default:
      return 'Valider la ressource';
  }
}

export default function ControleurScan() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(true);
  const [resultat, setResultat] = useState<LookupResult | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await lookup(decodedText);
        },
        () => {
          // erreur de frame ignorée: le scan continue
        },
      )
      .catch(() => setMessage({ type: 'error', text: "Impossible d'accéder à la caméra" }));

    return () => {
      scanner.stop().catch(() => {
        /* ignore */
      });
    };
  }, [scanning]);

  async function lookup(qrCode: string) {
    setMessage(null);
    try {
      const { data } = await api.post<LookupResult>('/distributions/scan', { qrCode });
      setResultat(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'QR code invalide' });
      setResultat(null);
    }
  }

  async function valider(ressourceId: string) {
    if (!resultat) return;
    try {
      await api.post('/distributions/valider', {
        participantId: resultat.participant.id,
        ressourceId,
      });
      const actionLabel = getActionLabel(resultat.typeControle);
      setMessage({ type: 'success', text: `${actionLabel} validée ✅` });
      setResultat({
        ...resultat,
        ressources: resultat.ressources.map((r) =>
          r.id === ressourceId ? { ...r, dejaDistribue: true } : r,
        ),
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Déjà validé' });
    }
  }

  function nouveauScan() {
    setResultat(null);
    setMessage(null);
    setScanning(true);
  }

  const currentControleType = resultat?.typeControle ?? user?.controleType;
  const controleLabel = getControleLabel(currentControleType);
  const actionLabel = getActionLabel(currentControleType);

  return (
    <PageLayout title={`Contrôle — ${controleLabel}`}>
      <section className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <h2 className="section-title">Scanner un badge</h2>
            <p className="small-text">Le scan est limité au type de contrôle de votre compte : {controleLabel.toLowerCase()}.</p>
          </div>
        </div>

        <div id={SCANNER_ELEMENT_ID} style={{ width: '100%', minHeight: 360, borderRadius: 18, overflow: 'hidden', background: '#fff' }} />

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      </section>

      {resultat && (
        <section className="card">
          <h2 className="section-title">Participant scanné</h2>
          <p>
            <strong>{resultat.participant.prenom} {resultat.participant.nom}</strong>
          </p>
          {resultat.participant.tailleTshirt && <p>Taille T-shirt : {resultat.participant.tailleTshirt}</p>}
          <p className="small-text">Action attendue : {actionLabel.toLowerCase()}.</p>

          {resultat.ressources.length === 0 ? (
            <p className="small-text">Aucune ressource à valider pour ce type de contrôle.</p>
          ) : (
            <div className="grid" style={{ marginTop: 18 }}>
              {resultat.ressources.map((r) => (
                <button
                  key={r.id}
                  disabled={r.dejaDistribue}
                  onClick={() => valider(r.id)}
                  className={r.dejaDistribue ? 'btn' : 'btn btn-primary'}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <div style={{ textAlign: 'left', width: '100%' }}>
                    <div>{r.libelle}</div>
                    <div className="small-text">{r.creneau ?? 'Sans créneau'}</div>
                    {r.dejaDistribue ? (
                      <div className="small-text">Déjà validé pour ce type de contrôle</div>
                    ) : (
                      <div className="small-text">À valider</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <button className="btn btn-secondary" style={{ marginTop: 18 }} onClick={nouveauScan}>
            Scanner le participant suivant
          </button>
        </section>
      )}
    </PageLayout>
  );
}
