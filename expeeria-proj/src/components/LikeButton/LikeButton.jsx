import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './LikeButton.module.css';

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
    
    if (isLiked) {
      onUnlike && onUnlike();
    } else {
      onLike && onLike();
    }
  };
  
  const sizeClass = styles[size] || styles.md;
  
  return (
    <button
      className={`${styles.likeButton} ${sizeClass} ${isLiked ? styles.liked : ''} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      aria-label={isLiked ? "Descurtir" : "Curtir"}
    >
      <svg 
        className={styles.icon}
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill={isLiked ? "#e63946" : "none"}
        stroke={isLiked ? "#e63946" : "currentColor"}
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      {showCount && <span className={styles.count}>{count}</span>}
    </button>
  );
};