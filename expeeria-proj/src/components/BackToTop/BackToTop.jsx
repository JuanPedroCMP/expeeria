import React, { useState, useEffect } from 'react';
import styles from './BackToTop.module.css';

/**
 * Componente BackToTop
 * Exibe um botão que aparece ao rolar a página, permitindo voltar suavemente ao topo.
 */
const BackToTop = () => {
  // Estado que controla a visibilidade do botão
  const [isVisible, setIsVisible] = useState(false);

  // Hook para escutar o evento de rolagem e definir visibilidade do botão
  useEffect(() => {
    // Função que determina se o botão deve ser exibido
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    // Adiciona o listener de scroll
    window.addEventListener('scroll', toggleVisibility);

    // Verificação inicial na montagem do componente
    toggleVisibility();

    // Remove o listener ao desmontar o componente
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Função que rola suavemente até o topo da página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Se não for visível, não renderiza nada
  if (!isVisible) return null;

  return (
    <button 
      className={styles.backToTopButton}         // Classe de estilo personalizada
      onClick={scrollToTop}                      // Ação ao clicar no botão
      aria-label="Voltar ao topo da página"      // Descrição para leitores de tela
      title="Voltar ao topo"                     // Tooltip visível ao passar o mouse
      role="button"                              // Declara como botão para acessibilidade
      tabIndex={0}                               // Permite foco via teclado
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Ícone de seta apontando para cima */}
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
};

export { BackToTop };
