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
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!badgeToken) return;
    api
      .get<BadgeInfo>(`/public/badges/${badgeToken}`)
      .then((res) => setInfo(res.data))
      .catch(() => setErreur('Badge introuvable ou invalide. Contactez un responsable.'));

    api.get<ProgrammeItem[]>('/programme').then((res) => setProgramme(res.data));
    api.get<Album[]>('/albums').then((res) => setAlbums(res.data));
  }, [badgeToken]);

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

      <section className="card">
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
      </section>

      <section className="card">
        <h2 className="section-title">Galerie photos</h2>
        <p className="small-text" style={{ marginBottom: 14 }}>
          Toutes les photos de l’événement sont affichées ici, sans recherche ni filtre : faites simplement défiler pour trouver celles qui vous concernent.
        </p>
        {albums.length === 0 ? (
          <p>Aucune galerie n’est encore disponible.</p>
        ) : (
          albums.map((album) => (
            <div key={album.id} className="card" style={{ marginBottom: 18 }}>
              <h3>{album.titre}</h3>
              <p className="small-text">{album.activite ? `${album.activite} • ` : ''}{album.jour ? `Jour ${album.jour}` : 'Pas de jour défini'}</p>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                {album.photos.map((photo) => (
                  <img key={photo.id} src={getPublicAssetUrl(photo.url)} alt={album.titre} className="responsive" style={{ borderRadius: 18, maxHeight: 180, objectFit: 'cover' }} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </PageLayout>
  );
}
