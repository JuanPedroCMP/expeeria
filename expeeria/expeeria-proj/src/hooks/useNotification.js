import { useContext, useCallback } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * Hook personalizado para gerenciar notificações
 * Facilita a exibição de diferentes tipos de notificações de forma consistente
 */
export const useNotification = () => {
  const notificationContext = useContext(NotificationContext);
  
  if (!notificationContext) {
    throw new Error("useNotification deve ser usado dentro de um NotificationProvider");
  }
  
  const { notifications, addNotification, removeNotification } = notificationContext;
  
  // Exibir uma notificação de sucesso
  const showSuccess = useCallback((message, options = {}) => {
    const defaultOptions = { 
      duration: 3000,
      position: 'top-right'
    };
    
    addNotification({
      type: 'success',
      message,
      ...defaultOptions,
      ...options
    });
  }, [addNotification]);
  
  // Exibir uma notificação de erro
  const showError = useCallback((message, options = {}) => {
    const defaultOptions = { 
      duration: 5000,
      position: 'top-right'
    };
    
    addNotification({
      type: 'error',
      message,
      ...defaultOptions,
      ...options
    });
  }, [addNotification]);
  
  // Exibir uma notificação de informação
  const showInfo = useCallback((message, options = {}) => {
    const defaultOptions = { 
      duration: 3000,
      position: 'top-right'
    };
    
    addNotification({
      type: 'info',
      message,
      ...defaultOptions,
      ...options
    });
  }, [addNotification]);
  
  // Exibir uma notificação de alerta
  const showWarning = useCallback((message, options = {}) => {
    const defaultOptions = { 
      duration: 4000,
      position: 'top-right'
    };
    
    addNotification({
      type: 'warning',
      message,
      ...defaultOptions,
      ...options
    });
  }, [addNotification]);
  
  // Exibir uma confirmação que requer interação do usuário
  const showConfirm = useCallback((message, confirmCallback, cancelCallback, options = {}) => {
    const defaultOptions = { 
      duration: 0, // Não expira automaticamente
      position: 'center',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    };
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      onConfirm: confirmCallback,
      onCancel: cancelCallback
    };
    
    addNotification({
      type: 'confirm',
      message,
      ...finalOptions
    });
  }, [addNotification]);
  
  return {
    notifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    removeNotification
  };
};