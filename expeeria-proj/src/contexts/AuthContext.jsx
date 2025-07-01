import React, { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import supabase from "../services/supabase"; // Import corrigido - default export

// Criando o contexto de autenticação
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({});



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Inicialização da autenticação - VERSÃO CORRIGIDA SEM LOOP
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao recuperar sessão:', error);
          setUser(null);
          setError(error.message);
        } else if (session?.user) {
          // Buscar dados completos do perfil
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileError) {
              console.warn('Erro ao buscar perfil:', profileError);
              setUser(session.user);
            } else {
              // Combinar dados da sessão com dados do perfil
              setUser({
                ...session.user,
                ...profile
              });
            }
          } catch (profileError) {
            console.warn('Erro ao buscar perfil do usuário:', profileError);
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        setUser(null);
        setError(error.message);
      } finally {
        setLoading(false);
        setSessionChecked(true);
      }
    };

    initializeAuth();

    // Listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      try {
        if (session?.user) {
          // Buscar dados completos do perfil quando o usuário faz login
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileError) {
              console.warn('Erro ao buscar perfil:', profileError);
              setUser(session.user);
            } else {
              // Combinar dados da sessão com dados do perfil
              setUser({
                ...session.user,
                ...profile
              });
            }
          } catch (profileError) {
            console.warn('Erro ao buscar perfil do usuário:', profileError);
            setUser(session.user);
          }
        } else {
          setUser(null);
          if (event === 'SIGNED_OUT') {
            cleanLocalStorage();
          }
        }
      } catch (error) {
        console.error('Erro no listener de autenticação:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setSessionChecked(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função de login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Iniciando login para:", email);
      
      // Usar diretamente o Supabase para consistência
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Falha no login - usuário não encontrado");
      }

      // O usuário será definido pelo listener onAuthStateChange
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error("Erro no login:", error);
      setError(error.message || "Falha ao fazer login");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de logout
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpar estado local
      setUser(null);
      cleanLocalStorage();
    } catch (error) {
      console.error("Erro no logout:", error);
      setError(error.message || "Falha ao fazer logout");
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de registro
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Iniciando registro para:", userData.email);
      const result = await authService.signUp(userData);

      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error("Erro no registro:", error);
      setError(error.message || "Falha ao registrar usuário");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para atualizar perfil
  const updateProfile = useCallback(
    async (updates) => {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            ...updates,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;

        // Atualizar estado local do usuário
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        return { success: true };
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        setError(error.message || "Falha ao atualizar perfil");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Função para redefinir senha
  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      setError(error.message || "Falha ao enviar email de recuperação");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para reset do estado (caso necessário)
  const resetAuthState = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Limpar localStorage primeiro
      cleanLocalStorage();
      
      // Fazer logout do Supabase
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Erro ao fazer logout durante reset:", e);
    } finally {
      // Resetar estados
      setUser(null);
      setLoading(false);
      setSessionChecked(true);
    }
    
    return true;
  }, []);

  // Função para verificar se o usuário está autenticado
  const isAuthenticated = !!user && sessionChecked;

  const contextValue = {
    user,
    loading,
    error,
    sessionChecked,
    login,
    logout,
    register,
    updateProfile,
    resetPassword,
    isAuthenticated,
    resetAuthState,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
