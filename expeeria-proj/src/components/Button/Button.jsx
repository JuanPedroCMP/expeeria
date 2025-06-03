import React from 'react';
import styles from './Button.module.css';
import { Link } from 'react-router-dom';

/**
 * Componente Button reutilizável com variantes visuais e comportamentos dinâmicos.
 * Pode ser renderizado como <button>, <a> ou <Link>.
 */
export const Button = ({
  children,              // Conteúdo interno (texto ou ícones)
  variant = 'primary',   // Variante visual: 'primary', 'secondary'...
  size = 'md',           // Tamanho do botão: 'sm', 'md', 'lg'...
  fullWidth = false,     // Ocupa toda a largura disponível
  disabled = false,      // Estado de desabilitado
  onClick,               // Função chamada ao clicar
  href,                  // Link externo (abre <a>)
  to,                    // Link interno (abre <Link>)
  type = 'button',       // Tipo do botão nativo
  className = '',        // Classes CSS adicionais
  ...props               // Outras props adicionais
}) => {
  // Classes dinâmicas geradas com base nas props
  const buttonClasses = [
    styles.button,                         // Classe base
    styles[variant],                       // Variante visual
    styles[size],                          // Tamanho
    fullWidth ? styles.fullWidth : '',     // Aplica largura total
    disabled ? styles.disabled : '',       // Estilo para estado desabilitado
    className                              // Classes adicionais do usuário
  ].filter(Boolean).join(' ');             // Limpa classes inválidas e une

  // Renderiza como <Link> (roteamento interno)
  if (to) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        onClick={!disabled ? onClick : undefined} // Bloqueia clique se desabilitado
        aria-disabled={disabled}                  // Acessibilidade
        tabIndex={disabled ? -1 : 0}              // Impede foco via teclado se desabilitado
        {...props}
      >
        {children}
      </Link>
    );
  }

  // Renderiza como <a> (link externo)
  if (href) {
    return (
      <a
        href={disabled ? undefined : href}         // Impede navegação se desabilitado
        className={buttonClasses}
        onClick={!disabled ? onClick : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Renderiza como <button> nativo
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={!disabled ? onClick : undefined}  // Desativa clique se necessário
      disabled={disabled}                        // Prop nativa do botão
      {...props}
    >
      {children}
    </button>
  );
};
