import { useEffect, useState, FormEvent } from 'react';
import { api } from '../../lib/api';
import PageLayout from '../../components/PageLayout';

interface Participant {
  id: string;
  nom: string;
  prenom: string;
  age?: number | null;
  sexe?: string | null;
  profession?: string | null;
  adresse?: string | null;
  contact?: string | null;
  membreOng?: boolean | null;
  typeParticipant?: string | null;
  montantTotal: number | string;
  montantPaye: number | string;
  statut: 'EN_ATTENTE' | 'VALIDE';
}

export default function ResponsableInscription() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [profession, setProfession] = useState('');
  const [adresse, setAdresse] = useState('');
  const [contact, setContact] = useState('');
  const [membreOng, setMembreOng] = useState(false);
  const [typeParticipant, setTypeParticipant] = useState('PARTICIPANT');
  const [montantInitial, setMontantInitial] = useState('');
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ajouts, setAjouts] = useState<Record<string, string>>({});

  async function charger() {
    try {
      const { data } = await api.get('/participants/ma-localite');
      setParticipants(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setMessage('Erreur lors du chargement des participants.');
      setMessageType('error');
    }
  }

  useEffect(() => {
    charger();
  }, []);

  function validerFormulaire(): boolean {
    const newErrors: Record<string, string> = {};

    if (!nom.trim()) newErrors.nom = 'Le nom est obligatoire.';
    if (!prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire.';
    if (!age.trim()) newErrors.age = 'L\'âge est obligatoire.';
    if (age && isNaN(Number(age))) newErrors.age = 'L\'âge doit être un nombre.';
    if (!sexe) newErrors.sexe = 'Le sexe est obligatoire.';
    if (!contact.trim()) newErrors.contact = 'Le contact est obligatoire.';
    if (!montantInitial.trim()) newErrors.montantInitial = 'Le montant de la première tranche est obligatoire.';
    if (montantInitial && isNaN(Number(montantInitial))) newErrors.montantInitial = 'Le montant doit être un nombre.';
    if (montantInitial && Number(montantInitial) < 0) newErrors.montantInitial = 'Le montant ne peut pas être négatif.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function inscrire(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!validerFormulaire()) {
      setMessage('Veuillez corriger les erreurs du formulaire.');
      setMessageType('error');
      return;
    }

    try {
      await api.post('/participants', {
        nom: nom.trim(),
        prenom: prenom.trim(),
        age: Number(age),
        sexe,
        profession: profession.trim() || undefined,
        adresse: adresse.trim() || undefined,
        contact: contact.trim(),
        membreOng,
        typeParticipant,
        montantTotal: 0,
        montantPaye: Number(montantInitial) || 0,
      });
      setNom('');
      setPrenom('');
      setAge('');
      setSexe('');
      setProfession('');
      setAdresse('');
      setContact('');
      setMembreOng(false);
      setTypeParticipant('PARTICIPANT');
      setMontantInitial('');
      setErrors({});
      setMessage('Participant ajouté avec succès.');
      setMessageType('success');
      await charger();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de l\'inscription.';
      setMessage(errorMsg);
      setMessageType('error');
      console.error('Erreur:', err);
    }
  }

  async function updateMontant(id: string) {
    const montantAjoute = Number(ajouts[id] || 0);
    if (!montantAjoute || montantAjoute <= 0) {
      setMessage('Saisissez un montant à ajouter supérieur à 0.');
      setMessageType('error');
      return;
    }

    try {
      await api.patch(`/participants/${id}/montant`, { montantAjoute });
      setMessage('Montant mis à jour.');
      setMessageType('success');
      setAjouts((prev) => ({ ...prev, [id]: '' }));
      await charger();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour.';
      setMessage(errorMsg);
      setMessageType('error');
      console.error('Erreur:', err);
    }
  }

  async function supprimerParticipant(id: string) {
    if (!window.confirm('Supprimer ce participant ?')) return;
    try {
      await api.delete(`/participants/${id}`);
      setMessage('Participant supprimé.');
      setMessageType('success');
      await charger();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de la suppression.';
      setMessage(errorMsg);
      setMessageType('error');
      console.error('Erreur:', err);
    }
  }

  const totalParticipants = participants.length;
  const totalVerse = participants.reduce((sum, p) => sum + Number(p.montantPaye || 0), 0);

  return (
    <PageLayout title="Inscription — ma localité">
      <section className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Inscrire un participant</h2>
        {message && (
          <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={inscrire} className="form-row">
          <div className="form-row inline">
            <label>
              Nom *
              <input 
                className={`input ${errors.nom ? 'input-error' : ''}`}
                value={nom} 
                onChange={(e) => {
                  setNom(e.target.value);
                  if (errors.nom) setErrors(prev => ({ ...prev, nom: '' }));
                }}
              />
              {errors.nom && <div className="error-text">{errors.nom}</div>}
            </label>

            <label>
              Prénom *
              <input 
                className={`input ${errors.prenom ? 'input-error' : ''}`}
                value={prenom} 
                onChange={(e) => {
                  setPrenom(e.target.value);
                  if (errors.prenom) setErrors(prev => ({ ...prev, prenom: '' }));
                }}
              />
              {errors.prenom && <div className="error-text">{errors.prenom}</div>}
            </label>
          </div>

          <div className="form-row inline">
            <label>
              Âge *
              <input 
                className={`input ${errors.age ? 'input-error' : ''}`}
                type="number" 
                min="0" 
                value={age} 
                onChange={(e) => {
                  setAge(e.target.value);
                  if (errors.age) setErrors(prev => ({ ...prev, age: '' }));
                }}
              />
              {errors.age && <div className="error-text">{errors.age}</div>}
            </label>

            <label>
              Sexe *
              <select 
                className={`input ${errors.sexe ? 'input-error' : ''}`}
                value={sexe} 
                onChange={(e) => {
                  setSexe(e.target.value);
                  if (errors.sexe) setErrors(prev => ({ ...prev, sexe: '' }));
                }}
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              {errors.sexe && <div className="error-text">{errors.sexe}</div>}
            </label>
          </div>

          <div className="form-row inline">
            <label>
              Profession
              <input 
                className="input"
                value={profession} 
                onChange={(e) => setProfession(e.target.value)}
              />
            </label>

            <label>
              Adresse
              <input 
                className="input"
                value={adresse} 
                onChange={(e) => setAdresse(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row inline">
            <label>
              Contact *
              <input 
                className={`input ${errors.contact ? 'input-error' : ''}`}
                type="tel" 
                value={contact} 
                onChange={(e) => {
                  setContact(e.target.value);
                  if (errors.contact) setErrors(prev => ({ ...prev, contact: '' }));
                }}
              />
              {errors.contact && <div className="error-text">{errors.contact}</div>}
            </label>

            <label>
              Type *
              <select 
                className="input"
                value={typeParticipant} 
                onChange={(e) => setTypeParticipant(e.target.value)}
              >
                <option value="PARTICIPANT">Participant</option>
                <option value="STAFF">Staff</option>
                <option value="ENSEIGNANT">Enseignant</option>
              </select>
            </label>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input 
              type="checkbox" 
              checked={membreOng} 
              onChange={(e) => setMembreOng(e.target.checked)}
            />
            Membre de l'ONG
          </label>

          <label>
            Montant de la première tranche *
            <input
              className={`input ${errors.montantInitial ? 'input-error' : ''}`}
              type="number"
              min="0"
              value={montantInitial}
              onChange={(e) => {
                setMontantInitial(e.target.value);
                if (errors.montantInitial) setErrors(prev => ({ ...prev, montantInitial: '' }));
              }}
            />
            {errors.montantInitial && <div className="error-text">{errors.montantInitial}</div>}
          </label>

          <button className="btn btn-primary" type="submit">
            Inscrire
          </button>
        </form>
      </section>

      <section className="card">
        <div className="form-row inline" style={{ marginBottom: 16 }}>
          <div className="card" style={{ flex: 1 }}>
            <h3 className="section-title">Participants inscrits</h3>
            <div className="section-title" style={{ margin: 0 }}>{totalParticipants}</div>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h3 className="section-title">Somme versée</h3>
            <div className="section-title" style={{ margin: 0 }}>{totalVerse} FCFA</div>
          </div>
        </div>

        <h2 className="section-title">Mes participants ({participants.length})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Paiement</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.prenom} {p.nom}</strong>
                  <div className="small-text">
                    {p.typeParticipant ? `${p.typeParticipant}` : ''}
                    {p.age ? ` • ${p.age} ans` : ''}
                    {p.sexe ? ` • ${p.sexe}` : ''}
                    {p.profession ? ` • ${p.profession}` : ''}
                    {p.membreOng ? ' • Membre ONG' : ''}
                  </div>
                  {p.contact && <div className="small-text">Contact : {p.contact}</div>}
                </td>
                <td>
                  <div className="small-text">Versé : {Number(p.montantPaye || 0)} FCFA</div>
                  {p.statut === 'EN_ATTENTE' && (
                    <div className="form-row inline" style={{ marginTop: 8 }}>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        value={ajouts[p.id] ?? ''}
                        onChange={(e) => setAjouts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Montant"
                      />
                      <button className="btn btn-success" onClick={() => updateMontant(p.id)}>
                        Ajouter
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{p.statut}</span>
                    {p.statut === 'EN_ATTENTE' && (
                      <button className="btn btn-danger" onClick={() => supprimerParticipant(p.id)} title="Supprimer" style={{ padding: '6px 10px' }}>
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageLayout>
  );
}
