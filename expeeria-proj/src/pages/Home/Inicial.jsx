import { Recomendacoes } from "../../components/Recomendacoes/Recomendacoes";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import style from "./Inicial.module.css";
import { useEffect, useState, useRef } from "react";
import { Card } from "../../components/Card/Card";
import { usePost } from "../../hooks/usePost";

const Inicial = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [categorizedPosts, setCategorizedPosts] = useState({});
  const [popularCategories, setPopularCategories] = useState([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);
  const { getPosts } = usePost();

  // Carregar todos os posts usando o hook usePost
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Iniciando busca de posts usando usePost...');
        
        // Usar o hook usePost para buscar todos os posts
        const postsData = await getPosts();
        
        if (!postsData || postsData.length === 0) {
          console.log('Nenhum post encontrado');
          setTrendingPosts([]);
          setCategorizedPosts({});
          setPopularCategories([]);
          setLoading(false);
          return;
        }
        
        console.log('Posts encontrados:', postsData.length);
        console.log('Exemplo de post:', postsData[0]);
        
        // Transformar posts para garantir estrutura consistente
        const processedPosts = postsData.map(post => {
          // Extrair categorias de post_categories se disponível
          const categories = post.post_categories 
            ? post.post_categories.map(pc => pc.category)
            : (post.categories || post.area || []);
          
          return {
            ...post,
            categories,
            likeCount: post.like_count || post.likeCount || 0,
            commentCount: post.comment_count || post.commentCount || 0,
            imageUrl: post.image_url || post.imageUrl || '',
            author: post.users?.name || post.author_name || post.author || 'Usuário'
          };
        });
        
        // Ordenar por curtidas para trending posts
        const trending = [...processedPosts]
          .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
          .slice(0, 5);
        setTrendingPosts(trending);
        
        // Categorizar posts
        const categorized = {};
        const categoryCount = {};
        
        processedPosts.forEach(post => {
          const categories = Array.isArray(post.categories) ? post.categories : [];
          
          if (categories.length === 0) {
            if (!categorized['Geral']) categorized['Geral'] = [];
            categorized['Geral'].push(post);
            categoryCount['Geral'] = (categoryCount['Geral'] || 0) + 1;
          } else {
            categories.forEach(category => {
              if (!categorized[category]) categorized[category] = [];
              categorized[category].push(post);
              categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
          }
        });
        
        setCategorizedPosts(categorized);
        
        // Encontrar as categorias mais populares
        const popularCats = Object.keys(categoryCount)
          .sort((a, b) => categoryCount[b] - categoryCount[a])
          .slice(0, 5);
        
        setPopularCategories(popularCats);
        
        // Definir a categoria ativa inicialmente
        if (popularCats.length > 0 && !activeCategory) {
          setActiveCategory(popularCats[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
        setError('Falha ao carregar posts. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [user, getPosts]);
  
  // Configura um timer para o carrossel automático
  useEffect(() => {
    if (trendingPosts.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentCarouselIndex(prevIndex => (prevIndex + 1) % trendingPosts.length);
    }, 5000); // Mudar a cada 5 segundos
    
    return () => clearInterval(timer);
  }, [trendingPosts]);
  
  // Função para navegar para o próximo slide do carrossel
  const nextSlide = () => {
    setCurrentCarouselIndex(prevIndex => (prevIndex + 1) % trendingPosts.length);
  };
  
  // Função para navegar para o slide anterior do carrossel
  const prevSlide = () => {
    setCurrentCarouselIndex(prevIndex => 
      prevIndex === 0 ? trendingPosts.length - 1 : prevIndex - 1
    );
  };
  
  // Função para mudar a categoria ativa
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  return (
    <>
      <div className={style.homeContainer}>
        {/* Header principal com chamada para ação */}
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
        {loading ? (
          <div className={style.loadingContainer}>
            <div className={style.spinner}></div>
            <p>Carregando conteúdo personalizado...</p>
          </div>
        ) : (
          <>
            {/* Carrossel de destaques */}
            {trendingPosts.length > 0 && (
              <div className={style.carouselSection}>
                <h3>
                  <span className={style.icon}>⭐</span>
                  Destaques da comunidade
                </h3>
                <div className={style.carouselContainer} ref={carouselRef}>
                  <button 
                    className={`${style.carouselButton} ${style.prevButton}`}
                    onClick={prevSlide}
                    aria-label="Post anterior"
                  >
                    ❮
                  </button>
                    <div className={style.carouselTrack} style={{ transform: `translateX(-${currentCarouselIndex * 100}%)` }}>
                    {trendingPosts.map((post) => (
                      <div 
                        key={post.id}
                        className={style.carouselSlide}
                        onClick={() => navigate(`/post/${post.id}`)}
                      >                        <Card
                          id={post.id}
                          title={post.title}
                          caption={post.caption}
                          content={post.content}
                          imageUrl={post.imageUrl}
                          likeCount={post.likeCount}
                          author={post.author}
                          createdAt={post.createdAt || post.created_at}
                          categories={post.categories}
                          category={post.categories && post.categories[0]}
                          tags={post.tags}
                          onClick={() => navigate(`/post/${post.id}`)}
                          className={style.carouselCard}
                          hideShareButton={true}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className={`${style.carouselButton} ${style.nextButton}`}
                    onClick={nextSlide}
                    aria-label="Próximo post"
                  >
                    ❯
                  </button>
                  
                  <div className={style.carouselIndicators}>
                    {trendingPosts.map((_, index) => (
                      <button 
                        key={index}
                        className={`${style.indicator} ${index === currentCarouselIndex ? style.active : ''}`}
                        onClick={() => setCurrentCarouselIndex(index)}
                        aria-label={`Ir para slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}           
            
            {/* Seção de Categorias Populares */}
            {popularCategories.length > 0 && (
              <div className={style.categoriesSection}>
                <h3>
                  <span className={style.icon}>📃</span>
                  Explore por categoria
                </h3>
                <div className={style.categoriesTabs}>
                  {popularCategories.map(category => (
                    <button
                      key={category}
                      className={`${style.categoryTab} ${activeCategory === category ? style.activeTab : ''}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                <div className={style.categoryContent}>
                  {activeCategory && categorizedPosts[activeCategory] && categorizedPosts[activeCategory].length > 0 ? (
                    <>
                      <div className={style.categoryPostsGrid}>
                        {categorizedPosts[activeCategory].slice(0, 3).map(post => (
                          <div
                            key={post.id}
                            onClick={() => navigate(`/post/${post.id}`)}
                            className={style.categoryCard}
                          >
                            <Card
                              TituloCard={post.title}
                              SubTitulo={activeCategory}
                              Descricao={post.caption}
                              likes={post.likeCount || 0}
                              id={post.id}
                              imageUrl={post.imageUrl}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {categorizedPosts[activeCategory].length > 3 && (
                        <div className={style.viewMoreContainer}>
                          <button 
                            className={style.viewMoreBtn}
                            onClick={() => navigate(`/explorar?categoria=${encodeURIComponent(activeCategory)}`)}
                          >
                            Ver mais em {activeCategory}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={style.noPostsContainer}>
                      <p>Nenhum post encontrado na categoria <strong>{activeCategory}</strong>.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Recomendações personalizadas para usuário logado */}
            {user && <Recomendacoes />}

            {/* Mensagem quando não há posts para exibir */}
            {!error && trendingPosts.length === 0 && (
              <div className={style.noPostsContainer}>
                <p>Ainda não há posts publicados. Seja o primeiro a compartilhar!</p>
                <button
                  className={style.criarPostBtn}
                  onClick={() => navigate("/criar_post")}
                  disabled={!user}
                >
                  Criar post agora
                </button>
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
          </>
        )}
      </div>
    </>
  );
};

export { Inicial };
