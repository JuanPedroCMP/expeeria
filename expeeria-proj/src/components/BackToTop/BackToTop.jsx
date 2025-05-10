import React, { useState, useEffect } from 'react';
import styles from './BackToTop.module.css';

/**
 * Componente BackToTop
 * Exibe um botu00e3o para retornar ao topo da pu00e1gina quando o usuu00e1rio rola para baixo
 */
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Monitorar o evento de rolagem
  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar o botu00e3o quando a pu00e1gina rolar mais de 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Adicionar o listener de rolagem
    window.addEventListener('scroll', toggleVisibility);

    // Verificar a posiu00e7u00e3o inicial
    toggleVisibility();

    // Remover o listener quando o componente for desmontado
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Funu00e7u00e3o para rolar de volta ao topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Renderizar o botu00e3o apenas quando visu00edvel
  if (!isVisible) {
    return null;
  }

  return (
    <button 
      className={styles.backToTopButton}
      onClick={scrollToTop}
      aria-label="Voltar ao topo da pu00e1gina"
      title="Voltar ao topo"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  );
};

export { BackToTop };
