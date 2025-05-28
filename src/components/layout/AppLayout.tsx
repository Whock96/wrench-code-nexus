
import React, { useEffect } from "react";
import { SidebarMenu } from "./SidebarMenu";
import { Navbar } from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Log para debug
  useEffect(() => {
    console.log("AppLayout renderizado. Estado de autenticação:", { 
      isAuthenticated, 
      isLoading,
      currentPath: location.pathname
    });
  }, [isAuthenticated, isLoading, location.pathname]);

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Usuário não autenticado. Redirecionando para login...");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

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
