import React, { createContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/Toast/Toast';

// Criação do contexto
export const NotificationContext = createContext({
  notifications: [],
  toasts: [],
  addNotification: () => {},
  removeNotification: () => {},
  addToast: () => {},
  removeToast: () => {}
});

/**
 * Provider para gerenciar notificações e toasts globalmente na aplicação
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  
  // Adicionar uma nova notificação
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    
    setNotifications(prev => [
      ...prev,
      {
        id,
        ...notification
      }
    ]);
    
    return id;
  }, []);
  
  // Remover uma notificação pelo ID
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Limpar todas as notificações
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Marcar uma notificação como lida
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  }, []);
  
  // Marcar todas as notificações como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);
  
  // Adicionar um novo toast
  const addToast = useCallback(({ message, type = 'success', duration = 3000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);
  
  // Remover um toast pelo ID
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  // Funções de conveniência para diferentes tipos de toast
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    return addToast({ message, type, duration });
  }, [addToast]);
  
  // Exportar o contexto com seus valores e funções
  const contextValue = {
    notifications,
    toasts,
    addNotification,
    removeNotification,
    clearNotifications,
    markAsRead,
    markAllAsRead,
    addToast,
    removeToast,
    showToast
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {toasts.length > 0 && (
        <ToastContainer toasts={toasts} onClose={removeToast} />
      )}
    </NotificationContext.Provider>
  );
};