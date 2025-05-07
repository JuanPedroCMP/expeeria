import React, { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';
/**
 * Componente para alternar entre os temas claro e escuro
 * @param {Object} props - Propriedades do componente
 * @param {boolean} [props.fixed=false] - Se o botão deve ficar fixo no canto da tela
 * @param {string} [props.className] - Classes adicionais para o componente
 */
export const ThemeToggle = ({ fixed = false, className = '' }) => {
  // Estado para armazenar o tema atual
  const [theme, setTheme] = useState('dark');
  
  // Carregar o tema salvo ao iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  
  // Alternar entre os temas claro e escuro
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  return (
    <button 
      onClick={toggleTheme}
      className={`${styles.themeToggle} ${fixed ? styles.fixed : ''} ${className}`}
      aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {theme === 'dark' ? (
        // Ícone do sol para o tema escuro (vai alternar para claro)
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : (
        // Ícone da lua para o tema claro (vai alternar para escuro)
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
};
