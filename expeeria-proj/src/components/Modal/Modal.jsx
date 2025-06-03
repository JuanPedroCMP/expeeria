import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';

/**
 * Componente Modal reutilizável
 * Pode ser usado para diálogos, formulários, confirmações, etc.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose, closeOnEsc]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className={`${styles.modal} ${styles[size]}`} ref={modalRef}>
        <div className={styles.modalHeader}>
          {title && <h3 id="modal-title" className={styles.modalTitle}>{title}</h3>}
          {showCloseButton && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Fechar modal"
            >
              &times;
            </button>
          )}
        </div>

        <div className={styles.modalContent}>
          {children}
        </div>

        {footer && (
          <div className={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
