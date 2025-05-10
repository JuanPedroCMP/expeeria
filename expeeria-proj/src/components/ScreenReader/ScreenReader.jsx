import React, { useState, useEffect, useRef } from 'react';
import styles from './ScreenReader.module.css';

/**
 * Componente ScreenReader
 * 
 * Permite que o conteúdo da página seja lido em voz alta para usuários com deficiências visuais.
 * Integra-se com os recursos de acessibilidade existentes e fornece controles para pausar, 
 * continuar e parar a leitura.
 */
const ScreenReader = () => {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const utteranceRef = useRef(null);
  const speechSynthRef = useRef(window.speechSynthesis);
  
  /**
   * Toggle a visibilidade do componente
   */
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  /**
   * Encontra e lê todo o conteúdo principal da página atual
   */
  const readPageContent = () => {
    // Prioridade para elementos com role="main" ou tag <main>
    const mainElement = document.querySelector('[role="main"], main') || document.body;
    
    // Filtrar elementos que não devem ser lidos (menus de navegação, rodapés, etc)
    const elementsToSkip = [
      'nav', 'footer', 'header', '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'
    ];
    
    const skipSelector = elementsToSkip.join(', ');
    const nodesToSkip = Array.from(mainElement.querySelectorAll(skipSelector));
    
    // Função recursiva para extrair texto legível de um elemento e seus filhos
    const extractText = (node) => {
      // Ignorar elementos a serem pulados
      if (nodesToSkip.includes(node)) return '';
      
      // Ignorar elementos escondidos
      if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return '';
      }
      
      // Se for um nó de texto, retornar seu conteúdo
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent.trim();
      }
      
      // Se for aria-hidden="true", ignorar
      if (node.getAttribute && node.getAttribute('aria-hidden') === 'true') return '';
      
      // Extrair texto de elementos filhos recursivamente
      let text = '';
      for (let child of node.childNodes) {
        text += ' ' + extractText(child);
      }
      return text.trim();
    };
    
    const extractedText = extractText(mainElement);
    const cleanedText = extractedText
      .replace(/\s+/g, ' ')
      .trim();
    
    setCurrentText(cleanedText);
    startReading(cleanedText);
  };

  /**
   * Inicia a leitura do texto fornecido
   */
  const startReading = (text) => {
    if (!text) return;
    
    // Parar qualquer leitura em andamento
    stopReading();
    
    // Criar nova utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Configurar eventos da utterance
    utterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
    };
    
    // Iniciar leitura
    speechSynthRef.current.speak(utterance);
  };

  /**
   * Pausa ou continua a leitura
   */
  const togglePause = () => {
    if (isPaused) {
      speechSynthRef.current.resume();
      setIsPaused(false);
    } else {
      speechSynthRef.current.pause();
      setIsPaused(true);
    }
  };

  /**
   * Para a leitura atual
   */
  const stopReading = () => {
    speechSynthRef.current.cancel();
    setIsReading(false);
    setIsPaused(false);
  };

  /**
   * Configura event listeners para teclas de atalho
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+R: Iniciar/parar leitura
      if (e.altKey && e.key === 'r') {
        if (isReading) {
          stopReading();
        } else {
          readPageContent();
        }
      }
      
      // Alt+P: Pausar/continuar leitura
      if (isReading && e.altKey && e.key === 'p') {
        togglePause();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReading, isPaused]);

  /**
   * Parar a leitura quando o componente for desmontado
   */
  useEffect(() => {
    return () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  return (
    <>
      <button 
        className={styles.toggleButton}
        onClick={toggleVisibility}
        aria-label="Abrir leitor de tela"
        title="Leitor de tela">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round">
          <path d="M15 8a7.4 7.4 0 0 1 4 6"></path>
          <path d="M17.7 15c.1-.5.3-1 .3-1.5a9 9 0 0 0-9-9"></path>
          <path d="M10 5.2A9 9 0 0 0 5 13.5"></path>
          <path d="M7.1 14a7.4 7.4 0 0 1 1-3.4"></path>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      </button>
      
      {isVisible && (
        <div className={styles.screenReaderPanel}>
          <div className={styles.panelHeader}>
            <h3>Leitor de Tela</h3>
            <button 
              className={styles.closeButton}
              onClick={toggleVisibility}
              aria-label="Fechar leitor de tela">
              &times;
            </button>
          </div>
          
          <div className={styles.panelContent}>
            <p className={styles.instructions}>
              <strong>Atalhos:</strong> Alt+R (iniciar/parar), Alt+P (pausar/continuar)
            </p>
            
            <div className={styles.controls}>
              {!isReading ? (
                <button 
                  className={styles.actionButton}
                  onClick={readPageContent}
                  aria-label="Ler conteúdo da página">
                  Ler página
                </button>
              ) : (
                <>
                  <button 
                    className={styles.actionButton}
                    onClick={togglePause}
                    aria-label={isPaused ? "Continuar leitura" : "Pausar leitura"}>
                    {isPaused ? "Continuar" : "Pausar"}
                  </button>
                  
                  <button 
                    className={`${styles.actionButton} ${styles.stopButton}`}
                    onClick={stopReading}
                    aria-label="Parar leitura">
                    Parar
                  </button>
                </>
              )}
            </div>
            
            {isReading && (
              <div className={styles.statusIndicator}>
                <div className={`${styles.indicator} ${isPaused ? styles.paused : styles.active}`}></div>
                <span>{isPaused ? "Pausado" : "Lendo..."}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export { ScreenReader };
