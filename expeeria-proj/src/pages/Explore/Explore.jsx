import { useState, useEffect, useRef } from "react";
import { usePost } from "../../hooks/usePost";
import { Card } from "../../components/Card/Card";
import style from "./Explore.module.css";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

export function Explore() {
  const { posts } = usePost();
  const [search, setSearch] = useState(() => localStorage.getItem("explore_search") || "");
  const [selectedAreas, setSelectedAreas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("explore_areas")) || [];
    } catch {
      return [];
    }
  });
  const [author, setAuthor] = useState(() => localStorage.getItem("explore_author") || "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const loader = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // Salva filtros no localStorage
  useEffect(() => {
    localStorage.setItem("explore_search", search);
    localStorage.setItem("explore_areas", JSON.stringify(selectedAreas));
    localStorage.setItem("explore_author", author);
  }, [search, selectedAreas, author]);

  // Carregamento infinito
  useEffect(() => {
    if (!loader.current) return;
    const handleScroll = () => {
      if (
        loader.current &&
        loader.current.getBoundingClientRect().top < window.innerHeight + 100
      ) {
        setShowCount((prev) => prev + PAGE_SIZE);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filtro e busca
  let filtered = posts;
  if (search) {
    filtered = filtered.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
        (p.caption && p.caption.toLowerCase().includes(search.toLowerCase())) ||
        (p.content && p.content.toLowerCase().includes(search.toLowerCase()))
    );
  }
  if (selectedAreas.length > 0) {
    filtered = filtered.filter((p) =>
      Array.isArray(p.area)
        ? selectedAreas.some((a) => p.area.includes(a))
        : selectedAreas.includes(p.area)
    );
  }
  if (author) {
    filtered = filtered.filter(
      (p) => p.author && p.author.toLowerCase().includes(author.toLowerCase())
    );
  }
  if (dateFrom) {
    filtered = filtered.filter(
      (p) => new Date(p.createdAt) >= new Date(dateFrom)
    );
  }
  if (dateTo) {
    filtered = filtered.filter(
      (p) => new Date(p.createdAt) <= new Date(dateTo)
    );
  }

  // Ordenação: sempre mais recentes primeiro
  filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Paginação
  const paginated = filtered.slice(0, showCount);

  // Limpar filtros
  const limparFiltros = () => {
    setSearch("");
    setSelectedAreas([]);
    setAuthor("");
    setDateFrom("");
    setDateTo("");
    setShowCount(PAGE_SIZE);
  };

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [search, selectedAreas, author, dateFrom, dateTo, posts]);

  return (
    <div className={style.exploreContainer}>
      <h2 className={style.title}>Explorar Posts</h2>
      <form className={style.filtros} onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          placeholder="Buscar por título, conteúdo..."
          value={search}
          onChange={e => { setSearch(e.target.value); setShowCount(PAGE_SIZE); }}
          className={style.input}
        />
        <button
          type="button"
          className={style.categoriasToggle}
          onClick={() => setShowCategories((v) => !v)}
        >
          {showCategories ? "Ocultar categorias" : "Filtrar por categorias"}
        </button>
        {showCategories && (
          <div className={style.categoriasBox}>
            {categoriasPadrao.map((cat) => (
              <label key={cat} className={style.categoriaLabel}>
                <input
                  type="checkbox"
                  checked={selectedAreas.includes(cat)}
                  onChange={e => {
                    setShowCount(PAGE_SIZE);
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
          onChange={e => { setAuthor(e.target.value); setShowCount(PAGE_SIZE); }}
          className={style.input}
          style={{ minWidth: 120 }}
        />
        <label className={style.dataLabel}>
          De:
          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setShowCount(PAGE_SIZE); }}
          />
        </label>
        <label className={style.dataLabel}>
          Até:
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setShowCount(PAGE_SIZE); }}
          />
        </label>
        <button
          type="button"
          className={style.limparFiltroBtn}
          onClick={limparFiltros}
        >
          Limpar filtros
        </button>
      </form>
      <div className={style.cardsGrid}>
        {loading ? (
          <div className={style.nenhum}>Carregando posts...</div>
        ) : paginated.length === 0 ? (
          <div className={style.nenhum}>Nenhum post encontrado.</div>
        ) : (
          paginated.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              style={{ cursor: "pointer" }}
            >
              <Card
                TituloCard={post.title}
                SubTitulo={
                  Array.isArray(post.area) ? post.area.join(", ") : post.area
                }
                Descrisao={post.caption}
                likes={post.likes}
                id={post.id}
              />
            </div>
          ))
        )}
        {/* Loader para carregamento infinito */}
        <div ref={loader} />
        {!loading && paginated.length < filtered.length && (
          <button
            style={{ margin: "1rem auto", display: "block" }}
            onClick={() => setShowCount((prev) => prev + PAGE_SIZE)}
          >
            Carregar mais
          </button>
        )}
      </div>
    </div>
  );
}
