import { useEffect, useState, FormEvent } from 'react';
import { api, getPublicAssetUrl } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface Photo {
  id: string;
  url: string;
}

interface Album {
  id: string;
  titre: string;
  jour?: number;
  activite?: string;
  photos: Photo[];
}

export default function AdminGallery() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [titre, setTitre] = useState('');
  const [jour, setJour] = useState<number | ''>('');
  const [activite, setActivite] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');

  async function charger() {
    const { data } = await api.get<Album[]>('/albums');
    setAlbums(data);
  }

  useEffect(() => {
    charger();
  }, []);

  async function createAlbum(e: FormEvent) {
    e.preventDefault();
    await api.post('/albums', {
      titre,
      jour: jour || undefined,
      activite: activite || undefined,
    });
    setTitre('');
    setJour('');
    setActivite('');
    setMessage('Album créé avec succès.');
    await charger();
  }

  async function addPhotos(e: FormEvent) {
    e.preventDefault();
    if (!selectedAlbumId || selectedFiles.length === 0) {
      setMessage('Sélectionnez un album et au moins une image.');
      return;
    }

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('files', file));
      await api.post(`/albums/${selectedAlbumId}/photos`, formData);
      setSelectedFiles([]);
      setMessage('Photos téléchargées avec succès.');
      await charger();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Impossible d’ajouter les photos.');
    }
  }

  async function supprimerPhoto(albumId: string, photoId: string) {
    if (!window.confirm('Supprimer cette photo ?')) return;
    try {
      await api.delete(`/albums/${albumId}/photos/${photoId}`);
      setMessage('Photo supprimée.');
      await charger();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Impossible de supprimer la photo.');
    }
  }

  async function supprimerAlbum(albumId: string) {
    if (!window.confirm('Supprimer cet album et toutes ses photos ?')) return;
    try {
      await api.delete(`/albums/${albumId}`);
      setMessage('Album supprimé.');
      await charger();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Impossible de supprimer l’album.');
    }
  }

  return (
    <PageLayout title="Galerie photos">
      <section className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Créer un album</h2>
        <p className="small-text">Organisez les photos de l’événement dans des albums propres.</p>
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={createAlbum} className="form-row">
          <label>
            Titre de l’album
            <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} required />
          </label>
          <label>
            Jour
            <input className="input" type="number" min={1} value={jour} onChange={(e) => setJour(e.target.value ? Number(e.target.value) : '')} />
          </label>
          <label>
            Activité
            <input className="input" value={activite} onChange={(e) => setActivite(e.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">Créer l’album</button>
        </form>
      </section>

      <section className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Ajouter plusieurs photos</h2>
        <p className="small-text">Sélectionnez plusieurs images directement depuis le site, elles seront stockées et visibles publiquement.</p>
        <form onSubmit={addPhotos} className="form-row">
          <label>
            Album
            <select className="select" value={selectedAlbumId} onChange={(e) => setSelectedAlbumId(e.target.value)} required>
              <option value="">Sélectionnez un album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>{album.titre}</option>
              ))}
            </select>
          </label>
          <label>
            Images à téléverser
            <input className="input" type="file" multiple accept="image/*" onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
          </label>
          {selectedFiles.length > 0 && <p className="small-text">{selectedFiles.length} fichier(s) prêt(s) à être ajouté(s)</p>}
          <button className="btn btn-primary" type="submit">Téléverser</button>
        </form>
      </section>

      <section className="card">
        <h2 className="section-title">Albums existants</h2>
        {albums.length === 0 ? (
          <p>Aucun album disponible.</p>
        ) : (
          <div className="grid">
            {albums.map((album) => (
              <div key={album.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <h3>{album.titre}</h3>
                    <p className="small-text">{album.activite ? `${album.activite} • ` : ''}{album.jour ? `Jour ${album.jour}` : 'Pas de jour défini'}</p>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => supprimerAlbum(album.id)}
                    title="Supprimer l’album"
                    style={{ padding: '6px 10px', height: 36 }}
                  >
                    Supprimer l’album
                  </button>
                </div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                  {album.photos.map((photo) => (
                    <div key={photo.id}>
                      <img src={getPublicAssetUrl(photo.url)} alt={album.titre} className="responsive" style={{ borderRadius: 18, maxHeight: 140, objectFit: 'cover' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <a href={getPublicAssetUrl(photo.url)} download className="small-text">Télécharger</a>
                        <button className="btn btn-danger" onClick={() => supprimerPhoto(album.id, photo.id)} title="Supprimer" style={{ padding: '6px 10px' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
}
