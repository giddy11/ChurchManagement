import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { SocketProvider } from '@/components/auth/SocketProvider';
import { ChurchProvider } from '@/components/church/ChurchProvider';
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SuperAdmin from './pages/SuperAdmin';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <SocketProvider isAuthenticated={isAuthenticated}>
      <ChurchProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Index />} />
            <Route path="/register-church" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/people" element={<Dashboard />} />
            <Route path="/groups" element={<Dashboard />} />
            <Route path="/events" element={<Dashboard />} />
            <Route path="/followups" element={<Dashboard />} />
            <Route path="/calendar" element={<Dashboard />} />
            <Route path="/appointments" element={<Dashboard />} />
            <Route path="/notifications" element={<Dashboard />} />
            <Route path="/reports" element={<Dashboard />} />
            <Route path="/accounting" element={<Dashboard />} />
            <Route path="/users-roles" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="/help" element={<Dashboard />} />
            <Route path="/share-app" element={<Dashboard />} />
            <Route path="/churches" element={<Dashboard />} />
            <Route path="/branches" element={<Dashboard />} />
            <Route path="/church-members" element={<Dashboard />} />
            <Route path="/add-contribution" element={<Dashboard />} />
            <Route path="/all-contributions" element={<Dashboard />} />
            <Route path="/batches" element={<Dashboard />} />
            <Route path="/funds" element={<Dashboard />} />
            <Route path="/pledges" element={<Dashboard />} />
            <Route path="/contacts" element={<Dashboard />} />
            <Route path="/organisations" element={<Dashboard />} />
            <Route path="/superadmin" element={<SuperAdmin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ChurchProvider>
    </SocketProvider>
  );
}

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;