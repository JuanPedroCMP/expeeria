import React from 'react';
import styles from './Pagination.module.css';

/**
 * Componente de paginação reutilizável
 * Pode ser usado em qualquer listagem de dados que precise de paginação
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstButton = true,
  showLastButton = true,
  size = 'md',
  className = ''
}) => {
  // Se houver apenas uma página, não renderiza nada
  if (totalPages <= 1) return null;
  
  // Função para gerar os números das páginas a serem exibidos
  const getPageNumbers = () => {
    // Total de itens que sempre aparecem (primeira, última, atual, next, prev)
    const fixedPagesCount = showFirstButton && showLastButton ? 4 : 2;
    // Quantidade de itens que podem ser mostrados considerando o espaço disponível
    const totalNumbers = siblingCount * 2 + 1 + fixedPagesCount;
    
    // Se há espaço para mostrar todas as páginas
    if (totalPages <= totalNumbers) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    
    // Cálculo dos irmãos à esquerda e à direita
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Decide se mostra os pontos de elipse
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;
    
    // Caso 1: só pontos à direita
    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, index) => index + 1);
      return [...leftRange, '...', totalPages];
    }
    
    // Caso 2: só pontos à esquerda
    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, index) => totalPages - rightItemCount + index + 1
      );
      return [1, '...', ...rightRange];
    }
    
    // Caso 3: pontos em ambos os lados
    if (showLeftDots && showRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, index) => leftSiblingIndex + index
      );
      return [1, '...', ...middleRange, '...', totalPages];
    }
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav className={`${styles.pagination} ${styles[size]} ${className}`}>
      <ul className={styles.pageList}>
        {/* Botão de página anterior */}
        <li className={styles.pageItem}>
          <button
            className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
        </li>
        
        {/* Números de página */}
        {pageNumbers.map((page, index) => (
          <li key={index} className={styles.pageItem}>
            {page === '...' ? (
              <span className={styles.ellipsis}>...</span>
            ) : (
              <button
                className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )}
          </li>
        ))}
        
        {/* Botão de próxima página */}
        <li className={styles.pageItem}>
          <button
            className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};