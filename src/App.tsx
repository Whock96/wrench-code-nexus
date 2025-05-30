
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import LandingPage from "./pages/public/LandingPage";
import PublicServiceOrderView from "./pages/public/PublicServiceOrderView";
import Dashboard from "./pages/dashboard/Dashboard";
import ClientList from "./pages/clients/ClientList";
import ClientForm from "./pages/clients/ClientForm";
import ClientDetail from "./pages/clients/ClientDetail";
import VehicleList from "./pages/vehicles/VehicleList";
import VehicleForm from "./pages/vehicles/VehicleForm";
import VehicleDetail from "./pages/vehicles/VehicleDetail";
import ServiceOrderList from "./pages/service-orders/ServiceOrderList";
import ServiceOrderForm from "./pages/service-orders/ServiceOrderForm";
import ServiceOrderDetail from "./pages/service-orders/ServiceOrderDetail";
import NotificationCenter from "./pages/notifications/NotificationCenter";
import NotificationPreferencesPage from "./pages/settings/NotificationPreferencesPage";
import RegionalSettings from "./pages/settings/RegionalSettings";
import ReportsDashboard from "./pages/reports/ReportsDashboard";
import NotFound from "./pages/NotFound";
import { AppLayout } from "@/components/layout/AppLayout";

// Import inventory pages
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import PartsList from "./pages/inventory/PartsList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente para rotas protegidas com verificação de autenticação
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/public/service-orders/:id" element={<PublicServiceOrderView />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ReportsDashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Clients */}
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients/new" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientForm />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientDetail />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients/:id/edit" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientForm />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Vehicles */}
            <Route 
              path="/vehicles" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VehicleList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vehicles/new" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VehicleForm />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vehicles/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VehicleDetail />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vehicles/:id/edit" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VehicleForm />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Service Orders */}
            <Route 
              path="/service-orders" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceOrderList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/service-orders/new" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceOrderForm />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/service-orders/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceOrderDetail />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/service-orders/:id/edit" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceOrderForm />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Inventory Routes */}
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <InventoryDashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory/parts" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PartsList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Notifications */}
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <NotificationCenter />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/notifications" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <NotificationPreferencesPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Settings */}
            <Route 
              path="/settings/regional" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <RegionalSettings />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
