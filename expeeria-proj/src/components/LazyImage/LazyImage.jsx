import React, { useState, useEffect, useRef } from 'react';
import styles from './LazyImage.module.css';

/**
 * Componente LazyImage
 * Carrega imagens sob demanda com placeholder, fallback e IntersectionObserver.
 */
const LazyImage = ({
  src,                             // URL da imagem
  alt = '',                        // Texto alternativo
  className = '',                  // Classes adicionais
  placeholderColor = 'rgba(15, 23, 42, 0.5)', // Cor do placeholder
  onLoad,                          // Callback após sucesso
  onError,                         // Callback ao erro
  style = {},                      // Estilo inline
  ...props                         // Outras props passadas ao <img>
}) => {
  const [loaded, setLoaded] = useState(false);    // Estado da imagem carregada
  const [error, setError] = useState(false);      // Estado de erro de carregamento
  const [inView, setInView] = useState(false);    // Se está na viewport

  const imgRef = useRef(null);                    // Referência ao wrapper do componente
  const observerRef = useRef(null);               // Referência ao observer

  // Configurar IntersectionObserver
  useEffect(() => {
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setInView(true);
              observerRef.current?.disconnect();  // Desliga observer após detectar
            }
          });
        },
        { threshold: 0.1 } // Ativa quando 10% da imagem entra na viewport
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback para navegadores sem suporte
      setInView(true);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  // Ao carregar a imagem
  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  // Ao falhar o carregamento
  const handleError = () => {
    setError(true);
    onError?.();
  };

  return (
    <div
      className={`${styles.lazyImageContainer} ${className}`}
      ref={imgRef}
      style={style}
    >
      {/* Placeholder enquanto a imagem ainda não carrega */}
      {!loaded && (
        <div className={styles.placeholder} style={{ backgroundColor: placeholderColor }}>
          {!inView ? (
            <div className={styles.blurredPlaceholder}></div>
          ) : !error ? (
            <div className={styles.loadingIndicator}>
              <div className={styles.spinner}></div>
            </div>
          ) : null}
        </div>
      )}

      {/* Fallback visual se a imagem falhar */}
      {error && (
        <div className={styles.errorFallback}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Imagem indisponível</span>
        </div>
      )}

      {/* Imagem carregada apenas quando estiver visível */}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          className={`${styles.lazyImage} ${loaded ? styles.loaded : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export { LazyImage };
