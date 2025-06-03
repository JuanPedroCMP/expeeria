import React, { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Componente Input reutilizável
 * Suporta input ou textarea, com variantes de tamanho, estado, estilo e ícone.
 */
export const Input = forwardRef(({
  type = 'text',             // Tipo do input (text, email, password, etc)
  label,                     // Rótulo do campo
  id,                        // ID para associação com <label>
  name,                      // Nome do campo (formulários)
  placeholder,               // Placeholder visível
  value,                     // Valor controlado
  onChange, onBlur,          // Eventos controlados
  error,                     // Texto de erro
  helperText,                // Texto de ajuda ou dica
  required = false,          // Campo obrigatório
  disabled = false,          // Desabilita interação
  readOnly = false,          // Torna apenas leitura
  fullWidth = false,         // Expande para largura máxima
  className = '',            // Classes adicionais externas
  icon,                      // Ícone embutido (JSX)
  size = 'md',               // Tamanho visual ('sm', 'md', 'lg')
  variant = 'outlined',      // Estilo ('outlined', 'filled', etc)
  ...props                   // Props extras propagadas ao input
}, ref) => {
  // Classes CSS compostas dinamicamente
  const inputContainerClasses = [
    styles.inputContainer,         // Container principal
    styles[size],                  // Tamanho
    styles[variant],               // Variante visual
    fullWidth ? styles.fullWidth : '',
    error ? styles.error : '',     // Se erro, aplica estilo
    disabled ? styles.disabled : '',
    icon ? styles.withIcon : '',   // Aplica espaço p/ ícone
    className                      // Classes externas
  ].filter(Boolean).join(' ');

  return (
    <div className={inputContainerClasses}>
      {/* Label (se fornecida) */}
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.requiredMark}>*</span>}
        </label>
      )}

      {/* Campo com ou sem ícone */}
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

      {/* Feedback abaixo do campo */}
      {(error || helperText) && (
        <div className={`${styles.helperText} ${error ? styles.errorText : ''}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});
