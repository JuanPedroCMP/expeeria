import { PostProvider } from "../../contexts/PostContext";
import { Recomendacoes } from "../../components/Recomendacoes/Recomendacoes";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import style from "./Inicial.module.css";
import { usePost } from "../../hooks/usePost";
import { useEffect, useState } from "react";
import { Card } from "../../components/Card/Card";

const Inicial = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { posts } = usePost();
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [recentlyViewedPosts, setRecentlyViewedPosts] = useState([]);

  // Buscar posts em destaque (trending) - posts com mais likes
  useEffect(() => {
    if (posts && posts.length > 0) {
      const trending = [...posts]
        .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        .slice(0, 3);
      setTrendingPosts(trending);
    }
  }, [posts]);

  // Carregar posts recentemente visualizados do localStorage
  useEffect(() => {
    if (user) {
      try {
        const viewedPostsData = localStorage.getItem(`viewedPosts_${user.id}`);
        if (viewedPostsData) {
          const viewedPostIds = JSON.parse(viewedPostsData);
          // Filtrar os posts que o usuário visualizou recentemente
          const recentPosts = posts.filter(post => 
            viewedPostIds.includes(post.id)
          ).slice(0, 3); // Limitar a 3 posts
          
          setRecentlyViewedPosts(recentPosts);
        }
      } catch (error) {
        console.error("Erro ao carregar posts visualizados:", error);
      }
    }
  }, [posts, user]);

  return (
    <PostProvider>
      <div className={style.homeContainer}>
        <div className={style.welcomeBox}>
          <h2>
            {user
              ? `Bem-vindo(a), ${user.name || user.email}!`
              : "Bem-vindo ao Expeeria!"}
          </h2>
          <p>
            {user
              ? "Veja recomendações personalizadas, conheça os destaques e compartilhe suas experiências!"
              : "Faça login para receber recomendações personalizadas e interagir com a comunidade."}
          </p>
          <button
            className={style.criarPostBtn}
            onClick={() => navigate("/criar_post")}
          >
            + Criar novo post
          </button>
        </div>

        {/* Continue de onde parou - posts visualizados recentemente */}
        {user && recentlyViewedPosts.length > 0 && (
          <div className={style.recentlyViewedSection}>
            <h3>Continue de onde parou</h3>
            <div className={style.recentlyViewedGrid}>
              {recentlyViewedPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className={style.recentCard}
                >
                  <Card
                    TituloCard={post.title}
                    SubTitulo={
                      Array.isArray(post.area) ? post.area.join(", ") : post.area
                    }
                    Descricao={post.caption}
                    likes={post.likes}
                    id={post.id}
                    imageUrl={post.imageUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendações personalizadas para usuário logado */}
        <Recomendacoes />

        {/* Seção de posts em destaque */}
        <div className={style.trendingSection}>
          <h3>Destaques da comunidade</h3>
          <div className={style.trendingGrid}>
            {trendingPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className={style.trendingCard}
              >
                <Card
                  TituloCard={post.title}
                  SubTitulo={
                    Array.isArray(post.area) ? post.area.join(", ") : post.area
                  }
                  Descricao={post.caption}
                  likes={post.likes}
                  id={post.id}
                  imageUrl={post.imageUrl}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Chamada para ação de explorar */}
        <div className={style.exploreCallout}>
          <h3>Descubra mais conteúdo</h3>
          <p>Encontre posts sobre os temas que você mais gosta na página Explore</p>
          <button 
            className={style.exploreBtn}
            onClick={() => navigate("/explorar")}
          >
            Ir para Explore
          </button>
        </div>
      </div>
    </PostProvider>
  );
};

export { Inicial };
