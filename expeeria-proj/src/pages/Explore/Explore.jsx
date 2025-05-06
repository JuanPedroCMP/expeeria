import { usePosts } from "../../contexts/PostContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./Explore.module.css";
import { Card } from "../../components/Card/Card";

export function Explore() {
  const { posts } = usePosts();
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const navigate = useNavigate();

  // Filtro
  let filtered = posts;
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.caption.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(p.area)
          ? p.area.some((cat) =>
              cat.toLowerCase().includes(search.toLowerCase())
            )
          : p.area?.toLowerCase().includes(search.toLowerCase()))
    );
  }
  if (categoria) {
    filtered = filtered.filter((p) =>
      Array.isArray(p.area) ? p.area.includes(categoria) : p.area === categoria
    );
  }
  // Ordenação
  if (ordem === "recentes") {
    filtered = filtered
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (ordem === "populares") {
    filtered = filtered.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  // Pegue todas as categorias únicas
  const categorias = Array.from(
    new Set(posts.flatMap((p) => (Array.isArray(p.area) ? p.area : [p.area])))
  );

  return (
    <div className={style.exploreContainer}>
      <br />
      <h2 className={style.title}>Explorar Posts</h2>
      <form className={style.filtros}>
        <input
          type="text"
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={style.input}
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={style.select}
        >
          <option value="">Todas categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
          className={style.select}
        >
          <option value="recentes">Mais recentes</option>
          <option value="populares">Mais populares</option>
        </select>
      </form>
      <div className={style.cardsGrid}>
        {filtered.map((post) => (
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
        ))}
        {filtered.length === 0 && (
          <div className={style.nenhum}>Nenhum post encontrado.</div>
        )}
      </div>
    </div>
  );
}
