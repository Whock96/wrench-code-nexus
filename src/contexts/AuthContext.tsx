
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

  // Função para carregar o perfil do usuário - SEM dependências para evitar loops
  const loadUserProfile = useCallback(async (authUser: User): Promise<AuthUser> => {
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
  }, []); // Array vazio para evitar re-criação desnecessária

  // Efeito para inicialização e monitoramento da sessão - CORRIGIDO
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Inicializando autenticação...");
        
        // Obter sessão inicial
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError);
          throw sessionError;
        }

        if (currentSession?.user && isMounted) {
          console.log("Sessão encontrada, carregando perfil do usuário:", currentSession.user.id);
          const enhancedUser = await loadUserProfile(currentSession.user);
          setUser(enhancedUser);
          setSession(currentSession);
          console.log("Usuário autenticado com sucesso");
        } else if (isMounted) {
          console.log("Nenhuma sessão ativa encontrada");
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error("Erro na inicialização da autenticação:", error);
        if (isMounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (isMounted) {
          console.log("Finalizando carregamento inicial");
          setIsLoading(false);
        }
      }
    };

    // Configurar listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Mudança de estado da autenticação:", event, newSession?.user?.id);
      
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (newSession?.user) {
          console.log("Usuário logado, carregando perfil...");
          try {
            const enhancedUser = await loadUserProfile(newSession.user);
            setUser(enhancedUser);
            setSession(newSession);
          } catch (error) {
            console.error("Erro ao carregar perfil após login:", error);
            setUser(newSession.user as AuthUser);
            setSession(newSession);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("Usuário deslogado");
        setUser(null);
        setSession(null);
      }
      
      setIsLoading(false);
    });

    // Inicializar autenticação
    initializeAuth();

    // Cleanup
    return () => {
      console.log("Limpando AuthProvider");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // REMOVIDO loadUserProfile das dependências para evitar loop infinito

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Iniciando login para:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro no login:", error);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (data.user) {
        console.log("Login bem-sucedido:", data.user.id);
        toast({
          title: "Login realizado com sucesso",
          description: "Você foi autenticado com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Erro no processo de login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Registro
  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      console.log("Iniciando registro para:", email);
      
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
        console.error("Erro no registro:", error);
        toast({
          title: "Erro no registro",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (data.user) {
        console.log("Usuário registrado:", data.user.id);
        
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
          console.error("Erro ao criar perfil do usuário:", profileError);
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
      console.error("Erro no processo de registro:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando logout...");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro ao fazer logout:", error);
        toast({
          title: "Erro ao fazer logout",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Logout realizado com sucesso");
      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro no processo de logout:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset de senha
  const resetPassword = useCallback(async (email: string) => {
    try {
      console.log("Solicitando reset de senha para:", email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Erro ao resetar senha:", error);
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
      console.error("Erro no reset de senha:", error);
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

  console.log("AuthProvider renderizando - isLoading:", isLoading, "isAuthenticated:", !!user);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
