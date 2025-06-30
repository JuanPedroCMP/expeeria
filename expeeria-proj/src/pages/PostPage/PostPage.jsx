import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import style from "./PostPage.module.css";
import { Button } from "../../components";
import { LikeButton } from "../../components/LikeButton/LikeButton";
import { useAuth } from "../../hooks/useAuth";
import { usePost } from "../../hooks/usePost";
import { useNotification } from "../../hooks/useNotification";
import supabase from "../../services/supabase";

export const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();
  const { getPostById, toggleLikePost, hasLikedPost } = usePost();
  const { showSuccess, showError } = useNotification();
  
  // Verificar se o usuário é o autor do post ou administrador
  const isOwnerOrAdmin = post && user && (user.id === post.authorId || user.role === "admin");

  // Buscar post usando o hook usePost
  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('Iniciando busca de post ID:', id);
        setLoading(true);
        setError(null); // Limpar erros anteriores
        
        // Buscar o post usando o hook usePost
        const postData = await getPostById(id);
          
        if (!postData) {
          console.log('Post não encontrado');
          setError('Post não encontrado');
          setLoading(false);
          return;
        }
        
        // Buscar categorias do post
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('post_categories')
          .select('category')
          .eq('post_id', id);
          
        if (categoriesError) {
          console.warn('Erro ao buscar categorias:', categoriesError);
        }
        
        // Preparar dados do post para exibição
        const processedPost = {
          id: postData.id,
          title: postData.title,
          caption: postData.caption,
          content: postData.content,
          imageUrl: postData.image_url,
          author: postData.author_name || 'Usuário',
          authorId: postData.author_id,
          createdAt: postData.created_at,
          categories: categoriesData ? categoriesData.map(cat => cat.category) : [],
          likeCount: postData.like_count || 0
        };

        // Atualizar estados
        setPost(processedPost);
        setError(null);
        
        // Verificar se o usuário curtiu este post
        if (user && hasLikedPost) {
          try {
            const liked = await hasLikedPost(id);
            setIsLiked(liked);
          } catch (err) {
            console.error('Erro ao verificar curtida:', err);
          }
        }
        
        // Registrar visualização no localStorage
        if (user) {
          try {
            const viewedPostsData = localStorage.getItem(`viewedPosts_${user.id}`);
            let viewedPosts = viewedPostsData ? JSON.parse(viewedPostsData) : [];
            
            // Manter apenas os últimos 10 posts visualizados
            viewedPosts = [id, ...viewedPosts.filter(postId => postId !== id)].slice(0, 10);
            localStorage.setItem(`viewedPosts_${user.id}`, JSON.stringify(viewedPosts));
          } catch (storageError) {
            console.error('Erro ao salvar post visualizado:', storageError);
          }
        }
      } catch (err) {
        console.error('Erro ao processar dados do post:', err);
        setError('Erro ao carregar o post: ' + (err.message || 'Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPost();
    }
  }, [id, user, getPostById, hasLikedPost]);

  // Função para excluir o post
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!user) {
      showError("Você precisa estar logado para excluir!");
      return;
    }
    if (!post) return;
    
    // Verificar se o usuário é o autor do post ou administrador
    if (user.id !== post.authorId && user.role !== 'admin') {
      showError("Você não tem permissão para excluir este post.");
      return;
    }
    
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      try {
        // Excluir post do Supabase
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        showSuccess("Post excluído com sucesso!");
        navigate('/'); // Redirecionar para a página inicial após excluir
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        showError("Erro ao excluir post. Tente novamente mais tarde.");
      }
    }
  };

  // Função para curtir post
  const handleLike = async () => {
    if (!user) {
      showError("Você precisa estar logado para curtir posts!");
      return;
    }
    
    try {
      // Atualização otimista da UI
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked ? post.likeCount + 1 : post.likeCount - 1;
      
      setIsLiked(newIsLiked);
      setPost(prev => ({ ...prev, likeCount: newLikeCount }));
      
      // Chamar a função toggleLikePost do hook usePost
      const result = await toggleLikePost(post.id);
      
      if (!result.success) {
        // Se falhar, reverter a atualização otimista
        setIsLiked(isLiked);
        setPost(prev => ({ ...prev, likeCount: post.likeCount }));
        throw new Error('Falha ao processar curtida');
      }
      
      // Sincronizar com o resultado real
      setIsLiked(result.liked);
      setPost(prev => ({ ...prev, likeCount: result.likeCount || newLikeCount }));
    } catch (err) {
      console.error('Erro ao curtir post:', err);
      showError("Erro ao curtir o post. Tente novamente.");
    }
  };
  
  // Adicionar carregamento condicional
  if (loading) {
    return (
      <div className={style.postContainer}>
        <h2>Carregando post...</h2>
        <div className={style.loadingSpinner}></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={style.postContainer}>
        <h2>Erro ao carregar post</h2>
        <p>{error}</p>
        <Button destino="/" texto="Voltar para a página inicial" />
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className={style.postContainer}>
        <h2>Post não encontrado</h2>
        <p>O post que você está procurando não existe ou foi removido.</p>
        <Button destino="/" texto="Voltar para a página inicial" />
      </div>
    );
  }

  return (
    <>
      <div className={style.postContainer}>
        {isOwnerOrAdmin && (
          <>
            <button
              className={style.editBtn}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/editar/${id}`);
              }}
            >
              Editar
            </button>
            <button className={style.deleteBtn} onClick={handleDelete}>
              Excluir
            </button>
          </>
        )}
        {post.imageUrl && (
          <div className={style.bannerBox}>
            <img
              src={post.imageUrl}
              alt={post.title}
              className={style.bannerImage}
            />
          </div>
        )}
        <h2 className={style.postTitle}>{post.title}</h2>
        {Array.isArray(post.categories) && post.categories.length > 0
          ? post.categories.map((cat) => (
              <span
                key={cat}
                style={{
                  background: "#8ecae6",
                  color: "#23283a",
                  borderRadius: 12,
                  padding: "2px 12px",
                  fontSize: 14,
                  marginRight: 6,
                  marginBottom: 2,
                  display: "inline-block",
                }}
              >
                {cat}
              </span>
            ))
          : <span>Geral</span>}
        {" • "}
        {post.author}
        <p className={style.postCaption}>{post.caption}</p>
        <div className={style.postContent}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        <LikeButton 
          count={post.likeCount || 0}
          isLiked={isLiked}
          onLike={handleLike}
          onUnlike={handleLike}
          disabled={!user}
          size="lg"
          className={style.likeBtn}
        />
        <p className={style.postDate}>
          Publicado em {new Date(post.createdAt).toLocaleString()}
        </p>
      </div>
    </>
  );
};
