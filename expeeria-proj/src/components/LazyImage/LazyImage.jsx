import React, { useState, useEffect, useRef } from 'react';
import styles from './LazyImage.module.css';

/**
 * Componente LazyImage
 * Implementa carregamento lazy de imagens com placeholders e tratamento de erros
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.src - URL da imagem
 * @param {string} props.alt - Texto alternativo da imagem
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.placeholderColor - Cor do placeholder (hex ou rgba)
 * @param {function} props.onLoad - Funu00e7u00e3o chamada quando a imagem carrega
 * @param {function} props.onError - Funu00e7u00e3o chamada quando hu00e1 erro no carregamento
 * @param {Object} props.style - Estilos inline adicionais
 */
const LazyImage = ({
  src,
  alt = '',
  className = '',
  placeholderColor = 'rgba(15, 23, 42, 0.5)',
  onLoad,
  onError,
  style = {},
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Efeito para configurar o IntersectionObserver
  useEffect(() => {
    // Verificar suporte ao IntersectionObserver
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setInView(true);
              // Desconectar observador apu00f3s detectar que imagem estu00e1 em vista
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        { threshold: 0.1 } // 10% da imagem visu00edvel ju00e1 inicia carregamento
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback para navegadores sem suporte ao IntersectionObserver
      setInView(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Handlers de carregamento e erro
  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  return (
    <div 
      className={`${styles.lazyImageContainer} ${className}`}
      ref={imgRef}
      style={style}
    >
      {/* Placeholder que aparece enquanto a imagem carrega */}
      {!loaded && (
        <div 
          className={styles.placeholder}
          style={{ backgroundColor: placeholderColor }}
        >
          {!inView && (
            <div className={styles.blurredPlaceholder}></div>
          )}
          {inView && !error && (
            <div className={styles.loadingIndicator}>
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>
      )}

      {/* Fallback para imagem quebrada */}
      {error && (
        <div className={styles.errorFallback}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Imagem indisponu00edvel</span>
        </div>
      )}

      {/* Imagem real carregada apenas quando estiver na viewport */}
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
