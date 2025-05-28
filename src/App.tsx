import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import PublicServiceOrderView from "./pages/public/PublicServiceOrderView";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";

// Client Pages
import ClientList from "./pages/clients/ClientList";
import ClientForm from "./pages/clients/ClientForm";
import ClientDetail from "./pages/clients/ClientDetail";

// Vehicle Pages
import VehicleList from "./pages/vehicles/VehicleList";
import VehicleForm from "./pages/vehicles/VehicleForm";
import VehicleDetail from "./pages/vehicles/VehicleDetail";

// Service Order Pages
import ServiceOrderList from "./pages/service-orders/ServiceOrderList";
import ServiceOrderForm from "./pages/service-orders/ServiceOrderForm";
import ServiceOrderDetail from "./pages/service-orders/ServiceOrderDetail";

// Reports Pages
import ReportsDashboard from "./pages/reports/ReportsDashboard";

// Notification Pages
import NotificationCenter from "./pages/notifications/NotificationCenter";
import NotificationPreferencesPage from "./pages/settings/NotificationPreferencesPage";

// Shared Pages
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/public/service-orders/:id" element={<PublicServiceOrderView />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Client Routes */}
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />
            
            {/* Vehicle Routes */}
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/new" element={<VehicleForm />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
            
            {/* Service Order Routes */}
            <Route path="/service-orders" element={<ServiceOrderList />} />
            <Route path="/service-orders/new" element={<ServiceOrderForm />} />
            <Route path="/service-orders/:id" element={<ServiceOrderDetail />} />
            <Route path="/service-orders/:id/edit" element={<ServiceOrderForm />} />
            
            {/* Reports Routes */}
            <Route path="/reports" element={<ReportsDashboard />} />
            
            {/* Notification Routes */}
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/settings/notifications" element={<NotificationPreferencesPage />} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
