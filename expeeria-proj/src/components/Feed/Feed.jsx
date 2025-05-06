import { useState, useEffect, useRef } from "react";
import { usePosts } from "../../contexts/PostContext";
import { Card } from "../Card";
import style from "./Feed.module.css";
import { Link } from "react-router-dom";
import { categoriasPadrao } from "../../utils/categoriasPadrao";

const PAGE_SIZE = 6;

export const Feed = () => {
  const { posts, loading, fetchPosts } = usePosts();
  // Filtros
  const [search, setSearch] = useState(() => localStorage.getItem("feed_search") || "");
  const [selectedAreas, setSelectedAreas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("feed_areas")) || [];
    } catch {
      return [];
    }
  });
  const [author, setAuthor] = useState(() => localStorage.getItem("feed_author") || "");
  const [order, setOrder] = useState(() => localStorage.getItem("feed_order") || "recentes");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // Paginação
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const loader = useRef();
  const [showCategories, setShowCategories] = useState(false);

  // Salva filtros no localStorage
  useEffect(() => {
    localStorage.setItem("feed_search", search);
    localStorage.setItem("feed_areas", JSON.stringify(selectedAreas));
    localStorage.setItem("feed_author", author);
    localStorage.setItem("feed_order", order);
  }, [search, selectedAreas, author, order]);

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
        (p.content && p.content.toLowerCase().includes(search.toLowerCase())) ||
        (p.author && p.author.toLowerCase().includes(search.toLowerCase()))
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
  // Ordenação
  if (order === "recentes") {
    filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (order === "curtidos") {
    filtered = filtered.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (order === "comentados") {
    filtered = filtered.slice().sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
  }

  // Paginação
  const paginated = filtered.slice(0, showCount);

  // Limpar filtros
  const limparFiltros = () => {
    setSearch("");
    setSelectedAreas([]);
    setAuthor("");
    setOrder("recentes");
    setDateFrom("");
    setDateTo("");
    setShowCount(PAGE_SIZE);
  };

  // Loading visual
  const [loadingVisual, setLoadingVisual] = useState(false);
  useEffect(() => {
    setLoadingVisual(true);
    const timeout = setTimeout(() => setLoadingVisual(false), 400);
    return () => clearTimeout(timeout);
  }, [search, selectedAreas, author, order, dateFrom, dateTo, posts]);

  return (
    <div>
      <div className={style.filtrosPainel}>
        <input
          type="text"
          placeholder="Buscar por título, conteúdo ou autor..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setShowCount(PAGE_SIZE);
          }}
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
          onChange={e => {
            setAuthor(e.target.value);
            setShowCount(PAGE_SIZE);
          }}
          style={{ minWidth: 120 }}
        />
        <label className={style.dataLabel}>
          De:
          <input
            type="date"
            value={dateFrom}
            onChange={e => {
              setDateFrom(e.target.value);
              setShowCount(PAGE_SIZE);
            }}
          />
        </label>
        <label className={style.dataLabel}>
          Até:
          <input
            type="date"
            value={dateTo}
            onChange={e => {
              setDateTo(e.target.value);
              setShowCount(PAGE_SIZE);
            }}
          />
        </label>
        <select value={order} onChange={e => { setOrder(e.target.value); setShowCount(PAGE_SIZE); }}>
          <option value="recentes">Mais recentes</option>
          <option value="curtidos">Mais curtidos</option>
          <option value="comentados">Mais comentados</option>
        </select>
        <button className={style.limparFiltroBtn} onClick={limparFiltros} type="button">
          Limpar filtros
        </button>
      </div>
      <div className={style.feed}>
        {loading || loadingVisual ? (
          <div className={style.spinner}></div>
        ) : paginated.length === 0 ? (
          <p style={{ textAlign: "center", color: "#8ecae6", fontSize: 18 }}>Nenhum post encontrado com os filtros atuais.</p>
        ) : (
          paginated.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              style={{ textDecoration: "none" }}
            >
              <Card
                TituloCard={post.title || "Post sem título"}
                SubTitulo={
                  Array.isArray(post.area)
                    ? post.area.join(", ") + " • " + post.author
                    : post.area + " • " + post.author
                }
                Descrisao={post.caption}
                imageUrl={post.imageUrl}
                likes={post.likes}
                id={post.id}
              />
            </Link>
          ))
        )}
        {/* Loader para carregamento infinito */}
        <div ref={loader} />
        {!loading && !loadingVisual && paginated.length < filtered.length && (
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
};
