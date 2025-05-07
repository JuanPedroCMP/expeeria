import React, { createContext, useState, useCallback, useEffect } from 'react';

// Criação do contexto
export const NotificationContext = createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {}
});

/**
 * Provider para gerenciar notificações globalmente na aplicação
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
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
    
    // Opcional: Chamada à API para limpar todas as notificações
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
    
    // Opcional: Chamada à API para atualizar o status da notificação
  }, []);
  
  // Marcar todas as notificações como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    // Opcional: Chamada à API para atualizar o status de todas as notificações
  }, []);
  
  // Efeito para carregar notificações do servidor quando o componente montar
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Implementar lógica para buscar notificações da API
        // Exemplo:
        // const response = await api.get('/notifications');
        // setNotifications(response.data);
        
        // Por enquanto, apenas um exemplo de carregamento de notificações simuladas
        const mockNotifications = [
          {
            id: '1',
            type: 'like',
            message: 'João curtiu seu post "Aprendendo React"',
            createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
            read: false,
            actionUrl: '/post/123',
            sender: {
              id: 'user1',
              name: 'João Silva',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
            }
          },
          {
            id: '2',
            type: 'comment',
            message: 'Maria comentou em seu post "Dicas de JavaScript"',
            createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
            read: false,
            actionUrl: '/post/456#comment789',
            sender: {
              id: 'user2',
              name: 'Maria Oliveira',
              avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
            }
          }
        ];
        
        // Apenas carregar se não houver notificações ainda
        if (notifications.length === 0) {
          setNotifications(mockNotifications);
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    };
    
    fetchNotifications();
  }, [notifications.length]);
  
  // Exportar o contexto com seus valores e funções
  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    markAsRead,
    markAllAsRead
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};