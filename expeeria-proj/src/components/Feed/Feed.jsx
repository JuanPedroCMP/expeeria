import { useState } from "react";
import { usePosts } from "../../contexts/PostContext";
import { Card } from "../Card";
import style from "./Feed.module.css";
import { Link } from "react-router-dom";
import { categoriasPadrao } from "../../utils/categoriasPadrao";


export const Feed = () => {
  const { posts, loading } = usePosts();
  const [area, setArea] = useState("");

  if (loading) return <p>Carregando recomendações...</p>;
  if (!posts.length) return <p>Nenhum post encontrado.</p>;


  const areas = categoriasPadrao;

  const filteredPosts = area ? posts.filter((p) => p.area === area) : posts;

  return (
    <div>
      <div className={style.filtroArea}>
        <label>Filtrar por área: </label>
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="">Todas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {area && (
          <button
            className={style.limparFiltroBtn}
            onClick={() => setArea("")}
            type="button"
          >
            Limpar filtro
          </button>
        )}
      </div>
      <div className={style.feed}>
        {filteredPosts.length === 0 ? (
          <p>Nenhum post encontrado.</p>
        ) : (
          filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              style={{ textDecoration: "none" }}
            >
              <Card
                TituloCard={post.title || "Post sem título"}
                SubTitulo={
                  post.area ? `${post.area} • ${post.author}` : post.author
                }
                Descrisao={post.caption}
                imageUrl={post.imageUrl}
                likes={post.likes}
                id={post.id}
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
