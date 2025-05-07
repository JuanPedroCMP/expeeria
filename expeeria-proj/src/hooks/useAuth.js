import { useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook personalizado para facilitar o acesso e manipulação da autenticação
 * Unifica funcionalidades relacionadas ao usuário em um único lugar
 */
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
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
    canDelete
  };
};