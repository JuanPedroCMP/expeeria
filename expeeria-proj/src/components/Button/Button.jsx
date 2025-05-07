import React from 'react';
import styles from './Button.module.css';
import { Link } from 'react-router-dom';

/**
 * Componente Button reutilizável com diversas variantes
 * Serve tanto como botão normal quanto como link
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  href,
  to,
  type = 'button',
  className = '',
  ...props
}) => {
  // Classes de estilo
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    disabled ? styles.disabled : '',
    className
  ].filter(Boolean).join(' ');
  
  // Renderizar como link interno (react-router)
  if (to) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        onClick={!disabled ? onClick : undefined}
        {...props}
      >
        {children}
      </Link>
    );
  }
  
  // Renderizar como link externo
  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        onClick={!disabled ? onClick : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }
  
  // Renderizar como botão
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
