import { useState, useEffect } from "react";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import styles from "./FeedFilters.module.css";

/**
 * Componente FeedFilters
 * Permite filtrar o conteúdo do feed por busca, categorias, autor, datas e ordenação.
 */
export const FeedFilters = ({ 
  search, setSearch,
  selectedAreas, setSelectedAreas,
  author, setAuthor,
  order, setOrder,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  onFiltersChanged,
  resetPageSize
}) => {
  const [showCategories, setShowCategories] = useState(false); // Mostrar/ocultar categorias
  const [dateError, setDateError] = useState("");              // Validação de intervalo de datas

  // Verificar validade das datas
  useEffect(() => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      setDateError("A data inicial não pode ser posterior à data final");
    } else {
      setDateError("");
    }
  }, [dateFrom, dateTo]);

  // Limpar todos os filtros
  const limparFiltros = () => {
    setSearch("");
    setSelectedAreas([]);
    setAuthor("");
    setOrder("recentes");
    setDateFrom("");
    setDateTo("");
    setDateError("");
    resetPageSize();
    onFiltersChanged?.(); // Chamada opcional se função existir
  };

  // Handlers para data
  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
    resetPageSize();
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
    resetPageSize();
  };

  return (
    <div className={styles.filtrosPainel}>
      {/* Busca geral por título, conteúdo ou autor */}
      <input
        type="text"
        placeholder="Buscar por título, conteúdo ou autor..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          resetPageSize();
        }}
      />

      {/* Alternar exibição das categorias */}
      <button
        type="button"
        className={styles.categoriasToggle}
        onClick={() => setShowCategories((v) => !v)}
      >
        {showCategories ? "Ocultar categorias" : "Filtrar por categorias"}
      </button>

      {/* Seleção de categorias */}
      {showCategories && (
        <div className={styles.categoriasBox}>
          {categoriasPadrao.map((cat) => (
            <label key={cat} className={styles.categoriaLabel}>
              <input
                type="checkbox"
                checked={selectedAreas.includes(cat)}
                onChange={(e) => {
                  resetPageSize();
                  setSelectedAreas(
                    e.target.checked
                      ? [...selectedAreas, cat]
                      : selectedAreas.filter((a) => a !== cat)
                  );
                }}
              />
              {cat}
            </label>
          ))}
        </div>
      )}

      {/* Filtro por autor */}
      <input
        type="text"
        placeholder="Filtrar por autor"
        value={author}
        onChange={(e) => {
          setAuthor(e.target.value);
          resetPageSize();
        }}
        style={{ minWidth: 120 }}
      />

      {/* Intervalo de datas */}
      <div className={styles.datesContainer}>
        <label className={styles.dataLabel}>
          De:
          <input
            type="date"
            value={dateFrom}
            onChange={handleDateFromChange}
            max={dateTo || undefined}
          />
        </label>
        <label className={styles.dataLabel}>
          Até:
          <input
            type="date"
            value={dateTo}
            onChange={handleDateToChange}
            min={dateFrom || undefined}
          />
        </label>
        {/* Exibe erro de intervalo inválido */}
        {dateError && <div className={styles.dateError}>{dateError}</div>}
      </div>

      {/* Ordenação dos resultados */}
      <select
        value={order}
        onChange={(e) => {
          setOrder(e.target.value);
          resetPageSize();
        }}
      >
        <option value="recentes">Mais recentes</option>
        <option value="curtidos">Mais curtidos</option>
        <option value="comentados">Mais comentados</option>
      </select>

      {/* Botão para resetar todos os filtros */}
      <button
        className={styles.limparFiltroBtn}
        onClick={limparFiltros}
        type="button"
      >
        Limpar filtros
      </button>
    </div>
  );
};
