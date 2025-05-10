import React, { useState, useEffect } from 'react';
import styles from './AccessibilityMenu.module.css';

/**
 * Componente AccessibilityMenu
 * Menu flutuante para ajustes de acessibilidade como tamanho de fonte, contraste e reduu00e7u00e3o de animau00e7u00f5es
 */
const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrast: 'normal',
    reduceMotion: false,
    dyslexicFont: false
  });

  // Carregar configurau00e7u00f5es salvas no localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
      applySettings(JSON.parse(savedSettings));
    }
  }, []);

  // Aplicar configurau00e7u00f5es u00e0 pu00e1gina
  const applySettings = (newSettings) => {
    // Aplicar tamanho de fonte
    document.documentElement.setAttribute('data-font-size', newSettings.fontSize);
    
    // Aplicar contraste
    document.documentElement.setAttribute('data-contrast', newSettings.contrast);
    
    // Aplicar reduu00e7u00e3o de animau00e7u00f5es
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
    
    // Salvar configurau00e7u00f5es no localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
  };

  // Atualizar uma configurau00e7u00e3o especu00edfica
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  // Toggle para abrir/fechar o menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Resetar configurau00e7u00f5es para o padru00e3o
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
        className={styles.accessibilityButton}
        onClick={toggleMenu}
        aria-label="Menu de acessibilidade"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="4"></circle>
          <line x1="21.17" y1="8" x2="12" y2="8"></line>
          <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
          <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
        </svg>
      </button>
      
      {isOpen && (
        <div className={styles.accessibilityPanel} role="dialog" aria-label="Opu00e7u00f5es de acessibilidade">
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
                Mu00e9dia
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
                <span className={styles.toggleText}>Reduzir animau00e7u00f5es</span>
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
              aria-label="Resetar todas as configurau00e7u00f5es de acessibilidade"
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
