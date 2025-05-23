
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-card p-6 rounded-lg shadow-lg animate-fade-in">
          {children}
        </div>
      </div>
      <footer className="p-4 border-t border-border text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Auto Shop Management System
      </footer>
    </div>
  );
};

export default AuthLayout;
