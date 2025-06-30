import { useState, useEffect } from "react";
import styles from "./FeedFilters.module.css";

/**
 * Componente de filtros para o Feed
 * Separado para melhorar a organização e reutilização
 */
export const FeedFilters = ({ 
  search, 
  setSearch, 
  order,
  setOrder,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onFiltersChanged,
  resetPageSize
}) => {
  const [dateError, setDateError] = useState("");

  // Validar datas quando mudam
  useEffect(() => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      setDateError("A data inicial não pode ser posterior à data final");
    } else {
      setDateError("");
    }
  }, [dateFrom, dateTo]);
  // Limpar filtros
  const limparFiltros = () => {
    setSearch("");
    setOrder("recentes");
    setDateFrom("");
    setDateTo("");
    setDateError("");
    resetPageSize();
    
    if (onFiltersChanged) {
      onFiltersChanged();
    }
  };

  // Gerenciar mudança de data
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
      <input        type="text"
        placeholder="Buscar por título, conteúdo..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          resetPageSize();
        }}
      />
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
        {dateError && <div className={styles.dateError}>{dateError}</div>}
      </div>
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