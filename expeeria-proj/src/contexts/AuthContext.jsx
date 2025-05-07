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
    let isMounted = true; // Verificar se o componente está montado
    let safetyTimeout; // Referência para o timeout de segurança

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
              .from('profiles')
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
                .from('profiles')
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
      clearTimeout(safetyTimeout);
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
      const data = await authService.signIn({ email, password });
      
      // Buscar perfil do usuário
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        setUser({
          ...data.user,
          ...profile
        });
        return {
          ...data.user,
          ...profile
        };
      }
      return data.user;
    } catch (error) {
      console.error('Erro no login:', error);
      setError(
        error.message || 
        'Falha ao fazer login. Verifique suas credenciais.'
      );
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
        .from('profiles')
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
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: userId,
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
        .from('followers')
        .delete()
        .match({
          follower_id: user.id,
          following_id: userId
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
        .from('followers')
        .select()
        .match({
          follower_id: user.id,
          following_id: userId
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
        resetAuthState, // Adicionando a nova função ao contexto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
