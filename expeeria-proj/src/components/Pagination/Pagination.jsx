import React from 'react';
import styles from './Pagination.module.css';

/**
 * Componente de paginação
 * Exibe controle de páginas com suporte a elipses e botões de navegação.
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,         // Quantidade de páginas ao redor da atual
  showFirstButton = true,   // Mostrar página 1 sempre
  showLastButton = true,    // Mostrar última página sempre
  size = 'md',              // Tamanho visual ('sm', 'md', 'lg')
  className = ''            // Classes adicionais
}) => {
  if (totalPages <= 1) return null; // Não mostra se só há uma página

  // Gera a lista de páginas para exibir (com elipses)
  const getPageNumbers = () => {
    const totalVisible = siblingCount * 2 + 5; // Máximo de botões visíveis
    if (totalPages <= totalVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const left = Math.max(currentPage - siblingCount, 1);
    const right = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = left > 2;
    const showRightDots = right < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = Array.from(
        { length: 3 + 2 * siblingCount },
        (_, i) => totalPages - (3 + 2 * siblingCount) + i + 1
      );
      return [1, '...', ...rightRange];
    }

    if (showLeftDots && showRightDots) {
      const middleRange = Array.from({ length: right - left + 1 }, (_, i) => left + i);
      return [1, '...', ...middleRange, '...', totalPages];
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className={`${styles.pagination} ${styles[size]} ${className}`}>
      <ul className={styles.pageList}>
        {/* Página anterior */}
        <li className={styles.pageItem}>
          <button
            className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            &lt;
          </button>
        </li>

        {/* Números de página + elipses */}
        {pageNumbers.map((page, index) => (
          <li key={index} className={styles.pageItem}>
            {page === '...' ? (
              <span className={styles.ellipsis}>…</span>
            ) : (
              <button
                className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Próxima página */}
        <li className={styles.pageItem}>
          <button
            className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Próxima página"
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};
