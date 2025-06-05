import { useAuth } from "../../hooks/useAuth";
import { usePost } from "../../hooks/usePost";
import { useEffect, useState } from "react";
import { Card } from "../Card/Card";
import { useNavigate } from "react-router-dom";

/**
 * Componente Recomendacoes
 * Exibe posts recomendados com base nos interesses e nas conexões do usuário.
 */
const Recomendacoes = () => {
  const { user } = useAuth();
  const { posts } = usePost();
  const [recommended, setRecommended] = useState([]);
  const navigate = useNavigate();

  // Gera recomendações com base em interesses e conexões
  useEffect(() => {
    if (!user) return setRecommended([]);

    const byFollowing = posts.filter(p => user.following?.includes(p.userId));
    const byInterest = posts.filter(p =>
      Array.isArray(p.area)
        ? p.area.some(cat => user.interests?.includes(cat))
        : user.interests?.includes(p.area)
    );

    const merged = [...byFollowing, ...byInterest].filter(
      (post, i, arr) => arr.findIndex(p => p.id === post.id) === i
    );

    setRecommended(merged.slice(0, 8)); // Limita a 8 itens
  }, [user, posts]);

  // Se não há usuário ou nenhuma recomendação, não renderiza
  if (!user || recommended.length === 0) return null;

  return (
    <section
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
        {recommended.map(post => (
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
                Array.isArray(post.area)
                  ? post.area.join(", ")
                  : post.area
              }
              Descricao={post.caption} // Corrigido typo
              likes={post.likes}
              id={post.id}
              imageUrl={post.imageUrl}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export { Recomendacoes };
