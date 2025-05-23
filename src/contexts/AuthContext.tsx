
import React, { createContext, useState, useContext, ReactNode } from "react";

// User types based on requirements
export type UserType = 'dev_master' | 'dev' | 'shop_master' | 'shop';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  userType: UserType;
  status: UserStatus;
  lastLogin?: Date;
  themePreference: 'light' | 'dark' | 'auto';
  notificationPreferences?: Record<string, boolean>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to check if user is already authenticated (from localStorage or cookie)
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // Here we would normally check with Supabase if the user is authenticated
        // For now, just check local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login for now - would be replaced with Supabase auth
      console.log('Logging in with:', email, password);
      
      // Mock user for demo purposes
      const mockUser: User = {
        id: '123',
        email,
        firstName: 'John',
        lastName: 'Doe',
        userType: 'shop_master',
        status: 'active',
        themePreference: 'dark',
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Mock logout - would be replaced with Supabase auth
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      // Mock signup - would be replaced with Supabase auth
      console.log('Signing up:', email, password, firstName, lastName);
      
      // In a real app, we would create the user in Supabase here
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Mock reset password - would be replaced with Supabase auth
      console.log('Resetting password for:', email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
