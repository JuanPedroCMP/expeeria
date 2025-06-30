import React, { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Componente Input reutilizável com diversas variantes
 * Suporta diferentes tipos de campos e estados
 */
export const Input = forwardRef(({
  type = 'text',
  label,
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  fullWidth = false,
  className = '',
  icon,
  size = 'md',
  variant = 'outlined',
  ...props
}, ref) => {
  // Classes de estilo
  const inputContainerClasses = [
    styles.inputContainer,
    styles[size],
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    error ? styles.error : '',
    disabled ? styles.disabled : '',
    icon ? styles.withIcon : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={inputContainerClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.requiredMark}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && <div className={styles.icon}>{icon}</div>}
        {type === 'textarea' ? (
          <textarea
            ref={ref}
            id={id}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readOnly}
            className={styles.textarea}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            id={id}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readOnly}
            className={styles.input}
            {...props}
          />
        )}
      </div>
      {(error || helperText) && (
        <div className={`${styles.helperText} ${error ? styles.errorText : ''}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});