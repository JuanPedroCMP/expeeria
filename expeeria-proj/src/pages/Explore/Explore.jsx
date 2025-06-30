import { useState, useEffect, useRef } from "react";
import { Card } from "../../components/Card/Card";
import style from "./Explore.module.css";
import { categoriasPadrao } from "../../utils/categoriasPadrao";
import { useNavigate } from "react-router-dom";
import { usePost } from "../../hooks/usePost";

const PAGE_SIZE = 8;

export function Explore() {
  const [allPosts, setAllPosts] = useState([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const { getPosts, loading: postsLoading, error: postsError } = usePost();
  
  // Buscar posts usando o hook usePost
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Usar o hook usePost para buscar todos os posts
        const postsData = await getPosts();
        
        // Os posts já vem processados pelo hook, apenas passar para o estado
        setAllPosts(postsData);
        setError(null);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
        setError('Falha ao carregar posts. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [getPosts]);

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
  let filtered = allPosts;
  if (search) {
    filtered = filtered.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
        (p.caption && p.caption.toLowerCase().includes(search.toLowerCase())) ||
        (p.content && p.content.toLowerCase().includes(search.toLowerCase()))
    );
  }
  if (selectedAreas.length > 0) {
    filtered = filtered.filter((p) => {
      // Tratar diferentes formatos de categorias
      const postCategories = p.categories || p.area || [];
      const categoriesArray = Array.isArray(postCategories) ? postCategories : [postCategories];
      return selectedAreas.some((a) => categoriesArray.includes(a));
    });
  }
  if (author) {
    filtered = filtered.filter(
      (p) => {
        const authorName = p.author || p.author_name || '';
        return authorName.toLowerCase().includes(author.toLowerCase());
      }
    );
  }
  if (dateFrom) {
    filtered = filtered.filter(p => {
      try {
        const postDate = new Date(p.createdAt || p.created_at || 0);
        return !isNaN(postDate.getTime()) && postDate >= new Date(dateFrom);
      } catch {
        return true; // Em caso de erro, manter o post
      }
    });
  }
  if (dateTo) {
    filtered = filtered.filter(p => {
      try {
        const postDate = new Date(p.createdAt || p.created_at || 0);
        return !isNaN(postDate.getTime()) && postDate <= new Date(dateTo);
      } catch {
        return true; // Em caso de erro, manter o post
      }
    });
  }

  // Ordenação: sempre mais recentes primeiro
  filtered = filtered.slice().sort((a, b) => {
    try {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB - dateA;
    } catch {
      return 0; // Em caso de erro, manter a ordem original
    }
  });

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
  }, [search, selectedAreas, author, dateFrom, dateTo, allPosts]);

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
        {/* <button
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
        )} */}
        {/* <input
          type="text"
          placeholder="Filtrar por autor"
          value={author}
          onChange={e => { setAuthor(e.target.value); setShowCount(PAGE_SIZE); }}
          className={style.input}
          style={{ minWidth: 120 }}
        /> */}
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
      
      {/* Mensagem de erro */}
      {error && (
        <div className={style.errorMessage}>
          <p>{error}</p>
        </div>
      )}
            
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
                  post.categories?.length > 0 ? post.categories.join(", ") : "Geral"
                }
                Descricao={post.caption}
                likes={post.likeCount || 0}
                id={post.id}
                imageUrl={post.imageUrl}
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
