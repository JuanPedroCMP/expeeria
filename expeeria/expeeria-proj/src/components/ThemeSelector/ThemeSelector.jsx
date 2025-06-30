import React, { useState, useEffect } from 'react';
import styles from './ThemeSelector.module.css';

/**
 * Componente ThemeSelector
 * 
 * Permite que o usuário selecione entre diferentes temas para a aplicação.
 * Os temas são aplicados através de classes CSS no elemento root.
 */
const ThemeSelector = () => {
  // Temas disponíveis
  const themes = [
    { id: 'default', name: 'Padrão', color: '#0ea5e9' },
    { id: 'dark', name: 'Escuro', color: '#1e293b' },
    { id: 'highContrast', name: 'Alto Contraste', color: '#000000' },
    { id: 'colorful', name: 'Colorido', color: '#6366f1' },
    { id: 'calm', name: 'Calmo', color: '#14b8a6' },
  ];

  // Estado para controlar o tema atual e menu aberto/fechado
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isOpen, setIsOpen] = useState(false);

  // Efeito para carregar o tema do localStorage ao montar o componente
  useEffect(() => {
    const savedTheme = localStorage.getItem('expeeria-theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // Função para aplicar o tema selecionado
  const applyTheme = (themeId) => {
    // Remover todas as classes de tema anteriores
    document.documentElement.classList.remove(
      'theme-default',
      'theme-dark',
      'theme-highContrast',
      'theme-colorful',
      'theme-calm'
    );
    
    // Adicionar a classe do novo tema
    document.documentElement.classList.add(`theme-${themeId}`);
    
    // Salvar a preferu00eancia no localStorage
    localStorage.setItem('expeeria-theme', themeId);
  };

  // Função para alterar o tema
  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  // Função para alternar a visibilidade do menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Encontrar o tema atual para exibir sua cor no botou00e3o
  const currentThemeObj = themes.find(theme => theme.id === currentTheme) || themes[0];

  return (
    <div className={styles.themeSelector}>
      <button 
        className={styles.themeButton}
        onClick={toggleMenu}
        aria-label="Selecionar tema"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2" />
          <path d="M12 21v2" />
          <path d="M4.22 4.22l1.42 1.42" />
          <path d="M18.36 18.36l1.42 1.42" />
          <path d="M1 12h2" />
          <path d="M21 12h2" />
          <path d="M4.22 19.78l1.42-1.42" />
          <path d="M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.themeMenu} role="menu">
          <div className={styles.themeMenuHeader}>
            <h3>Escolha um Tema</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Fechar menu de temas"
            >
              &times;
            </button>
          </div>
          
          <div className={styles.themeOptions}>
            {themes.map(theme => (
              <button
                key={theme.id}
                className={`${styles.themeOption} ${currentTheme === theme.id ? styles.active : ''}`}
                onClick={() => changeTheme(theme.id)}
                aria-pressed={currentTheme === theme.id}
                role="menuitem"
              >
                <div 
                  className={styles.themeColor} 
                  style={{ backgroundColor: theme.color }}
                />
                <span>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { ThemeSelector };
