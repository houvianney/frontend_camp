import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

interface MenuItem {
  label: string;
  to?: string;
  description?: string;
  children?: MenuItem[];
}

const menuByRole: Record<string, Array<{ title: string; items: MenuItem[] }>> = {
  ADMIN: [
    {
      title: 'Gestion',
      items: [
        { label: 'Tableau de bord', to: '/admin', description: 'Vue d’ensemble' },
        {
          label: 'Participants',
          description: 'Gérer les inscriptions',
          children: [
            { label: 'Inscriptions en attente', to: '/admin/participants/attente', description: 'Valider et consulter' },
            { label: 'Participants validés', to: '/admin/participants/valides', description: 'Imprimer badges' },
          ],
        },
        { label: 'Localités', to: '/admin/localites', description: 'Suivi par territoire' },
      ],
    },
    {
      title: 'Contenu & accès',
      items: [
        { label: 'Utilisateurs', to: '/admin/users', description: 'Comptes et rôles' },
        { label: 'Ressources', to: '/admin/ressources', description: 'Objets de contrôle' },
        { label: 'Galerie', to: '/admin/galerie', description: 'Photos et téléchargements' },
      ],
    },
  ],
  ADMIN_SECONDARY: [
    {
      title: 'Gestion',
      items: [
        { label: 'Tableau de bord', to: '/admin', description: 'Vue d’ensemble' },
        {
          label: 'Participants',
          description: 'Gérer les inscriptions',
          children: [
            { label: 'Inscriptions en attente', to: '/admin/participants/attente', description: 'Valider et consulter' },
            { label: 'Participants validés', to: '/admin/participants/valides', description: 'Imprimer badges' },
          ],
        },
        { label: 'Localités', to: '/admin/localites', description: 'Suivi par territoire' },
      ],
    },
    {
      title: 'Contenu & accès',
      items: [
        { label: 'Utilisateurs', to: '/admin/users', description: 'Comptes et rôles' },
        { label: 'Ressources', to: '/admin/ressources', description: 'Objets de contrôle' },
        { label: 'Galerie', to: '/admin/galerie', description: 'Photos et téléchargements' },
      ],
    },
  ],
  RESPONSABLE: [
    {
      title: 'Espace responsable',
      items: [{ label: 'Mes inscriptions', to: '/responsable', description: 'Ajouter et suivre' }],
    },
  ],
  CONTROLEUR: [
    {
      title: 'Espace contrôleur',
      items: [{ label: 'Scanner', to: '/controleur', description: 'Valider les passages' }],
    },
  ],
};

export default function PageLayout({ title, children, actions }: PageLayoutProps) {
  const { user, logout, showIdleWarning, keepAlive } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({});
  const menuGroups = user && menuByRole[user.role] ? menuByRole[user.role] : [];
  const menuItems = menuGroups.flatMap((group) => group.items);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="page-shell">
      <header className="topbar-card">
        <div className="topbar-brand">
          <div className="brand-badge">EV</div>
          <div>
            <p className="small-text">{user ? user.role : 'Utilisateur'}</p>
            <h6>Youth Leader Camp</h6>
          </div>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`topbar-panel ${menuOpen ? 'open' : ''}`}>
          <nav className="topbar-nav" aria-label="Navigation principale">
            {menuItems.map((item) => {
              if (item.children && item.children.length) {
                const isOpen = !!openParents[item.label];
                return (
                  <div className={`topbar-link parent ${isOpen ? 'open' : ''}`} key={item.label}>
                    <button type="button" className="parent-toggle" onClick={() => setOpenParents((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}>
                      <span>{item.label}</span>
                      <span className="caret">{isOpen ? '▾' : '▸'}</span>
                    </button>
                    {isOpen && (
                      <div className="submenu">
                        {item.children.map((child) => (
                          <Link key={child.to || child.label} to={child.to || '#'} className={`topbar-sublink ${location.pathname === child.to ? 'active' : ''}`} onClick={closeMenu}>
                            <span>{child.label}</span>
                            {child.description && <small>{child.description}</small>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to || item.label}
                  to={item.to || '#'}
                  className={`topbar-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span>{item.label}</span>
                  {item.description && <small>{item.description}</small>}
                </Link>
              );
            })}
          </nav>

          <div className="topbar-actions">
            <span className="badge-pill">{user?.nom} {user?.prenom}</span>
            <button type="button" onClick={() => { closeMenu(); logout(); }} className="btn btn-danger">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="main-panel">
        <header className="page-header">
          <div>
            <p className="small-text">Espace {user ? user.role.toLowerCase() : 'visiteur'}</p>
            <h1>{title}</h1>
            {actions && <div className="page-actions">{actions}</div>}
          </div>
        </header>
        {children}
      </main>
      {showIdleWarning && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'rgba(0,0,0,0.35)', position: 'absolute', inset: 0 }} onClick={() => { /* click outside does nothing */ }} />
          <div style={{ position: 'relative', background: 'white', padding: 20, borderRadius: 12, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 1110 }}>
            <h3 style={{ marginTop: 0 }}>Votre session va expirer</h3>
            <p style={{ marginBottom: 12 }}>Vous serez déconnecté dans quelques minutes sans activité. Voulez-vous rester connecté ?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => { logout(); }} style={{ background: '#ef4444', color: 'white' }}>Se déconnecter</button>
              <button type="button" className="btn btn-primary" onClick={() => { keepAlive(); }}>Rester connecté</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
