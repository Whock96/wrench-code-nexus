
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

// Componentes de autenticação
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// Páginas principais
import Dashboard from "@/pages/dashboard/Dashboard";
import Index from "@/pages/Index";

// Clientes
import ClientList from "@/pages/clients/ClientList";
import ClientDetail from "@/pages/clients/ClientDetail";
import ClientForm from "@/pages/clients/ClientForm";

// Veículos
import VehicleList from "@/pages/vehicles/VehicleList";
import VehicleDetail from "@/pages/vehicles/VehicleDetail";
import VehicleForm from "@/pages/vehicles/VehicleForm";

// Ordens de Serviço
import ServiceOrderList from "@/pages/service-orders/ServiceOrderList";
import ServiceOrderDetail from "@/pages/service-orders/ServiceOrderDetail";
import ServiceOrderForm from "@/pages/service-orders/ServiceOrderForm";

// Estoque
import InventoryDashboard from "@/pages/inventory/InventoryDashboard";
import PartsList from "@/pages/inventory/PartsList";

// Relatórios
import ReportsDashboard from "@/pages/reports/ReportsDashboard";

// Configurações
import RegionalSettings from "@/pages/settings/RegionalSettings";
import NotificationPreferencesPage from "@/pages/settings/NotificationPreferencesPage";

// Notificações
import NotificationCenter from "@/pages/notifications/NotificationCenter";

// Público
import PublicServiceOrderView from "@/pages/public/PublicServiceOrderView";
import LandingPage from "@/pages/public/LandingPage";

// 404
import NotFound from "@/pages/NotFound";

// Componente de rota protegida
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/public/service-orders/:id" element={<PublicServiceOrderView />} />
            
            {/* Rota inicial */}
            <Route path="/" element={<Index />} />

            {/* Rotas protegidas */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Clientes */}
            <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
            <Route path="/clients/new" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
            <Route path="/clients/:id/edit" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
            
            {/* Veículos */}
            <Route path="/vehicles" element={<ProtectedRoute><VehicleList /></ProtectedRoute>} />
            <Route path="/vehicles/new" element={<ProtectedRoute><VehicleForm /></ProtectedRoute>} />
            <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetail /></ProtectedRoute>} />
            <Route path="/vehicles/:id/edit" element={<ProtectedRoute><VehicleForm /></ProtectedRoute>} />
            
            {/* Ordens de Serviço */}
            <Route path="/service-orders" element={<ProtectedRoute><ServiceOrderList /></ProtectedRoute>} />
            <Route path="/service-orders/new" element={<ProtectedRoute><ServiceOrderForm /></ProtectedRoute>} />
            <Route path="/service-orders/:id" element={<ProtectedRoute><ServiceOrderDetail /></ProtectedRoute>} />
            <Route path="/service-orders/:id/edit" element={<ProtectedRoute><ServiceOrderForm /></ProtectedRoute>} />
            
            {/* Estoque */}
            <Route path="/inventory" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
            <Route path="/inventory/parts" element={<ProtectedRoute><PartsList /></ProtectedRoute>} />
            
            {/* Relatórios */}
            <Route path="/reports" element={<ProtectedRoute><ReportsDashboard /></ProtectedRoute>} />
            
            {/* Notificações */}
            <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
            
            {/* Configurações */}
            <Route path="/settings/regional" element={<ProtectedRoute><RegionalSettings /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><NotificationPreferencesPage /></ProtectedRoute>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
