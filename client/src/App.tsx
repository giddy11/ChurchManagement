import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
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
            
            {/* Contribution routes */}
            <Route path="/add-contribution" element={<Dashboard />} />
            <Route path="/all-contributions" element={<Dashboard />} />
            <Route path="/batches" element={<Dashboard />} />
            <Route path="/funds" element={<Dashboard />} />
            <Route path="/pledges" element={<Dashboard />} />
            <Route path="/contacts" element={<Dashboard />} />
            <Route path="/organisations" element={<Dashboard />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;