import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Navbar.module.css';

export const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm}>
      <input
        type="text"
        placeholder="Pesquisar posts..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className={styles.searchInput}
      />
      <button type="submit" className={styles.searchButton}>
        🔍
      </button>
    </form>
  );
};