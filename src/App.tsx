
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

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

const queryClient = new QueryClient();

// Component for protected routes
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  return <AppLayout>{element}</AppLayout>;
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
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/reports" element={<ProtectedRoute element={<ReportsDashboard />} />} />
            
            {/* Clients */}
            <Route path="/clients" element={<ProtectedRoute element={<ClientList />} />} />
            <Route path="/clients/new" element={<ProtectedRoute element={<ClientForm />} />} />
            <Route path="/clients/:id" element={<ProtectedRoute element={<ClientDetail />} />} />
            <Route path="/clients/:id/edit" element={<ProtectedRoute element={<ClientForm />} />} />
            
            {/* Vehicles */}
            <Route path="/vehicles" element={<ProtectedRoute element={<VehicleList />} />} />
            <Route path="/vehicles/new" element={<ProtectedRoute element={<VehicleForm />} />} />
            <Route path="/vehicles/:id" element={<ProtectedRoute element={<VehicleDetail />} />} />
            <Route path="/vehicles/:id/edit" element={<ProtectedRoute element={<VehicleForm />} />} />
            
            {/* Service Orders */}
            <Route path="/service-orders" element={<ProtectedRoute element={<ServiceOrderList />} />} />
            <Route path="/service-orders/new" element={<ProtectedRoute element={<ServiceOrderForm />} />} />
            <Route path="/service-orders/:id" element={<ProtectedRoute element={<ServiceOrderDetail />} />} />
            <Route path="/service-orders/:id/edit" element={<ProtectedRoute element={<ServiceOrderForm />} />} />
            
            {/* Notifications */}
            <Route path="/notifications" element={<ProtectedRoute element={<NotificationCenter />} />} />
            <Route path="/settings/notifications" element={<ProtectedRoute element={<NotificationPreferencesPage />} />} />
            
            {/* Settings */}
            <Route path="/settings/regional" element={<ProtectedRoute element={<RegionalSettings />} />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
