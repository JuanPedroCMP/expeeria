import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * Componente de spinner de carregamento reutilizável
 * Pode ser usado em qualquer lugar que precise indicar carregamento
 */
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  fullPage = false
}) => {
  const sizeClass = styles[size] || styles.md;
  const colorClass = styles[color] || styles.primary;
  const containerClass = fullPage ? styles.fullPageContainer : '';
  
  return (
    <div className={`${styles.spinnerContainer} ${containerClass}`}>
      <div className={`${styles.spinner} ${sizeClass} ${colorClass}`}></div>
    </div>
  );
};