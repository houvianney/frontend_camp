import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, getPublicAssetUrl } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface RessourceRecue {
  code: string;
  libelle: string;
  recuLe: string;
}

interface ProgrammeItem {
  id: string;
  jour: number;
  heureDebut: string;
  heureFin?: string;
  titre: string;
  lieu?: string;
  description?: string;
}

interface PhotoItem {
  id: string;
  url: string;
}

interface Album {
  id: string;
  titre: string;
  jour?: number;
  activite?: string;
  photos: PhotoItem[];
}

interface BadgeInfo {
  nom: string;
  prenom: string;
  sexe: string | null;
  typeParticipant: string | null;
  statut: string;
  tailleTshirt: string | null;
  ressourcesRecues: RessourceRecue[];
}

export default function ParticipantEspace() {
  const { badgeToken } = useParams();
  const [info, setInfo] = useState<BadgeInfo | null>(null);
  const [programme, setProgramme] = useState<ProgrammeItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [erreur, setErreur] = useState('');
  const [visibleAlbums, setVisibleAlbums] = useState<Record<string, number>>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!badgeToken) return;
    api
      .get<BadgeInfo>(`/public/badges/${badgeToken}`)
      .then((res) => setInfo(res.data))
      .catch(() => setErreur('Badge introuvable ou invalide. Contactez un responsable.'));

    api.get<ProgrammeItem[]>('/programme').then((res) => setProgramme(res.data));
    api.get<{ albums: Album[]; total: number; page: number; limit: number }>('/albums').then((res) => setAlbums(res.data.albums || []));
  }, [badgeToken]);

  const loadMorePhotos = (albumId: string, total: number) => {
    setLoadingMore(true);
    setVisibleAlbums((prev) => ({ ...prev, [albumId]: Math.min(total, (prev[albumId] || 12) + 12) }));
    window.setTimeout(() => setLoadingMore(false), 200);
  };

  const handleDownloadPhoto = async (photoUrl: string) => {
    try {
      const response = await fetch(photoUrl, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const fileName = decodeURIComponent((photoUrl.split('/').pop() || 'photo.jpg').split('?')[0]);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      const fallbackLink = document.createElement('a');
      fallbackLink.href = photoUrl;
      fallbackLink.download = 'photo.jpg';
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.style.display = 'none';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    }
  };

  if (erreur) {
    return (
      <div className="page-shell text-center">
        <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
          <p className="alert alert-error">{erreur}</p>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="page-shell text-center">
        <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
          Chargement…
        </div>
      </div>
    );
  }

  return (
    <PageLayout title={`Bienvenue, ${info.prenom} ${info.nom}`}>
      <section className="card">
        <p style={{ marginBottom: 8 }}>
          <strong>{info.prenom} {info.nom}</strong>
        </p>
        <p style={{ marginBottom: 8 }} className="small-text">
          {info.typeParticipant ?? 'Participant'} • {info.sexe ?? 'Sexe non renseigné'}
        </p>
        <p>
          Statut : <strong>{info.statut === 'VALIDE' ? '✅ Inscription validée' : '⏳ En attente de validation'}</strong>
        </p>
        {info.tailleTshirt && <p>Taille T-shirt : {info.tailleTshirt}</p>}
        <p className="small-text">
          Vous pouvez faire défiler les photos de l’événement ci-dessous.
        </p>
      </section>

      <section className="card">
        <h2 className="section-title">Ressources déjà reçues</h2>
        {info.ressourcesRecues.length === 0 ? (
          <p>Rien reçu pour le moment.</p>
        ) : (
          <ul>
            {info.ressourcesRecues.map((r) => (
              <li key={r.code}>
                {r.libelle} — {new Date(r.recuLe).toLocaleString('fr-FR')}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* <section className="card">
        <h2 className="section-title">Programme</h2>
        {programme.length === 0 ? (
          <p>Aucun programme disponible pour le moment.</p>
        ) : (
          <div className="grid">
            {programme.map((item) => (
              <div key={item.id} className="card" style={{ padding: 18 }}>
                <p className="small-text">Jour {item.jour} • {item.heureDebut}{item.heureFin ? ` - ${item.heureFin}` : ''}</p>
                <h3>{item.titre}</h3>
                {item.lieu && <p className="small-text">Lieu: {item.lieu}</p>}
                {item.description && <p>{item.description}</p>}
              </div>
            ))}
          </div>
        )}
      </section> */}

      <section className="card">
        <h2 className="section-title">Galerie photos</h2>
        <p className="small-text" style={{ marginBottom: 14 }}>
          Cliquez sur une image pour l’ouvrir en grand, puis téléchargez-la facilement depuis l’aperçu.
        </p>
        {albums.length === 0 ? (
          <p>Aucune galerie n’est encore disponible.</p>
        ) : (
          albums.map((album) => (
            <div key={album.id} className="card" style={{ marginBottom: 18, padding: 14 }}>
              <h3>{album.titre}</h3>
              <p className="small-text">{album.activite ? `${album.activite} • ` : ''}{album.jour ? `Jour ${album.jour}` : 'Pas de jour défini'}</p>
              <div style={{ columnCount: 2, columnGap: 12 }}>
                {(album.photos || [])
                  .slice(0, visibleAlbums[album.id] || 12)
                  .map((photo) => {
                    const imageUrl = getPublicAssetUrl(photo.url);
                    return (
                      <div
                        key={photo.id}
                        style={{ breakInside: 'avoid', marginBottom: 12, position: 'relative', borderRadius: 18, overflow: 'hidden', background: '#f5f5f5' }}
                        onMouseEnter={() => setHoveredPhoto(imageUrl)}
                        onMouseLeave={() => setHoveredPhoto(null)}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto(imageUrl)}
                          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', width: '100%' }}
                        >
                          <img
                            src={imageUrl}
                            alt={album.titre}
                            style={{ width: '100%', display: 'block', objectFit: 'cover', minHeight: 120, maxHeight: 240 }}
                          />
                        </button>
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            padding: 10,
                            opacity: hoveredPhoto === imageUrl ? 1 : 0,
                            transition: 'opacity 0.2s ease',
                            pointerEvents: 'none',
                          }}
                        >
                          <span style={{ background: 'rgba(255,255,255,0.9)', padding: '7px 10px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                            ⬇ Télécharger
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {album.photos.length > (visibleAlbums[album.id] || 12) && (
                <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => loadMorePhotos(album.id, album.photos.length)} disabled={loadingMore}>
                  {loadingMore ? 'Chargement...' : 'Charger plus de photos'}
                </button>
              )}
            </div>
          ))
        )}
      </section>

      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 20,
          }}
        >
          <div style={{ position: 'relative', maxWidth: '94vw', maxHeight: '94vh' }} onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto}
              alt="Aperçu photo"
              style={{ maxWidth: '94vw', maxHeight: '94vh', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 20 }}
            />
            <button
              type="button"
              onClick={() => void handleDownloadPhoto(selectedPhoto)}
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                background: 'rgba(255,255,255,0.95)',
                color: '#111',
                padding: '10px 14px',
                borderRadius: 999,
                border: 'none',
                textDecoration: 'none',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                cursor: 'pointer',
              }}
            >
              Télécharger
            </button>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(255,255,255,0.95)',
                color: '#111',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
