import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      navigate("/"); // Redireciona para home para mostrar resultados
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        type="text"
        placeholder="Pesquisar posts..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          borderRadius: 6,
          border: "none",
          padding: "0.5rem 1rem",
          background: "#23283a",
          color: "#fff"
        }}
      />
      <button type="submit" style={{
        borderRadius: 6,
        border: "none",
        background: "#0575e6",
        color: "#fff",
        padding: "0.5rem 1rem",
        cursor: "pointer"
      }}>
        🔍
      </button>
    </form>
  );
};