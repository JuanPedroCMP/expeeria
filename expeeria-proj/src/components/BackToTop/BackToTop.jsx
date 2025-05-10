import React, { useState, useEffect } from 'react';
import styles from './BackToTop.module.css';

/**
 * Componente BackToTop
 * Exibe um botão para retornar ao topo da página quando o usuário rola para baixo
 */
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Monitorar o evento de rolagem
  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar o botão quando a página rolar mais de 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Adicionar o listener de rolagem
    window.addEventListener('scroll', toggleVisibility);

    // Verificar a posição inicial
    toggleVisibility();

    // Remover o listener quando o componente for desmontado
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Função para rolar de volta ao topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Renderizar o botão apenas quando visível
  if (!isVisible) {
    return null;
  }

  return (
    <button 
      className={styles.backToTopButton}
      onClick={scrollToTop}
      aria-label="Voltar ao topo da página"
      title="Voltar ao topo"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="16 14 12 10 8 14"></polyline>
      </svg>
    </button>
  );
};

export { BackToTop };
