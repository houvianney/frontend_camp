import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, getPublicAssetUrl } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface RessourceRecue {
  code: string;
  libelle: string;
  recuLe: string;
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

const galeriesDrive = [
  { jour: 1, url: import.meta.env.VITE_DRIVE_GALERIE_JOUR_1 },
  { jour: 2, url: import.meta.env.VITE_DRIVE_GALERIE_JOUR_2 },
  { jour: 3, url: import.meta.env.VITE_DRIVE_GALERIE_JOUR_3 },
  { jour: 4, url: import.meta.env.VITE_DRIVE_GALERIE_JOUR_4 },
];

export default function ParticipantEspace() {
  const { badgeToken } = useParams();
  const [info, setInfo] = useState<BadgeInfo | null>(null);
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

      {/* <section className="card">
        <h2 className="section-title">Galerie photos locale</h2>
        <p className="small-text" style={{ marginBottom: 14 }}>
          Consultez les photos hébergées directement sur notre plateforme.
        </p>
        {albums.length === 0 ? (
          <p>Aucune galerie locale n’est encore disponible.</p>
        ) : (
          albums.map((album) => (
            <div key={album.id} className="card" style={{ marginBottom: 18, padding: 14 }}>
              <h3>{album.titre}</h3>
              <p className="small-text">{album.activite ? `${album.activite} • ` : ''}{album.jour ? `Jour ${album.jour}` : 'Pas de jour défini'}</p>
              <div style={{ columnCount: 2, columnGap: 12 }}>
                {(album.photos || []).slice(0, visibleAlbums[album.id] || 12).map((photo) => {
                  const imageUrl = getPublicAssetUrl(photo.url);
                  return (
                    <button
                      type="button"
                      key={photo.id}
                      onClick={() => setSelectedPhoto(imageUrl)}
                      className="gallery-local-photo"
                      onMouseEnter={() => setHoveredPhoto(imageUrl)}
                      onMouseLeave={() => setHoveredPhoto(null)}
                    >
                      <img src={imageUrl} alt={album.titre} />
                      {hoveredPhoto === imageUrl && <span>↗ Ouvrir</span>}
                    </button>
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
      </section> */}

      {/* ============================================================
    GALERIE SOUVENIRS (Drive)
    ============================================================ */}
<section className="card gallery-section">
  <div className="gallery-heading">
    <div>
      <p className="gallery-eyebrow">📸 Souvenirs de l’événement</p>
      <h2 className="section-title">Galerie des 4 jours</h2>
    </div>
    <span className="gallery-mark" aria-hidden="true">✦</span>
  </div>

  <p className="small-text gallery-intro">
    Chaque journée a sa propre galerie. Cliquez sur un jour pour accéder
    aux photos et revivre les meilleurs moments.
  </p>

  <div className="gallery-grid">
    {galeriesDrive.map(({ jour, url }) => {
      const isAvailable = Boolean(url);
      return (
        <a
          key={jour}
          href={isAvailable ? url : undefined}
          target={isAvailable ? "_blank" : undefined}
          rel={isAvailable ? "noopener noreferrer" : undefined}
          className={`gallery-card ${!isAvailable ? "gallery-card--disabled" : ""}`}
          aria-disabled={!isAvailable}
          onClick={(e) => !isAvailable && e.preventDefault()}
          role="button"
          tabIndex={0}
        >
          <div className="gallery-card__icon" aria-hidden="true">
            {String(jour).padStart(2, "0")}
          </div>
          <div className="gallery-card__content">
            <span className="gallery-card__day">Jour {jour}</span>
            <span className="gallery-card__label">
              {isAvailable ? "Voir la galerie →" : "Bientôt disponible"}
            </span>
          </div>
          {isAvailable && (
            <span className="gallery-card__badge">📁 Drive</span>
          )}
        </a>
      );
    })}
  </div>
</section>

      {selectedPhoto && (
        <div className="gallery-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="gallery-modal-content" onClick={(event) => event.stopPropagation()}>
            <img src={selectedPhoto} alt="Aperçu photo" />
            <button type="button" className="btn" onClick={() => void handleDownloadPhoto(selectedPhoto)}>
              Télécharger
            </button>
            <button type="button" className="gallery-modal-close" onClick={() => setSelectedPhoto(null)} aria-label="Fermer">
              ✕
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
