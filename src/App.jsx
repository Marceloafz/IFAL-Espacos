import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import CampusMapPage from '@/pages/CampusMapPage';
import Rooms from '@/pages/Rooms';
import RoomDetail from '@/pages/RoomDetail';
import Infrastructure from '@/pages/Infrastructure';
import NewTicket from '@/pages/NewTicket';
import TicketDetail from '@/pages/TicketDetail';
import Reservations from '@/pages/Reservations';
import Announcements from '@/pages/Announcements';
import Statistics from '@/pages/Statistics';
import Profile from '@/pages/Profile';
import SettingsPage from '@/pages/SettingsPage';
import GlobalSearch from '@/pages/GlobalSearch';
import Notifications from '@/pages/Notifications';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-ifal-green/20 border-t-ifal-green rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando IFAL Espaços...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mapa" element={<CampusMapPage />} />
          <Route path="/salas" element={<Rooms />} />
          <Route path="/salas/:id" element={<RoomDetail />} />
          <Route path="/infraestrutura" element={<Infrastructure />} />
          <Route path="/infraestrutura/novo" element={<NewTicket />} />
          <Route path="/infraestrutura/:id" element={<TicketDetail />} />
          <Route path="/reservas" element={<Reservations />} />
          <Route path="/avisos" element={<Announcements />} />
          <Route path="/estatisticas" element={<Statistics />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/busca" element={<GlobalSearch />} />
          <Route path="/notificacoes" element={<Notifications />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App