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

  // Filtros de busca e ordenação
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
  const loader = useRef(); // Referência do elemento sentinela (infinite scroll)

  // Controle de feedback visual (carregamento leve)
  const [loadingVisual, setLoadingVisual] = useState(false);

  // Salvar filtros no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem("feed_search", search);
    localStorage.setItem("feed_areas", JSON.stringify(selectedAreas));
    localStorage.setItem("feed_author", author);
    localStorage.setItem("feed_order", order);
  }, [search, selectedAreas, author, order]);

  // Detectar scroll e carregar mais itens
  useEffect(() => {
    if (!loader.current) return;

    const handleScroll = () => {
      if (loader.current.getBoundingClientRect().top < window.innerHeight + 100) {
        setShowCount((prev) => prev + PAGE_SIZE);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Feedback visual temporário ao mudar filtros
  useEffect(() => {
    setLoadingVisual(true);
    const timeout = setTimeout(() => setLoadingVisual(false), 400);
    return () => clearTimeout(timeout);
  }, [search, selectedAreas, author, order, dateFrom, dateTo, posts]);

  // Aplicar filtros definidos pelo usuário
  const filtered = filterPosts({
    search,
    categories: selectedAreas,
    author,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
    orderBy: order
  });

  // Aplicar paginação no resultado filtrado
  const paginated = filtered.slice(0, showCount);

  // Resetar número de posts visíveis (usado ao aplicar novos filtros)
  const resetPageSize = () => setShowCount(PAGE_SIZE);

  return (
    <div>
      {/* Filtros de busca e ordenação */}
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
        onFiltersChanged={() => setLoadingVisual(true)}
      />

      {/* Área de exibição dos cards */}
      <div className={style.feed}>
        {/* Estado de carregamento */}
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
                Descricao={post.caption}
                imageUrl={post.imageUrl}
                likes={post.likes}
                id={post.id}
              />
            </Link>
          ))
        )}

        {/* Sentinela de scroll infinito */}
        <div ref={loader} className={style.loader} />

        {/* Botão "Carregar mais" se houver mais posts */}
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
