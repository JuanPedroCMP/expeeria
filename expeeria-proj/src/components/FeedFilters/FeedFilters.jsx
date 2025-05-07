import { useState } from "react";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import styles from "./FeedFilters.module.css";

/**
 * Componente de filtros para o Feed
 * Separado para melhorar a organização e reutilização
 */
export const FeedFilters = ({ 
  search, 
  setSearch, 
  selectedAreas, 
  setSelectedAreas,
  author,
  setAuthor,
  order,
  setOrder,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onFiltersChanged,
  resetPageSize
}) => {
  const [showCategories, setShowCategories] = useState(false);

  // Limpar filtros
  const limparFiltros = () => {
    setSearch("");
    setSelectedAreas([]);
    setAuthor("");
    setOrder("recentes");
    setDateFrom("");
    setDateTo("");
    resetPageSize();
    
    if (onFiltersChanged) {
      onFiltersChanged();
    }
  };

  return (
    <div className={styles.filtrosPainel}>
      <input
        type="text"
        placeholder="Buscar por título, conteúdo ou autor..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          resetPageSize();
        }}
      />
      <button
        type="button"
        className={styles.categoriasToggle}
        onClick={() => setShowCategories((v) => !v)}
      >
        {showCategories ? "Ocultar categorias" : "Filtrar por categorias"}
      </button>
      {showCategories && (
        <div className={styles.categoriasBox}>
          {categoriasPadrao.map((cat) => (
            <label key={cat} className={styles.categoriaLabel}>
              <input
                type="checkbox"
                checked={selectedAreas.includes(cat)}
                onChange={e => {
                  resetPageSize();
                  if (e.target.checked) setSelectedAreas([...selectedAreas, cat]);
                  else setSelectedAreas(selectedAreas.filter(a => a !== cat));
                }}
              />
              {cat}
            </label>
          ))}
        </div>
      )}
      <input
        type="text"
        placeholder="Filtrar por autor"
        value={author}
        onChange={e => {
          setAuthor(e.target.value);
          resetPageSize();
        }}
        style={{ minWidth: 120 }}
      />
      <label className={styles.dataLabel}>
        De:
        <input
          type="date"
          value={dateFrom}
          onChange={e => {
            setDateFrom(e.target.value);
            resetPageSize();
          }}
        />
      </label>
      <label className={styles.dataLabel}>
        Até:
        <input
          type="date"
          value={dateTo}
          onChange={e => {
            setDateTo(e.target.value);
            resetPageSize();
          }}
        />
      </label>
      <select 
        value={order} 
        onChange={e => { 
          setOrder(e.target.value); 
          resetPageSize(); 
        }}
      >
        <option value="recentes">Mais recentes</option>
        <option value="curtidos">Mais curtidos</option>
        <option value="comentados">Mais comentados</option>
      </select>
      <button className={styles.limparFiltroBtn} onClick={limparFiltros} type="button">
        Limpar filtros
      </button>
    </div>
  );
};