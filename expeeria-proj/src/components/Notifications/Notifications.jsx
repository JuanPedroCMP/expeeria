import React, { useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { Button } from '../Button/Button';
import styles from './Notifications.module.css';

/**
 * Componente para exibir notificações na interface
 * Gerencia diferentes tipos de notificações (sucesso, erro, alerta, etc.)
 */
export const Notifications = () => {
  const { notifications, removeNotification } = useNotification();
  
  // Remove automaticamente notificações com duração definida
  useEffect(() => {
    const timers = notifications
      .filter(notification => notification.duration > 0)
      .map(notification => {
        return setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
      });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);
  
  // Definir posicionamento das notificações
  const getPositionClass = (position) => {
    switch (position) {
      case 'top-left':
        return styles.topLeft;
      case 'top-center':
        return styles.topCenter;
      case 'top-right':
        return styles.topRight;
      case 'bottom-left':
        return styles.bottomLeft;
      case 'bottom-center':
        return styles.bottomCenter;
      case 'bottom-right':
        return styles.bottomRight;
      case 'center':
        return styles.center;
      default:
        return styles.topRight;
    }
  };
  
  // Definir classes baseadas no tipo de notificação
  const getTypeClass = (type) => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'warning':
        return styles.warning;
      case 'info':
        return styles.info;
      case 'confirm':
        return styles.confirm;
      default:
        return '';
    }
  };
  
  // Agrupar notificações por posição
  const notificationsByPosition = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(notification);
    return acc;
  }, {});
  
  return (
    <>
      {Object.keys(notificationsByPosition).map(position => (
        <div 
          key={position} 
          className={`${styles.notificationContainer} ${getPositionClass(position)}`}
        >
          {notificationsByPosition[position].map(notification => (
            <div 
              key={notification.id}
              className={`${styles.notification} ${getTypeClass(notification.type)}`}
            >
              {notification.type === 'confirm' ? (
                <>
                  <div className={styles.confirmMessage}>
                    {notification.message}
                  </div>
                  <div className={styles.confirmActions}>
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        notification.onConfirm && notification.onConfirm();
                        removeNotification(notification.id);
                      }}
                    >
                      {notification.confirmText || 'Confirmar'}
                    </Button>
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        notification.onCancel && notification.onCancel();
                        removeNotification(notification.id);
                      }}
                    >
                      {notification.cancelText || 'Cancelar'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.message}>{notification.message}</div>
                  <button 
                    className={styles.closeButton}
                    onClick={() => removeNotification(notification.id)}
                    aria-label="Fechar"
                  >
                    &times;
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};