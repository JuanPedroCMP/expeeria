import React, { useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { Button } from '../Button/Button';
import styles from './Notifications.module.css';

/**
 * Componente Notifications
 * Gerencia a exibição e auto remoção de notificações (toast)
 */
export const Notifications = () => {
  const { notifications, removeNotification } = useNotification();

  // Remove automaticamente notificações com duração (exceto confirm dialogs)
  useEffect(() => {
    const timers = notifications
      .filter(notification => notification.duration > 0)
      .map(notification =>
        setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration)
      );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);

  // Determina a classe de posição
  const getPositionClass = (position) => {
    switch (position) {
      case 'top-left': return styles.topLeft;
      case 'top-center': return styles.topCenter;
      case 'top-right': return styles.topRight;
      case 'bottom-left': return styles.bottomLeft;
      case 'bottom-center': return styles.bottomCenter;
      case 'bottom-right': return styles.bottomRight;
      case 'center': return styles.center;
      default: return styles.topRight;
    }
  };

  // Determina a classe de tipo visual
  const getTypeClass = (type) => {
    switch (type) {
      case 'success': return styles.success;
      case 'error': return styles.error;
      case 'warning': return styles.warning;
      case 'info': return styles.info;
      case 'confirm': return styles.confirm;
      default: return '';
    }
  };

  // Agrupa notificações por posição
  const notificationsByPosition = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right';
    if (!acc[position]) acc[position] = [];
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
              {/* Notificação de confirmação com botões */}
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
                        notification.onConfirm?.();
                        removeNotification(notification.id);
                      }}
                    >
                      {notification.confirmText || 'Confirmar'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        notification.onCancel?.();
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
