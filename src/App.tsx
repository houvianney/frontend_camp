import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

function RequireRole({ role, children }: { role: string; children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const allowedRoles = role === 'ADMIN' ? ['ADMIN', 'ADMIN_SECONDARY'] : [role];
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN' || user.role === 'ADMIN_SECONDARY') return <Navigate to="/admin" replace />;
  if (user.role === 'RESPONSABLE') return <Navigate to="/responsable" replace />;
  if (user.role === 'CONTROLEUR') return <Navigate to="/controleur" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Home />} />

          {/* Espace Admin */}
          <Route
            path="/admin"
            element={
              <RequireRole role="ADMIN">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin/validation"
            element={
              <RequireRole role="ADMIN">
                <AdminValidation />
              </RequireRole>
            }
          />
          <Route
            path="/admin/participants/attente"
            element={
              <RequireRole role="ADMIN">
                <AdminParticipantsPending />
              </RequireRole>
            }
          />
          <Route
            path="/admin/participants/valides"
            element={
              <RequireRole role="ADMIN">
                <AdminParticipantsValidated />
              </RequireRole>
            }
          />
          <Route
            path="/admin/localites"
            element={
              <RequireRole role="ADMIN">
                <AdminLocalites />
              </RequireRole>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireRole role="ADMIN">
                <AdminUsers />
              </RequireRole>
            }
          />
          <Route
            path="/admin/ressources"
            element={
              <RequireRole role="ADMIN">
                <AdminRessources />
              </RequireRole>
            }
          />
          <Route
            path="/admin/programme"
            element={
              <RequireRole role="ADMIN">
                <AdminProgramme />
              </RequireRole>
            }
          />
          <Route
            path="/admin/galerie"
            element={
              <RequireRole role="ADMIN">
                <AdminGallery />
              </RequireRole>
            }
          />

          {/* Espace Responsable de localité */}
          <Route
            path="/responsable"
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
