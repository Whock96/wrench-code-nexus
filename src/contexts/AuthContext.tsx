
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

interface AuthUser extends User {
  firstName?: string;
  lastName?: string;
  full_name?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar o perfil do usuário
  const loadUserProfile = useCallback(async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error loading user profile:", error);
        return authUser as AuthUser;
      }

      const enhancedUser: AuthUser = {
        ...authUser,
        full_name: profile?.full_name || authUser.user_metadata?.full_name,
        firstName: profile?.full_name?.split(" ")[0] || authUser.user_metadata?.full_name?.split(" ")[0],
        lastName: profile?.full_name?.split(" ").slice(1).join(" ") || authUser.user_metadata?.full_name?.split(" ").slice(1).join(" "),
        profileImage: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      };

      return enhancedUser;
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      return authUser as AuthUser;
    }
  }, []);

  // Efeito para inicialização e monitoramento da sessão
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Obter sessão inicial
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (currentSession?.user && isMounted) {
          const enhancedUser = await loadUserProfile(currentSession.user);
          setUser(enhancedUser);
          setSession(currentSession);
          console.log("Sessão recuperada com sucesso:", currentSession.user.id);
        } else if (isMounted) {
          setUser(null);
          setSession(null);
          console.log("Nenhuma sessão ativa encontrada");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Inicializar autenticação
    initializeAuth();

    // Configurar listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.id);
      
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (newSession?.user) {
          const enhancedUser = await loadUserProfile(newSession.user);
          setUser(enhancedUser);
          setSession(newSession);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
      
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (data.user) {
        const enhancedUser = await loadUserProfile(data.user);
        setUser(enhancedUser);
        setSession(data.session);
        console.log("Login bem-sucedido:", data.user.id);
        
        toast({
          title: "Login realizado com sucesso",
          description: "Você foi autenticado com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  // Registro
  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Erro no registro",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from("users")
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
            },
          ]);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          toast({
            title: "Perfil criado parcialmente",
            description: "Sua conta foi criada, mas houve um problema ao configurar seu perfil.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registro realizado com sucesso",
            description: "Sua conta foi criada. Você pode fazer login agora.",
          });
        }
      }
    } catch (error: any) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erro ao fazer logout",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      setUser(null);
      setSession(null);
      console.log("Logout bem-sucedido");
      
      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema com sucesso.",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset de senha
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Erro ao resetar senha",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Email enviado",
        description: "Verifique seu email para instruções de recuperação de senha.",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw error;
    }
  }, []);

  // Valor do contexto
  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
