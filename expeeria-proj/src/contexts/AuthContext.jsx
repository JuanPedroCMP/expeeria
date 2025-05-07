import React, { createContext, useState, useEffect, useCallback } from 'react';
import { userService } from '../services/api';

// Criando o contexto de autenticação
export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar token ao iniciar
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Tenta recuperar o usuário do localStorage
        const storedUser = userService.getCurrentUser();
        
        if (storedUser) {
          // Verificar se o token ainda é válido fazendo uma chamada de teste
          try {
            const refreshedUser = await userService.getUserProfile(storedUser.id);
            setUser(refreshedUser);
          } catch (error) {
            console.warn('Sessão expirada ou inválida, usuário será deslogado');
            userService.logout();
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setError('Houve um problema ao verificar sua autenticação');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Função de login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userService.login(email, password);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Erro no login:', error);
      setError(
        error.response?.data?.message || 
        'Falha ao fazer login. Verifique suas credenciais.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de logout
  const logout = useCallback(() => {
    userService.logout();
    setUser(null);
  }, []);

  // Função de registro
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userService.register(userData);
      return data;
    } catch (error) {
      console.error('Erro no registro:', error);
      setError(
        error.response?.data?.message || 
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
      const updatedUser = await userService.updateUserProfile(user.id, profileData);
      setUser((currentUser) => ({
        ...currentUser,
        ...updatedUser,
      }));
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError(
        error.response?.data?.message || 
        'Falha ao atualizar perfil. Por favor, tente novamente.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Função para seguir usuário
  const followUser = useCallback(async (userId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      const result = await userService.followUser(userId);
      
      // Atualizar o usuário local se necessário
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        
        return {
          ...currentUser,
          following: [...(currentUser.following || []), userId]
        };
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      throw error;
    }
  }, [user]);

  // Função para deixar de seguir usuário
  const unfollowUser = useCallback(async (userId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      const result = await userService.unfollowUser(userId);
      
      // Atualizar o usuário local se necessário
      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        
        return {
          ...currentUser,
          following: (currentUser.following || []).filter(id => id !== userId)
        };
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      throw error;
    }
  }, [user]);

  // Função para verificar se o usuário está seguindo outro
  const isFollowing = useCallback((userId) => {
    if (!user) return false;
    return user.following?.includes(userId) || false;
  }, [user]);

  // Verifica se o usuário é administrador
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
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
        login,
        logout,
        register,
        updateProfile,
        followUser,
        unfollowUser,
        isFollowing,
        isAuthenticated: !!user,
        isAdmin,
        isOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
