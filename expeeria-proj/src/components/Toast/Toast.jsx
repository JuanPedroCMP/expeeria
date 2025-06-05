import React, { useState, useEffect } from 'react';
import styles from './Toast.module.css';

export const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const close = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300);
  };

  const icons = {
    success: (
      <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    ),
    error: (
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
    ),
    info: (
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    ),
  };

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${visible ? styles.visible : styles.hidden}`}
      role="alert"
    >
      <div className={styles.icon}>{icons[type]}</div>
      <span className={styles.message}>{message}</span>
      <button onClick={close} className={styles.close} aria-label="Fechar notificação">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => (
  <div className={styles.toastContainer}>
    {toasts.map((t) => (
      <Toast
        key={t.id}
        message={t.message}
        type={t.type}
        duration={t.duration}
        onClose={() => onClose(t.id)}
      />
    ))}
  </div>
);
