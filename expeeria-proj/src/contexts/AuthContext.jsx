import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import supabase from '../services/supabase';

// Criando o contexto de autenticação
export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Verificar sessão ao iniciar
  useEffect(() => {
    let isMounted = true; // Flag para verificar se o componente está montado
    let safetyTimeout; // Referência para o timeout de segurança
    let authStateSubscription; // Armazenar a referência da inscrição
    
    // Configuração de timeout mais curto para não bloquear a interface
    safetyTimeout = setTimeout(() => {
      if (loading && isMounted) {
        console.log('Timeout de segurança acionado para AuthContext');
        
        // Tentativa simplificada sem verificar Supabase para evitar CORS
        if (isMounted) {
          // Definir um estado inicial mesmo sem confirmação completa
          // Isso prioriza o funcionamento sobre segurança conforme solicitado
          setLoading(false);
          setSessionChecked(true);
          
          // Verificar se há dados de sessão no localStorage
          try {
            const localSession = localStorage.getItem('supabase.auth.token');
            // Se há dados no storage, assumir que existe uma sessão válida
            // Isso é uma solução de contorno que prioriza o funcionamento
            if (localSession) {
              // Tentar extrair informações básicas do usuário do localStorage
              try {
                const parsedSession = JSON.parse(localSession);
                if (parsedSession?.currentSession?.user) {
                  setUser(parsedSession.currentSession.user);
                }
              } catch (e) {
                console.warn('Erro ao processar sessão local, continuando mesmo assim');
              }
            } else {
              // Sem sessão no localStorage
              setUser(null);
            }
          } catch (e) {
            console.warn('Erro ao acessar localStorage, continuando mesmo assim');
          }
        }
      }
    }, 3000); // Reduzido para 3 segundos para não bloquear a interface

    const initAuth = async () => {
      if (!isMounted) return;
      setLoading(true);
      
      try {
        // Verificar se há uma sessão ativa e válida
        const hasSession = await authService.hasValidSession();
        
        if (hasSession && isMounted) {
          // Buscar dados do usuário
          const userData = await authService.getCurrentUser();
          if (userData && isMounted) {
            // Buscar perfil do usuário para dados adicionais
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', userData.id)
              .single();
            
            setUser({
              ...userData,
              ...profile
            });
          }
        } else if (isMounted) {
          // Explicitamente definir usuário como null se não houver sessão
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        if (isMounted) {
          setError('Houve um problema ao verificar sua autenticação');
          // Garantir que o usuário seja null em caso de erro
          setUser(null);
        }
      } finally {
        // Garantir que o loading seja sempre definido como false após a verificação
        if (isMounted) {
          setLoading(false);
          setSessionChecked(true);
        }
      }
    };

    initAuth();
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription }} = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, !!session);
        
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' && session) {
          setLoading(true); // Indicar carregamento quando o usuário fizer login
          // Buscar usuário atual
          try {
            const userData = await authService.getCurrentUser();
            if (userData && isMounted) {
              // Buscar perfil do usuário
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', userData.id)
                .single();
                
              setUser({
                ...userData,
                ...profile
              });
            }
          } catch (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
            // Garantir que o usuário tenha pelo menos os dados básicos mesmo sem perfil
            if (isMounted && session?.user) {
              setUser(session.user);
            }
          } finally {
            if (isMounted) {
              setLoading(false); // Garantir que loading seja false mesmo após erro
              setSessionChecked(true);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setLoading(false); // Garantir que loading seja false após logout
            setSessionChecked(true);
          }
        } else {
          // Garantir que loading seja false para outros eventos de autenticação
          if (isMounted) {
            setLoading(false);
            setSessionChecked(true);
          }
        }
      }
    );
    
    // Definir um timeout de segurança para garantir que loading não fique travado
    safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log("Timeout de segurança acionado para AuthContext");
        setLoading(false);
        setSessionChecked(true);
        
        // Verificar sessão de forma simplificada
        authService.hasValidSession().then(hasSession => {
          if (!hasSession && isMounted) {
            setUser(null);
          }
        }).catch(() => {
          // Em caso de erro, assume que não há sessão
          if (isMounted) {
            setUser(null);
          }
        });
      }
    }, 2000); // Reduzir para 2 segundos para melhor experiência do usuário
    
    // Limpar subscription e state quando o componente for desmontado
    return () => {
      isMounted = false;
      // Limpar o timeout de segurança ao desmontar o componente
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
      }
      subscription?.unsubscribe();
    };
  }, []);

  // Função para reiniciar estado de autenticação em caso de problemas
  const resetAuthState = useCallback(() => {
    setLoading(false);
    setSessionChecked(true);
    // Verificar sessão atual
    authService.hasValidSession().then(hasSession => {
      if (!hasSession) {
        setUser(null);
      }
    });
  }, []);

  // Função de login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Iniciando processo de login para:', email);
      const result = await authService.signIn({ email, password });
      console.log('Resultado do login:', result);
      
      // Verificar se temos dados do usuário
      if (!result || !result.user) {
        throw new Error('Dados de usuário ausentes na resposta de autenticação');
      }
      
      const userData = result.user;
      console.log('Dados do usuário obtidos:', userData.id);
      
      // Buscar perfil do usuário
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single();
          
        if (profileError) {
          console.warn('Erro ao buscar perfil, continuando com dados básicos:', profileError);
        }
        
        // Mesmo com erro ao buscar perfil, definimos o usuário com os dados básicos
        const completeUser = {
          ...userData,
          ...(profile || {})  // Usar perfil se disponível, ou objeto vazio
        };
        
        console.log('Definindo usuário completo no contexto');
        setUser(completeUser);
        setSessionChecked(true);
        return completeUser;
      } catch (profileError) {
        // Se houver erro ao buscar perfil, ainda definimos o usuário com dados básicos
        console.warn('Erro ao buscar perfil, continuando com dados básicos:', profileError);
        setUser(userData);
        setSessionChecked(true);
        return userData;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError(
        error.message || 
        'Falha ao fazer login. Verifique suas credenciais.'
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
      console.error('Erro ao fazer logout:', error);
      setError('Não foi possível sair. Tente novamente');
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de registro
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.signUp(userData);
      return data;
    } catch (error) {
      console.error('Erro no registro:', error);
      setError(
        error.message || 
        'Falha ao registrar. Por favor, tente novamente.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para atualizar o perfil do usuário
  const updateProfile = useCallback(async (profileData) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      // Atualizar apenas os dados do perfil
      const { data: updatedProfile, error: profileError } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      // Atualizar o usuário local
      setUser((currentUser) => ({
        ...currentUser,
        ...updatedProfile,
      }));
      
      return updatedProfile;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError(
        error.message || 
        'Falha ao atualizar perfil. Por favor, tente novamente.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Função para resetar senha
  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.resetPassword(email);
      return true;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      setError(
        error.message || 
        'Falha ao enviar email de recuperação. Tente novamente.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para seguir usuário
  const followUser = useCallback(async (userId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      // Atualizar a relação de seguidor
      const { error } = await supabase
        .from('user_followers')
        .insert({
          user_id: userId,  // O usuário que está sendo seguido
          follower_id: user.id,  // O usuário que está seguindo
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Atualizar o usuário local
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        
        return {
          ...currentUser,
          following: [...(currentUser.following || []), userId]
        };
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      throw error;
    }
  }, [user]);

  // Função para deixar de seguir usuário
  const unfollowUser = useCallback(async (userId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      // Remover a relação de seguidor
      const { error } = await supabase
        .from('user_followers')
        .delete()
        .match({
          user_id: userId,  // O usuário que estava sendo seguido
          follower_id: user.id  // O usuário que estava seguindo
        });
      
      if (error) throw error;
      
      // Atualizar o usuário local
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        
        return {
          ...currentUser,
          following: (currentUser.following || []).filter(id => id !== userId)
        };
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      throw error;
    }
  }, [user]);

  // Função para verificar se o usuário está seguindo outro
  const isFollowing = useCallback(async (userId) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select()
        .match({
          user_id: userId,
          follower_id: user.id
        })
        .single();
      
      if (error && error.code !== 'PGRST116') return false; // PGRST116 é o código para 'no rows returned'
      
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar seguidor:', error);
      return false;
    }
  }, [user]);

  // Verifica se o usuário é administrador
  const isAdmin = useCallback(() => {
    if (!user) return false;
    return user.role === 'admin';
  }, [user]);

  // Verifica se o usuário é dono de um recurso
  const isOwner = useCallback((resourceUserId) => {
    if (!user) return false;
    return user.id === resourceUserId;
  }, [user]);

  // Função para reconexão automática e revalidação de sessão
  const reconnectAndValidate = useCallback(async () => {
    if (!navigator.onLine) {
      return { success: false, reason: 'offline' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Tentar buscar a sessão atual do Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!session) {
        // Se não houver sessão, confirmar que o usuário está realmente deslogado
        setUser(null);
        return { success: true, authenticated: false };
      }
      
      // Buscar dados do usuário com a sessão renovada
      const userData = await authService.getCurrentUser();
      
      if (userData) {
        // Buscar perfil atualizado
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single();
        
        // Atualizar o estado do usuário com dados frescos
        setUser({
          ...userData,
          ...profile
        });
        
        return { success: true, authenticated: true };
      } else {
        // Se não conseguiu obter dados do usuário com uma sessão válida
        setUser(null);
        return { success: true, authenticated: false };
      }
    } catch (error) {
      console.error('Erro durante a reconexão:', error);
      setError('Falha ao reconectar. Por favor, faça login novamente.');
      setUser(null);
      return { success: false, reason: 'error', error };
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
        followUser,
        unfollowUser,
        isFollowing,
        isAuthenticated: !!user,
        isAdmin,
        isOwner,
        resetAuthState,
        reconnectAndValidate
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
