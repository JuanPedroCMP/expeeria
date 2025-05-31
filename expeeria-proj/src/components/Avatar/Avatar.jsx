import React from 'react';
import styles from './Avatar.module.css';

/**
 * Componente de Avatar reutilizável
 * Exibe a imagem de perfil de usuário com opções de tamanho e estilo
 */
export const Avatar = ({ 
  src, 
  username, 
  size = 'md', 
  clickable = false,
  onClick = () => {} 
}) => {
  // Imagem padrão se não tiver avatar
  const defaultAvatar = "/default-avatar.png";
  
  // Classes baseadas no tamanho
  const sizeClass = styles[size] || styles.md;
  const clickableClass = clickable ? styles.clickable : '';
  
  return (
    <img
      src={src || defaultAvatar}
      alt={`Avatar de ${username || 'usuário'}`}
      className={`${styles.avatar} ${sizeClass} ${clickableClass}`}
      onClick={clickable ? onClick : undefined}
    />
  );
};