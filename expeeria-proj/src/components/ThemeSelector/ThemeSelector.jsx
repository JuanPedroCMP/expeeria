import React, { useState, useEffect } from 'react';
import styles from './ThemeSelector.module.css';

/**
 * Componente ThemeSelector
 * 
 * Permite que o usuu00e1rio selecione entre difierentes temas para a aplicau00e7u00e3o.
 * Os temas su00e3o aplicados atravu00e9s de classes CSS no elemento root.
 */
const ThemeSelector = () => {
  // Temas disponu00edveis
  const themes = [
    { id: 'default', name: 'Padru00e3o', color: '#0ea5e9' },
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

  // Funu00e7u00e3o para aplicar o tema selecionado
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

  // Funu00e7u00e3o para alterar o tema
  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  // Funu00e7u00e3o para alternar a visibilidade do menu
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
        <div 
          className={styles.themeButtonColor} 
          style={{ backgroundColor: currentThemeObj.color }}
        />
        <span>Tema</span>
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
