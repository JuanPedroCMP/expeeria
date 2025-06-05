import React, { useState, useEffect, useRef } from 'react';
import styles from './ScreenReader.module.css';

/**
 * Componente ScreenReader
 * 
 * Leitura em voz alta de páginas HTML com atalhos de teclado e controles visuais.
 * - Alt+R: Iniciar/Parar leitura
 * - Alt+P: Pausar/Continuar leitura
 */
const ScreenReader = () => {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const utteranceRef = useRef(null);
  const speechSynthRef = useRef(window.speechSynthesis);

  const toggleVisibility = () => setIsVisible(v => !v);

  // 🔎 Extrai texto legível da <main> (ou body)
  const readPageContent = () => {
    const mainElement = document.querySelector('[role="main"], main') || document.body;
    const skip = ['nav', 'footer', 'header', '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'];
    const skipNodes = Array.from(mainElement.querySelectorAll(skip.join(', ')));

    const extractText = (node) => {
      if (skipNodes.includes(node)) return '';
      if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return '';
      }
      if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim();
      if (node.getAttribute?.('aria-hidden') === 'true') return '';
      let text = '';
      for (const child of node.childNodes) text += ' ' + extractText(child);
      return text.trim();
    };

    const text = extractText(mainElement).replace(/\s+/g, ' ').trim();
    setCurrentText(text);
    startReading(text);
  };

  // 🔊 Inicia leitura do texto
  const startReading = (text) => {
    stopReading();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.onstart = () => { setIsReading(true); setIsPaused(false); };
    utterance.onend = () => { setIsReading(false); setIsPaused(false); };

    speechSynthRef.current.speak(utterance);
  };

  // ⏯️ Alterna pausa e continuação
  const togglePause = () => {
    if (isPaused) {
      speechSynthRef.current.resume();
      setIsPaused(false);
    } else {
      speechSynthRef.current.pause();
      setIsPaused(true);
    }
  };

  // ⏹️ Cancela leitura
  const stopReading = () => {
    speechSynthRef.current.cancel();
    setIsReading(false);
    setIsPaused(false);
  };

  // ⌨️ Atalhos Alt+R / Alt+P
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'r') {
        isReading ? stopReading() : readPageContent();
      }
      if (e.altKey && e.key === 'p' && isReading) {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReading, isPaused]);

  // 🧼 Cancela leitura ao desmontar
  useEffect(() => () => speechSynthRef.current.cancel(), []);

  return (
    <>
      <button 
        className={styles.toggleButton}
        onClick={toggleVisibility}
        aria-label="Abrir leitor de tela"
        title="Leitor de tela"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      </button>

      {isVisible && (
        <div className={styles.screenReaderPanel}>
          <div className={styles.panelHeader}>
            <h3>Leitor de Tela</h3>
            <button 
              className={styles.closeButton}
              onClick={toggleVisibility}
              aria-label="Fechar leitor de tela"
            >
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
                  aria-label="Ler conteúdo da página"
                >
                  Ler página
                </button>
              ) : (
                <>
                  <button
                    className={styles.actionButton}
                    onClick={togglePause}
                    aria-label={isPaused ? "Continuar leitura" : "Pausar leitura"}
                  >
                    {isPaused ? "Continuar" : "Pausar"}
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.stopButton}`}
                    onClick={stopReading}
                    aria-label="Parar leitura"
                  >
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
