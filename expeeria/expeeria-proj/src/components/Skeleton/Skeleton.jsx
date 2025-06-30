import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Componente Skeleton para exibir placeholders de carregamento
 * Melhora a experiu00eancia do usuu00e1rio enquanto o conteu00fado estu00e1 sendo carregado
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.type - Tipo de skeleton (avatar, texto, card, etc)
 * @param {string} props.width - Largura do skeleton
 * @param {string} props.height - Altura do skeleton
 * @param {string} props.borderRadius - Raio da borda
 * @param {number} props.repeat - Nu00famero de vezes para repetir o skeleton
 */
const Skeleton = ({ 
  type = 'text',
  width, 
  height, 
  borderRadius, 
  repeat = 1,
  className = '',
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'avatar':
        return {
          width: width || '50px',
          height: height || '50px',
          borderRadius: borderRadius || '50%'
        };
      case 'title':
        return {
          width: width || '70%',
          height: height || '32px',
          borderRadius: borderRadius || '4px'
        };
      case 'text':
        return {
          width: width || '100%',
          height: height || '16px',
          borderRadius: borderRadius || '4px'
        };
      case 'card':
        return {
          width: width || '100%',
          height: height || '200px',
          borderRadius: borderRadius || '8px'
        };
      case 'button':
        return {
          width: width || '120px',
          height: height || '40px',
          borderRadius: borderRadius || '8px'
        };
      case 'image':
        return {
          width: width || '100%',
          height: height || '200px',
          borderRadius: borderRadius || '8px'
        };
      default:
        return {
          width: width || '100%',
          height: height || '16px',
          borderRadius: borderRadius || '4px'
        };
    }
  };

  const renderSkeleton = () => {
    const items = [];
    for (let i = 0; i < repeat; i++) {
      const style = getTypeStyles();
      items.push(
        <div 
          key={i}
          className={`${styles.skeleton} ${className}`}
          style={style}
        />
      );
    }
    return items;
  };

  return (
    <div className={styles.skeletonWrapper}>
      {renderSkeleton()}
    </div>
  );
};

export { Skeleton };
