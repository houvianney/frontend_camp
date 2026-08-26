import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminValidation from './pages/admin/AdminValidation';
import AdminParticipantsPending from './pages/admin/AdminParticipantsPending';
import AdminParticipantsValidated from './pages/admin/AdminParticipantsValidated';
import AdminLocalites from './pages/admin/AdminLocalites';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRessources from './pages/admin/AdminRessources';
import AdminProgramme from './pages/admin/AdminProgramme';
import AdminGallery from './pages/admin/AdminGallery';
import ResponsableInscription from './pages/responsable/ResponsableInscription';
import ControleurScan from './pages/controleur/ControleurScan';
import ParticipantEspace from './pages/participant/ParticipantEspace';
import ChangePasswordPage from './pages/ChangePasswordPage';

function RequireRole({ role, children }: { role: string; children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/inscription/login" replace />;
  if (user.passwordMustChange) return <Navigate to="/inscription/change-password" replace />;
  const allowedRoles = role === 'ADMIN' ? ['ADMIN', 'ADMIN_SECONDARY'] : [role];
  if (!allowedRoles.includes(user.role)) return <Navigate to="/inscription/login" replace />;
  return children;
}

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/inscription/login" replace />;
  if (user.passwordMustChange) return <Navigate to="/inscription/change-password" replace />;
  if (user.role === 'ADMIN' || user.role === 'ADMIN_SECONDARY') return <Navigate to="/inscription/admin" replace />;
  if (user.role === 'RESPONSABLE') return <Navigate to="/inscription/responsable" replace />;
  if (user.role === 'CONTROLEUR') return <Navigate to="/controleur" replace />;
  return <Navigate to="/inscription/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inscription" element={<Home />} />
          <Route path="/inscription/login" element={<LoginPage />} />
          <Route path="/inscription/change-password" element={<ChangePasswordPage />} />

          {/* Espace Admin */}
          <Route
            path="/inscription/admin"
            element={
              <RequireRole role="ADMIN">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/inscription/admin/validation"
            element={
              <RequireRole role="ADMIN">
                <AdminValidation />
              </RequireRole>
            }
          />
          <Route
            path="/inscription/admin/participants/attente"
            element={
              <RequireRole role="ADMIN">
                <AdminParticipantsPending />
              </RequireRole>
            }
          />
          <Route
            path="/inscription/admin/participants/valides"
            element={
              <RequireRole role="ADMIN">
                <AdminParticipantsValidated />
              </RequireRole>
            }
          />
          <Route
            path="/inscription/admin/localites"
            element={
              <RequireRole role="ADMIN">
                <AdminLocalites />
              </RequireRole>
            }
          />
          <Route
            path="/inscription/admin/users"
            element={
              <RequireRole role="ADMIN">
                <AdminUsers />
              </RequireRole>
            }
          />
          <Route
            path="/inscription/admin/ressources"
            element={
              <RequireRole role="ADMIN">
                <AdminRessources />
              </RequireRole>
            }
          />
          <Route
            path="/inscription/admin/programme"
            element={
              <RequireRole role="ADMIN">
                <AdminProgramme />
              </RequireRole>
            }
          />
          <Route
            path="/inscription/admin/galerie"
            element={
              <RequireRole role="ADMIN">
                <AdminGallery />
              </RequireRole>
            }
          />

          {/* Espace Responsable de localité */}
          <Route
            path="/inscription/responsable"
            element={
              <RequireRole role="RESPONSABLE">
                <ResponsableInscription />
              </RequireRole>
            }
          />

          {/* Espace Contrôleur (présence / tshirt / nourriture selon compte) */}
          <Route
            path="/controleur"
            element={
              <RequireRole role="CONTROLEUR">
                <ControleurScan />
              </RequireRole>
            }
          />

          {/* Espace Participant (public via lien/QR, pas de rôle back-end strict) */}
          <Route path="/participant/:badgeToken" element={<ParticipantEspace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
