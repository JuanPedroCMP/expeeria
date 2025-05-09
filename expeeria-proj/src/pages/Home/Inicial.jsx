import { PostProvider } from "../../contexts/PostContext";
import { Recomendacoes } from "../../components/Recomendacoes/Recomendacoes";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import style from "./Inicial.module.css";
import { useEffect, useState } from "react";
import { Card } from "../../components/Card/Card";
import supabase from "../../services/supabase";

const Inicial = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [recentlyViewedPosts, setRecentlyViewedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar todos os posts do Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Iniciando busca de posts...');
        
        // Buscar posts com contagens de likes e informações do autor
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            users!author_id (id, username, name, avatar),
            post_likes!post_id (count),
            post_categories!post_id (category)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });
          
        if (postsError) {
          console.error('Erro na consulta Supabase:', postsError);
          throw new Error('Falha ao carregar os posts: ' + postsError.message);
        }
        
        // Verificar se temos dados e evitar erros quando não há posts
        if (!postsData || postsData.length === 0) {
          console.log('Nenhum post encontrado');
          setAllPosts([]);
          setTrendingPosts([]);
          setLoading(false);
          return;
        }
        
        console.log('Posts encontrados:', postsData.length);
        
        // Processar os dados para um formato mais amigável
        const processedPosts = postsData.map(post => ({
          id: post.id,
          title: post.title,
          caption: post.caption,
          content: post.content,
          imageUrl: post.image_url,
          author: post.users,
          authorId: post.author_id,
          createdAt: post.created_at,
          likeCount: post.post_likes[0]?.count || 0,
          categories: post.post_categories.map(cat => cat.category)
        }));
        
        setAllPosts(processedPosts);
        
        // Ordenar por curtidas para trending posts
        const trending = [...processedPosts]
          .sort((a, b) => b.likeCount - a.likeCount)
          .slice(0, 3);
        setTrendingPosts(trending);
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
        setError('Falha ao carregar posts. Tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  // Carregar posts recentemente visualizados do localStorage
  useEffect(() => {
    if (user && allPosts.length > 0) {
      try {
        const viewedPostsData = localStorage.getItem(`viewedPosts_${user.id}`);
        if (viewedPostsData) {
          const viewedPostIds = JSON.parse(viewedPostsData);
          // Filtrar os posts que o usuário visualizou recentemente
          const recentPosts = allPosts.filter(post => 
            viewedPostIds.includes(post.id)
          ).slice(0, 3); // Limitar a 3 posts
          
          setRecentlyViewedPosts(recentPosts);
        }
      } catch (error) {
        console.error("Erro ao carregar posts visualizados:", error);
      }
    }
  }, [allPosts, user]);

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
            disabled={!user}
          >
            + Criar novo post
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className={style.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        {/* Indicador de carregamento */}
        {loading && (
          <div className={style.loadingContainer}>
            <p>Carregando posts...</p>
          </div>
        )}

        {/* Continue de onde parou - posts visualizados recentemente */}
        {!loading && user && recentlyViewedPosts.length > 0 && (
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
                      post.categories?.length > 0 ? post.categories.join(", ") : "Geral"
                    }
                    Descricao={post.caption}
                    likes={post.likeCount || 0}
                    id={post.id}
                    imageUrl={post.imageUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendações personalizadas para usuário logado */}
        {!loading && <Recomendacoes />}

        {/* Seção de posts em destaque */}
        {!loading && trendingPosts.length > 0 && (
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
                      post.categories?.length > 0 ? post.categories.join(", ") : "Geral"
                    }
                    Descricao={post.caption}
                    likes={post.likeCount || 0}
                    id={post.id}
                    imageUrl={post.imageUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há posts para exibir */}
        {!loading && !error && trendingPosts.length === 0 && (
          <div className={style.noPostsContainer}>
            <p>Ainda não há posts publicados. Seja o primeiro a compartilhar!</p>
          </div>
        )}

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
