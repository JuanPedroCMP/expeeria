import React, { useState, useEffect } from 'react';
import styles from './AccessibilityMenu.module.css';

/**
 * Componente AccessibilityMenu
 * Menu flutuante para ajustes de acessibilidade como tamanho de fonte, contraste e redução de animações
 */
const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrast: 'normal',
    reduceMotion: false,
    dyslexicFont: false
  });

  // Carregar configurações salvas no localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
      applySettings(JSON.parse(savedSettings));
    }
  }, []);

  // Aplicar configurações à página
  const applySettings = (newSettings) => {
    // Aplicar tamanho de fonte
    document.documentElement.setAttribute('data-font-size', newSettings.fontSize);
    
    // Aplicar contraste
    document.documentElement.setAttribute('data-contrast', newSettings.contrast);
    
    // Aplicar redução de animações
    if (newSettings.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Aplicar fonte para dislexia
    if (newSettings.dyslexicFont) {
      document.documentElement.classList.add('dyslexic-font');
    } else {
      document.documentElement.classList.remove('dyslexic-font');
    }
    
    // Salvar configurações no localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
  };

  // Atualizar uma configuração específica
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  // Toggle para abrir/fechar o menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Resetar configurações para o padrão
  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 'medium',
      contrast: 'normal',
      reduceMotion: false,
      dyslexicFont: false
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
  };

  return (
    <div className={styles.accessibilityWrapper}>
      <button
        onClick={toggleMenu}
        className={styles.accessibilityButton}
        aria-label="Menu de acessibilidade"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
          <path d="M12 16c-1.7 0-3-1.3-3-3v3m6 0v-3c0 1.7-1.3 3-3 3"></path>
        </svg>
      </button>
      {isOpen && (
        <div className={styles.accessibilityPanel} role="dialog" aria-label="Opções de acessibilidade">
          <h2 className={styles.panelTitle}>Acessibilidade</h2>
          
          <div className={styles.settingGroup}>
            <h3>Tamanho da fonte</h3>
            <div className={styles.optionButtons}>
              <button 
                className={`${styles.optionButton} ${settings.fontSize === 'small' ? styles.active : ''}`}
                onClick={() => updateSetting('fontSize', 'small')}
                aria-pressed={settings.fontSize === 'small'}
              >
                Pequena
              </button>
              <button 
                className={`${styles.optionButton} ${settings.fontSize === 'medium' ? styles.active : ''}`}
                onClick={() => updateSetting('fontSize', 'medium')}
                aria-pressed={settings.fontSize === 'medium'}
              >
                Média
              </button>
              <button 
                className={`${styles.optionButton} ${settings.fontSize === 'large' ? styles.active : ''}`}
                onClick={() => updateSetting('fontSize', 'large')}
                aria-pressed={settings.fontSize === 'large'}
              >
                Grande
              </button>
              <button 
                className={`${styles.optionButton} ${settings.fontSize === 'x-large' ? styles.active : ''}`}
                onClick={() => updateSetting('fontSize', 'x-large')}
                aria-pressed={settings.fontSize === 'x-large'}
              >
                Extra grande
              </button>
            </div>
          </div>
          
          <div className={styles.settingGroup}>
            <h3>Contraste</h3>
            <div className={styles.optionButtons}>
              <button 
                className={`${styles.optionButton} ${settings.contrast === 'normal' ? styles.active : ''}`}
                onClick={() => updateSetting('contrast', 'normal')}
                aria-pressed={settings.contrast === 'normal'}
              >
                Normal
              </button>
              <button 
                className={`${styles.optionButton} ${settings.contrast === 'high' ? styles.active : ''}`}
                onClick={() => updateSetting('contrast', 'high')}
                aria-pressed={settings.contrast === 'high'}
              >
                Alto contraste
              </button>
            </div>
          </div>
          
          <div className={styles.settingGroup}>
            <div className={styles.toggleOption}>
              <label htmlFor="reduceMotion" className={styles.toggleLabel}>
                <input 
                  type="checkbox" 
                  id="reduceMotion" 
                  checked={settings.reduceMotion}
                  onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                />
                <span className={styles.toggleText}>Reduzir animações</span>
              </label>
            </div>
          </div>
          
          <div className={styles.settingGroup}>
            <div className={styles.toggleOption}>
              <label htmlFor="dyslexicFont" className={styles.toggleLabel}>
                <input 
                  type="checkbox" 
                  id="dyslexicFont" 
                  checked={settings.dyslexicFont}
                  onChange={(e) => updateSetting('dyslexicFont', e.target.checked)}
                />
                <span className={styles.toggleText}>Fonte para dislexia</span>
              </label>
            </div>
          </div>
          
          <div className={styles.panelFooter}>
            <button 
              className={styles.resetButton}
              onClick={resetSettings}
              aria-label="Resetar todas as configurações de acessibilidade"
            >
              Resetar
            </button>
            <button 
              className={styles.closeButton}
              onClick={toggleMenu}
              aria-label="Fechar menu de acessibilidade"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { AccessibilityMenu };
