import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './LikeButton.module.css';

/**
 * Componente de botão de "Curtir" com suporte a contagem, estado visual e acessibilidade.
 */
export const LikeButton = ({
  count = 0,
  isLiked = false,
  onLike,
  onUnlike,
  size = 'md',
  showCount = true,
  disabled = false
}) => {
  const { user } = useAuth();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Você precisa estar logado para curtir!");
      return;
    }

    if (disabled) return;

    isLiked ? onUnlike?.() : onLike?.();
  };

  const sizeClass = styles[size] || styles.md;

  return (
    <button
      type="button"
      className={`
        ${styles.likeButton}
        ${sizeClass}
        ${isLiked ? styles.liked : ''}
        ${disabled ? styles.disabled : ''}
      `}
      onClick={handleClick}
      aria-label={isLiked ? "Descurtir" : "Curtir"}
      aria-pressed={isLiked}
      disabled={disabled}
    >
      <span className={styles.icon} aria-hidden="true">❤️</span>
      {showCount && <span className={styles.count}>{count}</span>}
    </button>
  );
};
