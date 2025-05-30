
import React from "react";
import { SidebarMenu } from "./SidebarMenu";
import { Navbar } from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Se ainda estiver carregando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Renderizar layout para usuário autenticado
  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <SidebarMenu />
      <div className="flex flex-col flex-1 md:ml-64">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
          {children}
        </main>
        <footer className="p-4 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Auto Shop Management System
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
