import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import supabase from '../services/supabase';

// Criando o contexto de autenticau00e7u00e3o
export const AuthContext = createContext({});

// Funu00e7u00e3o para limpar o localStorage de forma segura
const cleanLocalStorage = () => {
  try {
    // Salvar apenas alguns itens importantes e remover tudo relacionado ao supabase
    const itemsToKeep = {};
    const supabaseKeysPattern = /sb-|supabase/;
    
    // Vamos manter apenas itens que nu00e3o su00e3o do Supabase
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !supabaseKeysPattern.test(key)) {
        try {
          itemsToKeep[key] = localStorage.getItem(key);
        } catch (e) {
          console.warn('Erro ao acessar item do localStorage:', key);
        }
      }
    }
    
    // Limpar completamente o localStorage
    localStorage.clear();
    
    // Restaurar itens nu00e3o-supabase
    Object.keys(itemsToKeep).forEach(key => {
      localStorage.setItem(key, itemsToKeep[key]);
    });
    
    console.log('LocalStorage limpo com sucesso de dados problemu00e1ticos do Supabase');
    return true;
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error);
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [recoveryAttempt, setRecoveryAttempt] = useState(0);
  
  // Timeout de seguranu00e7a para evitar bloqueio indefinido
  useEffect(() => {
    // Se continuar carregando por muito tempo (5 segundos), considera timeout
    const securityTimeout = setTimeout(() => {
      if (loading && !sessionChecked) {
        console.log('Timeout de seguranu00e7a acionado para AuthContext');
        setLoading(false);
        setSessionChecked(true);
        // Limpar localStorage como medida de emergência
        cleanLocalStorage();
      }
    }, 5000);
    
    return () => clearTimeout(securityTimeout);
  }, [loading, sessionChecked]);

  // Funu00e7u00e3o para inicializar a autenticau00e7u00e3o com recuperau00e7u00e3o
  const initAuth = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Tentativa ${recoveryAttempt + 1} de inicializar autenticau00e7u00e3o...`);
      
      // Mu00e9todo para obter sessu00e3o
      const { data, error } = await supabase.auth.getSession();
      
      // DETECU00c7u00c3O DE ERROS: Se houver erro na sessu00e3o
      if (error) {
        console.error('Erro ao obter sessu00e3o:', error);
        
        // SISTEMA DE RECUPERAU00c7u00c3O - Se for primeira falha
        if (recoveryAttempt === 0) {
          console.warn('Primeiro erro de sessu00e3o detectado. Iniciando processo de recuperau00e7u00e3o...');
          const cleaned = cleanLocalStorage();
          setRecoveryAttempt(1);
          
          // Tentar recuperar a sessu00e3o apu00f3s limpar localStorage
          if (cleaned) {
            console.log('Dados limpos, reiniciando cliente Supabase...');
            
            // Foru00e7ar o Supabase a criar uma nova instu00e2ncia de cliente
            await supabase.auth.signOut();
            
            // Reiniciar o processo apu00f3s um pequeno delay
            setTimeout(() => {
              initAuth();
            }, 500);
            return;
          }
        }
        
        // Se ainda estamos tendo problemas apu00f3s a limpeza
        setUser(null);
        setLoading(false);
        setSessionChecked(true);
        return;
      }
      
      // Resetar contador de tentativas se chegamos aqui com sucesso
      if (recoveryAttempt > 0) {
        console.log('Recuperau00e7u00e3o bem-sucedida!');
        setRecoveryAttempt(0);
      }
      
      console.log('Resposta da sessu00e3o obtida com sucesso:', data);
      const hasSession = data && data.session;      
      
      if (!hasSession) {
        console.log('Nu00e3o hu00e1 sessu00e3o ativa');
        setUser(null);
        setLoading(false);
        setSessionChecked(true);
        return;
      }
      
      // Obter dados do usuu00e1rio da sessu00e3o
      const userData = data.session.user;
      console.log('Dados do usuu00e1rio da sessu00e3o:', userData);
      
      if (userData) {
        // Verificar tambu00e9m o perfil
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.id)
            .single();
            
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.user_metadata?.role || 'user',
            name: profileData?.name,
            username: profileData?.username,
            avatar: profileData?.avatar
          });
        } catch (profileError) {
          console.warn('Nu00e3o foi possu00edvel buscar o perfil, usando apenas dados bu00e1sicos:', profileError);
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.user_metadata?.role || 'user'
          });
        }
      } else {
        setUser(null);
      }
      
      setSessionChecked(true);
    } catch (error) {
      console.error('Erro ao inicializar estado de autenticau00e7u00e3o:', error);
      setUser(null);
    } finally {
      console.log('Verificau00e7u00e3o de autenticau00e7u00e3o finalizada');
      setLoading(false);
      setSessionChecked(true);
    }
  }, [recoveryAttempt]);

  // Verificar sessu00e3o ao iniciar
  useEffect(() => {
    let isMounted = true; // Flag para verificar se o componente estu00e1 montado
    let safetyTimeout; // Referu00eancia para o timeout de seguranu00e7a
    
    // Contador de tentativas para evitar loops infinitos
    let retryCount = 0;
    const maxRetries = 2;
    
    // Funu00e7u00e3o de inicializau00e7u00e3o segura
    const safeInitAuth = async () => {
      try {
        if (!isMounted) return;
        await initAuth();
      } catch (error) {
        console.error('Erro na inicializau00e7u00e3o segura:', error);
        
        // Tentar novamente se ainda nu00e3o excedemos o limite
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          console.log(`Tentativa ${retryCount} de ${maxRetries} falhou, tentando novamente...`);
          setTimeout(safeInitAuth, 1000 * retryCount); // Espera progressivamente mais tempo
        } else if (isMounted) {
          // Desistir e garantir que loading seja falso
          setLoading(false);
          setSessionChecked(true);
        }
      }
    };
    
    // Configurau00e7u00e3o de timeout para seguranu00e7a absoluta
    safetyTimeout = setTimeout(() => {
      if (loading && isMounted) {
        console.log('Timeout de seguranu00e7a acionado para AuthContext');
        setLoading(false);
        setSessionChecked(true);
        
        // Tentar auto-correu00e7u00e3o do localStorage se ainda estamos carregando apu00f3s timeout
        cleanLocalStorage();
      }
    }, 5000); // 5 segundos u00e9 tempo suficiente mesmo em conexu00f5es lentas

    // Iniciar verificau00e7u00e3o de autenticau00e7u00e3o
    safeInitAuth();
    
    // Configurar listener para mudanu00e7as de autenticau00e7u00e3o
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, !!session);
        
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' && session) {
          try {
            const userData = session.user;
            
            if (userData) {
              // Buscar perfil do usuu00e1rio
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', userData.id)
                  .single();
                  
                if (profileError && profileError.code !== 'PGRST116') {
                  console.warn('Erro ao buscar perfil:', profileError);
                }
                
                // Combinar dados de autenticau00e7u00e3o com perfil
                if (isMounted) {
                  setUser({
                    id: userData.id,
                    email: userData.email,
                    role: userData.user_metadata?.role || 'user',
                    ...profileData
                  });
                }
              } catch (profileError) {
                console.error('Erro ao buscar perfil:', profileError);
                // Ainda definir o usuu00e1rio mesmo sem perfil
                if (isMounted) {
                  setUser(userData);
                }
              }
            }
          } finally {
            if (isMounted) {
              setLoading(false); // Garantir que loading seja false mesmo apu00f3s erro
              setSessionChecked(true);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setLoading(false); // Garantir que loading seja false apu00f3s logout
            setSessionChecked(true);
          }
        } else {
          // Garantir que loading seja false para outros eventos de autenticau00e7u00e3o
          if (isMounted) {
            setLoading(false);
            setSessionChecked(true);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [initAuth]);

  // Funu00e7u00e3o para redefinir o estado de autenticau00e7u00e3o 
  // (uso avancu00e7ado para recuperau00e7u00e3o manual)
  const resetAuthState = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    // Limpar o localStorage de quaisquer dados corrompidos
    cleanLocalStorage();
    
    // Foru00e7ar logout no Supabase para limpar o estado
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erro ao fazer logout durante reset:', e);
    }
    
    // Redefinir o estado
    setUser(null);
    setLoading(false);
    setSessionChecked(true);
    setRecoveryAttempt(0);
    
    return true;
  }, []);

  // Funu00e7u00e3o de login com recuperau00e7u00e3o integrada
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Iniciando processo de login para:', email);
      const result = await authService.signIn({ email, password });
      console.log('Resultado do login:', result);
      
      // Verificar se temos dados do usuu00e1rio
      if (!result.user) {
        throw new Error(result.error || 'Falha ao login, sem detalhes do usuu00e1rio');
      }
      
      const userData = {
        id: result.user.id,
        email: result.user.email,
        role: result.user.user_metadata?.role || 'user'
      };
      
      // Buscar dados de perfil para completar informau00e7u00f5es do usuu00e1rio
      try {
        // Aguardar um momento para que o perfil seja criado se necessário
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Erro ao buscar perfil apu00f3s login:', profileError);
        }
        
        // Usuu00e1rio completo com dados do perfil
        const completeUser = {
          ...userData,
          ...(profile || {})  // Usar perfil se disponu00edvel, ou objeto vazio
        };
        
        console.log('Definindo usuu00e1rio completo no contexto');
        setUser(completeUser);
        setSessionChecked(true);
        return completeUser;
      } catch (profileError) {
        // Se houver erro ao buscar perfil, ainda definimos o usuu00e1rio com dados bu00e1sicos
        console.warn('Erro ao buscar perfil, continuando com dados bu00e1sicos:', profileError);
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

  // Funu00e7u00e3o de logout
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Funu00e7u00e3o de registro
  const register = useCallback(async ({ email, password, name }) => {
    setLoading(true);
    setError(null);
    
    try {
      return await authService.signUp({ email, password, name });
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

  // Outras funu00e7u00f5es do contexto...
  const updateProfile = useCallback(async (profileData) => {
    if (!user) throw new Error('Usuu00e1rio nu00e3o autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      // Atualizar os dados do perfil
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Atualizar o usuu00e1rio local com os novos dados
      setUser(prevUser => ({
        ...prevUser,
        ...profileData
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError(
        error.message || 
        'Falha ao atualizar perfil. Tente novamente.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Funu00e7u00e3o para redefinir senha
  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao solicitar redefiniu00e7u00e3o de senha:', error);
      setError(
        error.message || 
        'Falha ao enviar email de recuperau00e7u00e3o. Tente novamente.'
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
        resetAuthState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
