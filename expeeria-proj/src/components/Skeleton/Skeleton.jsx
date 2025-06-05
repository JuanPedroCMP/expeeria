import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Skeleton: componente visual para estados de carregamento
 * Tipos: avatar, text, title, card, button, image
 */
const Skeleton = ({
  type = 'text',
  width,
  height,
  borderRadius,
  repeat = 1,
  className = '',
}) => {
  const getDefaults = () => {
    switch (type) {
      case 'avatar': return ['50px', '50px', '50%'];
      case 'title': return ['70%', '32px', '4px'];
      case 'text': return ['100%', '16px', '4px'];
      case 'card': return ['100%', '200px', '8px'];
      case 'button': return ['120px', '40px', '8px'];
      case 'image': return ['100%', '200px', '8px'];
      default: return ['100%', '16px', '4px'];
    }
  };

  const [defaultW, defaultH, defaultR] = getDefaults();
  const style = {
    width: width || defaultW,
    height: height || defaultH,
    borderRadius: borderRadius || defaultR,
  };

  return (
    <div className={styles.skeletonWrapper} aria-hidden="true">
      {Array.from({ length: repeat }).map((_, idx) => (
        <div
          key={idx}
          className={`${styles.skeleton} ${className}`}
          style={style}
        />
      ))}
    </div>
  );
};

export { Skeleton };