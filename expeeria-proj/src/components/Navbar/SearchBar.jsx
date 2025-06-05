import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Navbar.module.css';

/**
 * Componente SearchBar
 * Campo de busca com botão e submit controlado.
 */
export const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");          // Estado da string de busca
  const navigate = useNavigate();                  // (opcional) permite redirecionamento

  // Ao submeter o formulário
  const handleSubmit = (e) => {
    e.preventDefault();                            // Evita reload da página
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery);                      // Chama função externa com a busca
      navigate(`/?search=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm}>
      <input
        type="text"
        placeholder="Pesquisar posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
        aria-label="Pesquisar"
      />
      <button type="submit" className={styles.searchButton} aria-label="Buscar">
        🔍
      </button>
    </form>
  );
};
