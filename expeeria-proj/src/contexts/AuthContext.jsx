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

  // Função para inicializar a autenticação
  const initAuth = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Iniciando verificação de autenticação...');

      // Verificar sessão atual
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Status da sessão:', sessionData ? 'Encontrada' : 'Não encontrada');
      
      const hasSession = !!sessionData?.session;
      
      if (!hasSession) {
        console.log('Nenhuma sessão válida encontrada');
        // Não há sessão válida
        setUser(null);
        setLoading(false);
        setSessionChecked(true);
        return;
      }
      
      console.log('Sessão válida encontrada, obtendo dados do usuário');
      
      // Buscar dados do usuário da sessão
      const currentUser = sessionData.session.user;
      
      if (!currentUser || !currentUser.id) {
        console.warn('Sessão encontrada, mas sem dados válidos de usuário');
        // Sessão existe mas não tem dados válidos de usuário
        await authService.signOut();
        setUser(null);
        setLoading(false);
        setSessionChecked(true);
        return;
      }

      console.log('Dados básicos do usuário encontrados, buscando perfil completo...');
      
      // Buscar perfil completo do usuário
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        if (profileError) {
          console.warn('Erro ao buscar perfil:', profileError.message);
          
          // Tentar criar um perfil básico se não existir
          if (profileError.code === 'PGRST116') { // Not found
            console.log('Perfil não encontrado, criando perfil básico...');
            
            const defaultProfile = {
              id: currentUser.id,
              email: currentUser.email,
              username: currentUser.email.split('@')[0], // Username básico
              name: currentUser.email.split('@')[0], // Nome básico 
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              status: 'active',
              role: 'user'
            };
            
            const { data: newProfile, error: insertError } = await supabase
              .from('users')
              .insert(defaultProfile)
              .select()
              .single();
            
            if (insertError) {
              console.error('Erro ao criar perfil básico:', insertError);
              // Continuar com dados básicos
              setUser(currentUser);
            } else {
              console.log('Perfil básico criado com sucesso');
              setUser({
                ...currentUser,
                ...newProfile
              });
            }
          } else {
            // Outro tipo de erro, continuar com dados básicos
            console.warn('Erro ao buscar perfil, usando dados básicos:', profileError);
            setUser(currentUser);
          }
        } else if (!profile) {
          console.warn('Perfil não encontrado, usando dados básicos');
          setUser(currentUser);
        } else {
          console.log('Perfil completo encontrado, inicialização concluída');
          // Combinar dados de autenticação com perfil
          setUser({
            ...currentUser,
            ...profile
          });
        }
      } catch (profileError) {
        console.error('Exceção ao buscar perfil:', profileError);
        // Continuar com os dados básicos do usuário
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Erro ao inicializar estado de autenticação:', error);
      setUser(null);
    } finally {
      console.log('Verificação de autenticação finalizada');
      setLoading(false);
      setSessionChecked(true);
    }
  }, []);

  // Verificar sessão ao iniciar
  useEffect(() => {
    let isMounted = true; // Flag para verificar se o componente está montado
    let safetyTimeout; // Referência para o timeout de segurança
    
    // Contador de tentativas para evitar loops infinitos
    let retryCount = 0;
    const maxRetries = 2;
    
    // Função de inicialização segura
    const safeInitAuth = async () => {
      if (!isMounted || retryCount >= maxRetries) return;
      
      try {
        console.log(`Tentando inicializar sessão (tentativa ${retryCount + 1}/${maxRetries + 1})`);
        await initAuth();
      } catch (error) {
        console.error('Erro ao inicializar sessão:', error);
        retryCount++;
        
        // Se falhar, definimos o estado padru00e3o
        if (retryCount >= maxRetries && isMounted) {
          console.log('Máximo de tentativas atingido, definindo estado padrão');
          setUser(null);
          setLoading(false);
          setSessionChecked(true);
        }
      }
    };
    
    // Configuração de timeout para segurança absoluta
    safetyTimeout = setTimeout(() => {
      if (loading && isMounted) {
        console.log('Timeout de segurança acionado para AuthContext');
        setLoading(false);
        setSessionChecked(true);
        setUser(null); // Limpar usuário em caso de timeout para forçar login
      }
    }, 5000); // 5 segundos é tempo suficiente mesmo em conexões lentas

    // Iniciar verificação de autenticação
    safeInitAuth();
    
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
