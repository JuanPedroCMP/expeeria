import { useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook personalizado para facilitar o acesso e manipulação da autenticação
 * Unifica funcionalidades relacionadas ao usuário em um único lugar
 * @returns {Object} Objeto com propriedades e métodos de autenticação
 */
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    console.error('Erro crítico: useAuth usado fora de um AuthProvider');
    throw new Error("useAuth deve ser usado dentro de um AuthProvider. Verifique se o componente está dentro do AuthProvider no App.jsx");
  }
  
  const { 
    user, 
    loading, 
    error, 
    login, 
    logout, 
    register, 
    updateProfile, 
    isAuthenticated,
    sessionChecked 
  } = authContext;
  
  // Verificar se o usuário é o autor do conteúdo
  const isOwner = useCallback((contentUserId) => {
    if (!user) return false;
    return user.id === contentUserId;
  }, [user]);
  
  // Verificar se o usuário tem uma determinada permissão
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);
  
  // Verificar se o usuário pode editar um conteúdo
  const canEdit = useCallback((contentUserId) => {
    if (!user) return false;
    return isOwner(contentUserId) || hasPermission('edit_all_content');
  }, [user, isOwner, hasPermission]);
  
  // Verificar se o usuário pode excluir um conteúdo
  const canDelete = useCallback((contentUserId) => {
    if (!user) return false;
    return isOwner(contentUserId) || hasPermission('delete_all_content');
  }, [user, isOwner, hasPermission]);
  
  // Verifica se a sessão está expirada ou quase expirando
  const checkSessionStatus = useCallback(() => {
    if (!user || !user.session) return { valid: false, expiresIn: 0 };
    
    try {
      const expiresAt = new Date(user.session.expires_at || user.session.expiresAt);
      const now = new Date();
      const diffMs = expiresAt - now;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      return {
        valid: diffMs > 0,
        expiresIn: diffMinutes,
        isExpiring: diffMinutes < 10 // Considerar sessão quase expirando se < 10 minutos
      };
    } catch (error) {
      console.error('Erro ao verificar status da sessão:', error);
      return { valid: false, expiresIn: 0, error };
    }
  }, [user]);
  
  // Verificar se o token atual é válido
  const getAuthToken = useCallback(() => {
    if (!user || !user.session) return null;
    
    const { valid } = checkSessionStatus();
    return valid ? user.session.access_token : null;
  }, [user, checkSessionStatus]);
  
  // Pegar nome de usuário formatado
  const getDisplayName = useCallback(() => {
    if (!user) return '';
    
    // Verifica se há dados do perfil extra
    if (user.profile) {
      return user.profile.name || user.profile.username || (user.email?.split('@')[0] || 'Usuário');
    }
    
    // Fallback para metadata do Supabase Auth ou dados do usuário
    return user.user_metadata?.full_name || 
           user.user_metadata?.username || 
           user.name || 
           user.username || 
           user.email?.split('@')[0] || 
           'Usuário';
  }, [user]);
  
  // Verificar se a conta é nova (criada há menos de 24h)
  const isNewAccount = useCallback(() => {
    if (!user || !user.created_at) return false;
    
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const diffHours = (now - createdAt) / (1000 * 60 * 60);
    
    return diffHours < 24;
  }, [user]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated,
    sessionChecked,
    isOwner,
    hasPermission,
    canEdit,
    canDelete,
    // Novas funções
    checkSessionStatus,
    getAuthToken,
    getDisplayName,
    isNewAccount
  };
};