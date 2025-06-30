import React, { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import supabase from "../services/supabase";

// Criando o contexto de autenticação
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({});

// Função para limpar o localStorage de forma segura
const cleanLocalStorage = () => {
  try {
    const itemsToKeep = {};
    const supabaseKeysPattern = /sb-|supabase/;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !supabaseKeysPattern.test(key)) {
        try {
          itemsToKeep[key] = localStorage.getItem(key);
        } catch (e) {
          console.warn("Erro ao acessar item do localStorage:", key);
        }
      }
    }

    localStorage.clear();

    Object.keys(itemsToKeep).forEach((key) => {
      localStorage.setItem(key, itemsToKeep[key]);
    });

    console.log("LocalStorage limpo com sucesso de dados problemáticos do Supabase");
    return true;
  } catch (error) {
    console.error("Erro ao limpar localStorage:", error);
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Inicialização da autenticação - VERSÃO CORRIGIDA SEM LOOP
  useEffect(() => {
    let isMounted = true;
    let initialized = false;

    const initializeAuth = async () => {
      if (initialized || !isMounted) return;
      initialized = true;

      try {
        console.log("Inicializando autenticação...");
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Erro ao obter sessão:", error);
          setUser(null);
        } else if (data?.session?.user) {
          const userData = data.session.user;
          console.log("Sessão ativa encontrada:", userData.email);

          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userData.id)
              .single();

            if (isMounted) {
              setUser({
                id: userData.id,
                email: userData.email,
                role: userData.user_metadata?.role || "user",
                name: profileData?.name,
                username: profileData?.username,
                avatar: profileData?.avatar,
              });
            }
          } catch (profileError) {
            console.warn("Erro ao buscar perfil:", profileError);
            if (isMounted) {
              setUser({
                id: userData.id,
                email: userData.email,
                role: userData.user_metadata?.role || "user",
              });
            }
          }
        } else {
          console.log("Nenhuma sessão ativa");
          setUser(null);
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setSessionChecked(true);
          console.log("Inicialização da autenticação concluída");
        }
      }
    };

    // Timeout de segurança
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log("Timeout de segurança acionado");
        setLoading(false);
        setSessionChecked(true);
      }
    }, 5000);

    initializeAuth();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log("Auth state changed:", event);

      if (event === "SIGNED_IN" && session?.user) {
        const userData = session.user;
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userData.id)
            .single();

          if (isMounted) {
            setUser({
              id: userData.id,
              email: userData.email,
              role: userData.user_metadata?.role || "user",
              ...profileData,
            });
          }
        } catch (profileError) {
          console.warn("Erro ao buscar perfil após login:", profileError);
          if (isMounted) {
            setUser({
              id: userData.id,
              email: userData.email,
              role: userData.user_metadata?.role || "user",
            });
          }
        }
      } else if (event === "SIGNED_OUT") {
        if (isMounted) {
          setUser(null);
        }
      }

      if (isMounted) {
        setLoading(false);
        setSessionChecked(true);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []); // Array vazio para executar apenas uma vez

  // Função de login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Iniciando login para:", email);
      const result = await authService.signIn({ email, password });

      if (!result.user) {
        throw new Error(result.error || "Falha no login");
      }

      // O usuário será definido pelo listener onAuthStateChange
      return result;
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
      await supabase.auth.signOut();
      setUser(null);
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

        setUser({ ...user, ...updates });
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
    cleanLocalStorage();

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Erro ao fazer logout durante reset:", e);
    }

    setUser(null);
    setLoading(false);
    setSessionChecked(true);
    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        sessionChecked,
        login,
        logout,
        register,
        updateProfile,
        resetPassword,
        isAuthenticated: !!user,
        resetAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
