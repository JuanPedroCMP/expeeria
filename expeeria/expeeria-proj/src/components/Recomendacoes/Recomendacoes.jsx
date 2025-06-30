import { useAuth } from "../../hooks/useAuth";
import { usePost } from "../../hooks/usePost";
import { useEffect, useState } from "react";
import { Card } from "../Card/Card";
import { useNavigate } from "react-router-dom";

const Recomendacoes = () => {
  const { user } = useAuth();
  const { posts } = usePost();
  const [recommended, setRecommended] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return setRecommended([]);
    // Posts de quem sigo
    const byFollowing = posts.filter((p) => user.following?.includes(p.userId));
    // Posts das categorias/interesses do usuário
    const byInterest = posts.filter((p) =>
      Array.isArray(p.area)
        ? p.area.some((cat) => user.interests?.includes(cat))
        : user.interests?.includes(p.area)
    );
    // Junta e remove duplicados
    const all = [...byFollowing, ...byInterest].filter(
      (post, idx, arr) => arr.findIndex((p) => p.id === post.id) === idx
    );
    setRecommended(all.slice(0, 8)); // Mostra até 8 recomendações
  }, [user, posts]);

  if (!user || recommended.length === 0) return null;

  return (
    <div
      style={{
        background: "#181c24",
        borderRadius: 8,
        padding: 24,
        marginBottom: 32,
      }}
    >
      <h3 style={{ color: "#fff", marginBottom: 16 }}>
        Recomendações para você
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        {recommended.map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/post/${post.id}`)}
            style={{
              cursor: "pointer",
              width: "100%",
              maxWidth: 520,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Card
              TituloCard={post.title}
              SubTitulo={
                Array.isArray(post.area) ? post.area.join(", ") : post.area
              }
              Descrisao={post.caption}
              likes={post.likes}
              id={post.id}
              imageUrl={post.imageUrl}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export { Recomendacoes };
