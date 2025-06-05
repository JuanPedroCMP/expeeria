import React, { useState, useEffect } from 'react';
import styles from './ThemeSelector.module.css';

const THEME_IDS = ['default', 'dark', 'highContrast', 'colorful', 'calm'];
const themes = [
  { id: 'default', name: 'Padrão', color: '#0ea5e9' },
  { id: 'dark', name: 'Escuro', color: '#1e293b' },
  { id: 'highContrast', name: 'Alto Contraste', color: '#000000' },
  { id: 'colorful', name: 'Colorido', color: '#6366f1' },
  { id: 'calm', name: 'Calmo', color: '#14b8a6' },
];

export const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('expeeria-theme');
    const theme = THEME_IDS.includes(stored) ? stored : 'default';
    setCurrentTheme(theme);
    applyTheme(theme);
  }, []);

  const applyTheme = (themeId) => {
    THEME_IDS.forEach(t => document.documentElement.classList.remove(`theme-${t}`));
    document.documentElement.classList.add(`theme-${themeId}`);
    localStorage.setItem('expeeria-theme', themeId);
  };

  const handleChangeTheme = (id) => {
    setCurrentTheme(id);
    applyTheme(id);
    setIsOpen(false);
  };

  const current = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className={styles.themeSelector}>
      <button
        className={styles.themeButton}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Selecionar tema"
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{ backgroundColor: current.color }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.themeMenu} role="menu" aria-live="polite">
          <div className={styles.themeMenuHeader}>
            <h3>Escolha um Tema</h3>
            <button onClick={() => setIsOpen(false)} aria-label="Fechar menu" className={styles.closeButton}>
              &times;
            </button>
          </div>
          <div className={styles.themeOptions}>
            {themes.map(theme => (
              <button
                key={theme.id}
                className={`${styles.themeOption} ${currentTheme === theme.id ? styles.active : ''}`}
                onClick={() => handleChangeTheme(theme.id)}
                aria-pressed={currentTheme === theme.id}
                role="menuitem"
              >
                <div className={styles.themeColor} style={{ backgroundColor: theme.color }} />
                <span>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
