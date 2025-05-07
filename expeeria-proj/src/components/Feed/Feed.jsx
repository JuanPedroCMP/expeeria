import { useState, useEffect, useRef } from "react";
import { usePost } from "../../hooks/usePost";
import { Card } from "../Card";
import { FeedFilters } from "../FeedFilters";
import { LoadingSpinner } from "../LoadingSpinner";
import style from "./Feed.module.css";
import { Link } from "react-router-dom";

const PAGE_SIZE = 6;

export const Feed = () => {
  const { posts, loading, filterPosts } = usePost();
  
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
  
  // Loading visual
  const [loadingVisual, setLoadingVisual] = useState(false);

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

  // Atualiza loading visual quando os filtros ou posts mudam
  useEffect(() => {
    setLoadingVisual(true);
    const timeout = setTimeout(() => setLoadingVisual(false), 400);
    return () => clearTimeout(timeout);
  }, [search, selectedAreas, author, order, dateFrom, dateTo, posts]);

  // Aplicar filtros usando o hook usePost
  const filtered = filterPosts({
    search,
    categories: selectedAreas,
    author,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
    orderBy: order
  });
  
  // Paginação
  const paginated = filtered.slice(0, showCount);
  
  // Reset da paginação quando os filtros mudam
  const resetPageSize = () => setShowCount(PAGE_SIZE);

  return (
    <div>
      <FeedFilters 
        search={search}
        setSearch={setSearch}
        selectedAreas={selectedAreas}
        setSelectedAreas={setSelectedAreas}
        author={author}
        setAuthor={setAuthor}
        order={order}
        setOrder={setOrder}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        resetPageSize={resetPageSize}
      />
      
      <div className={style.feed}>
        {loading || loadingVisual ? (
          <div className={style.spinnerContainer}>
            <LoadingSpinner />
          </div>
        ) : paginated.length === 0 ? (
          <p className={style.emptyMessage}>
            Nenhum post encontrado com os filtros atuais.
          </p>
        ) : (
          paginated.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className={style.postLink}
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
        <div ref={loader} className={style.loader} />
        
        {!loading && !loadingVisual && paginated.length < filtered.length && (
          <button
            className={style.loadMoreButton}
            onClick={() => setShowCount((prev) => prev + PAGE_SIZE)}
          >
            Carregar mais
          </button>
        )}
      </div>
    </div>
  );
};
