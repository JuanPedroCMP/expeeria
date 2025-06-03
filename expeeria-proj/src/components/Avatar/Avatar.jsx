import React from 'react';
import styles from './Avatar.module.css';

/**
 * Componente de Avatar reutilizável
 * Exibe a imagem de perfil de um usuário com opções de tamanho, clique e fallback
 */

export const Avatar = ({
  src,              // URL da imagem do avatar
  username,         // Nome do usuário (usado para acessibilidade no atributo alt)
  size = 'md',      // Tamanho do avatar ('sm', 'md', 'lg'...), padrão é 'md'
  clickable = false,// Define se o avatar pode ser clicado
  onClick,          // Função executada ao clicar no avatar
}) => {

  // Caminho da imagem padrão usada como fallback
  const defaultAvatar = "/default-avatar.png";

  // Define a classe CSS com base no tamanho fornecido
  const sizeClass = styles[size] || styles.md;

  // Adiciona classe de estilo extra se o avatar for clicável
  const clickableClass = clickable ? styles.clickable : '';

  return (
    <img
      src={src || defaultAvatar}                       // Usa o avatar fornecido, ou a imagem padrão
      alt={`Avatar de ${username || 'usuário'}`}       // Texto alternativo para acessibilidade
      className={`${styles.avatar} ${sizeClass} ${clickableClass}`} // Classes CSS compostas
      onClick={clickable ? onClick : undefined}        // Executa a função apenas se for clicável
      onError={(e) => e.currentTarget.src = defaultAvatar} // Se a imagem falhar, usa o avatar padrão
      role={clickable ? 'button' : undefined}          // Adiciona papel de botão para acessibilidade
      tabIndex={clickable ? 0 : undefined}             // Permite foco via teclado se clicável
    />
  );
};
