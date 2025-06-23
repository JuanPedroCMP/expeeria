import React, { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import supabase from "../services/supabase";

// Criando o contexto de autenticau00e7u00e3o
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({});

// Função para limpar o localStorage de forma segura
const cleanLocalStorage = () => {
  try {
    // Salvar apenas alguns itens importantes e remover tudo relacionado ao supabase
    const itemsToKeep = {};
    const supabaseKeysPattern = /sb-|supabase/;

    // Vamos manter apenas itens que não são do Supabase
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

    // Limpar completamente o localStorage
    localStorage.clear();

    // Restaurar itens não-supabase
    Object.keys(itemsToKeep).forEach((key) => {
      localStorage.setItem(key, itemsToKeep[key]);
    });

    console.log(
      "LocalStorage limpo com sucesso de dados problemu00e1ticos do Supabase"
    );
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
  const [recoveryAttempt, setRecoveryAttempt] = useState(0);

  // Timeout de segurança para evitar bloqueio indefinido
  useEffect(() => {
    // Se continuar carregando por muito tempo (5 segundos), considera timeout
    const securityTimeout = setTimeout(() => {
      if (loading && !sessionChecked) {
        console.log("Timeout de seguranu00e7a acionado para AuthContext");
        setLoading(false);
        setSessionChecked(true);
        // Limpar localStorage como medida de emergência
        cleanLocalStorage();
      }
    }, 5000);

    return () => clearTimeout(securityTimeout);
  }, [loading, sessionChecked]);

  // Função para inicializar a autenticação com recuperação
  const initAuth = useCallback(async () => {
    try {
      setLoading(true);
      console.log(
        `Tentativa ${
          recoveryAttempt + 1
        } de inicializar autenticau00e7u00e3o...`
      );

      // Métado para obter sessu00e3o
      const { data, error } = await supabase.auth.getSession();

      // DETECÃO DE ERROS: Se houver erro na sessão
      if (error) {
        console.error("Erro ao obter sessu00e3o:", error);

        // SISTEMA DE RECUPERAÇÃO - Se for primeira falha
        if (recoveryAttempt === 0) {
          console.warn(
            "Primeiro erro de sessu00e3o detectado. Iniciando processo de recuperau00e7u00e3o..."
          );
          const cleaned = cleanLocalStorage();
          setRecoveryAttempt(1);

          // Tentar recuperar a sessão após limpar localStorage
          if (cleaned) {
            console.log("Dados limpos, reiniciando cliente Supabase...");

            /// Forçar o Supabase a criar uma nova instância de cliente
            await supabase.auth.signOut();

            // Reiniciar o processo após um pequeno delay
            setTimeout(() => {
              initAuth();
            }, 500);
            return;
          }
        }

        // Se ainda estamos tendo problemas após a limpeza
        setUser(null);
        setLoading(false);
        setSessionChecked(true);
        return;
      }

      // Resetar contador de tentativas se chegamos aqui com sucesso
      if (recoveryAttempt > 0) {
        console.log("Recuperau00e7u00e3o bem-sucedida!");
        setRecoveryAttempt(0);
      }

      console.log("Resposta da sessu00e3o obtida com sucesso:", data);
      const hasSession = data && data.session;

      if (!hasSession) {
        console.log("Nu00e3o hu00e1 sessu00e3o ativa");
        setUser(null);
        setLoading(false);
        setSessionChecked(true);
        return;
      }

      // Obter dados do usuu00e1rio da sessão
      const userData = data.session.user;
      console.log("Dados do usuu00e1rio da sessu00e3o:", userData);

      if (userData) {
        // Verificar também o perfil
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userData.id)
            .single();

          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.user_metadata?.role || "user",
            name: profileData?.name,
            username: profileData?.username,
            avatar: profileData?.avatar,
          });
        } catch (profileError) {
          console.warn(
            "Nu00e3o foi possu00edvel buscar o perfil, usando apenas dados bu00e1sicos:",
            profileError
          );
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.user_metadata?.role || "user",
          });
        }
      } else {
        setUser(null);
      }

      setSessionChecked(true);
    } catch (error) {
      console.error(
        "Erro ao inicializar estado de autenticau00e7u00e3o:",
        error
      );
      setUser(null);
    } finally {
      console.log("Verificau00e7u00e3o de autenticau00e7u00e3o finalizada");
      setLoading(false);
      setSessionChecked(true);
    }
  }, [recoveryAttempt]);

  // Verificar sessão ao iniciar - VERSÃO CORRIGIDA
  useEffect(() => {
    let isMounted = true;
    let hasInitialized = false;

    const initializeAuth = async () => {
      if (hasInitialized || !isMounted) {
        return;
      }
      
      hasInitialized = true;
      
      try {
        setLoading(true);
        console.log("Inicializando autenticação...");

        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Erro ao obter sessão:", error);
          setUser(null);
          setLoading(false);
          setSessionChecked(true);
          return;
        }

        console.log("Resposta da sessão obtida com sucesso:", data);
        const hasSession = data && data.session;

        if (!hasSession) {
          console.log("Não há sessão ativa");
          setUser(null);
          setLoading(false);
          setSessionChecked(true);
          return;
        }

        const userData = data.session.user;
        console.log("Dados do usuário da sessão:", userData);

        if (userData && isMounted) {
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
            console.warn("Não foi possível buscar o perfil, usando apenas dados básicos:", profileError);
            if (isMounted) {
              setUser({
                id: userData.id,
                email: userData.email,
                role: userData.user_metadata?.role || "user",
              });
            }
          }
        }

        if (isMounted) {
          setSessionChecked(true);
        }
      } catch (error) {
        console.error("Erro ao inicializar estado de autenticação:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          console.log("Verificação de autenticação finalizada");
          setLoading(false);
          setSessionChecked(true);
        }
      }
    };

    // Timeout de segurança
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log("Timeout de segurança acionado para AuthContext");
        setLoading(false);
        setSessionChecked(true);
        cleanLocalStorage();
      }
    }, 5000);

    // Inicializar apenas uma vez
    initializeAuth();

    // Configurar listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);

      if (!isMounted) return;

      if (event === "SIGNED_IN" && session) {
        try {
          const userData = session.user;

          if (userData) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userData.id)
                .single();

              if (profileError && profileError.code !== "PGRST116") {
                console.warn("Erro ao buscar perfil:", profileError);
              }

              if (isMounted) {
                setUser({
                  id: userData.id,
                  email: userData.email,
                  role: userData.user_metadata?.role || "user",
                  ...profileData,
                });
              }
            } catch (profileError) {
              console.error("Erro ao buscar perfil:", profileError);
              if (isMounted) {
                setUser(userData);
              }
            }
          }
        } finally {
          if (isMounted) {
            setLoading(false);
            setSessionChecked(true);
          }
        }
      } else if (event === "SIGNED_OUT") {
        if (isMounted) {
          setUser(null);
          setLoading(false);
          setSessionChecked(true);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []); // Remover dependências para evitar loops infinitos

  // Função para redefinir o estado de autenticação
  // (uso avançado para recuperação manual)
  const resetAuthState = useCallback(async () => {
    setError(null);
    setLoading(true);

    // Limpar o localStorage de quaisquer dados corrompidos
    cleanLocalStorage();

    // Forçar logout no Supabase para limpar o estado
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Erro ao fazer logout durante reset:", e);
    }

    // Redefinir o estado
    setUser(null);
    setLoading(false);
    setSessionChecked(true);
    setRecoveryAttempt(0);

    return true;
  }, []);

  // Função de login com recuperação integrada
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Iniciando processo de login para:", email);
      const result = await authService.signIn({ email, password });
      console.log("Resultado do login:", result);

      // Verificar se temos dados do usuário
      if (!result.user) {
        throw new Error(
          result.error || "Falha ao login, sem detalhes do usuário"
        );
      }

      const userData = {
        id: result.user.id,
        email: result.user.email,
        role: result.user.user_metadata?.role || "user",
      };

      // Buscar dados de perfil para completar informações do usuário
      try {
        // Aguardar um momento para que o perfil seja criado se necessário
        await new Promise((resolve) => setTimeout(resolve, 200));

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.warn("Erro ao buscar perfil após login:", profileError);
        }

        // Usuário completo com dados do perfil
        const completeUser = {
          ...userData,
          ...(profile || {}), // Usar perfil se disponível, ou objeto vazio
        };

        console.log("Definindo usuário completo no contexto");
        setUser(completeUser);
        setSessionChecked(true);
        return completeUser;
      } catch (profileError) {
        // Se houver erro ao buscar perfil, ainda definimos o usuário com dados básicos
        console.warn(
          "Erro ao buscar perfil, continuando com dados básicos:",
          profileError
        );
        setUser(userData);
        setSessionChecked(true);
        return userData;
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setError(
        error.message || "Falha ao fazer login. Verifique suas credenciais."
      );
      setSessionChecked(true); // Garante que sessionChecked seja definido mesmo em caso de erro
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de logout
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de registro
  const register = useCallback(async ({ email, password, name }) => {
    setLoading(true);
    setError(null);

    try {
      return await authService.signUp({ email, password, name });
    } catch (error) {
      console.error("Erro no registro:", error);
      setError(
        error.message || "Falha ao registrar. Por favor, tente novamente."
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Outras funções do contexto...
  const updateProfile = useCallback(
    async (profileData) => {
      if (!user) throw new Error("Usuário não autenticado");

      setLoading(true);
      setError(null);

      try {
        // Atualizar os dados do perfil
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", user.id);

        if (error) throw error;

        // Atualizar o usuário local com os novos dados
        setUser((prevUser) => ({
          ...prevUser,
          ...profileData,
        }));

        return { success: true };
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        setError(
          error.message || "Falha ao atualizar perfil. Tente novamente."
        );
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
      setError(
        error.message ||
          "Falha ao enviar email de recuperação. Tente novamente."
      );
      throw error;
    } finally {
      setLoading(false);
    }
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
