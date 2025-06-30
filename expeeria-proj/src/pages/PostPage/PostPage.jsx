import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import style from "./PostPage.module.css";
import { Button, CommentItem, Pagination } from "../../components";
import { LikeButton } from "../../components/LikeButton/LikeButton";
import { useAuth } from "../../hooks/useAuth";
import { usePost } from "../../hooks/usePost";
import { useComment } from "../../hooks/useComment";
import { useNotification } from "../../hooks/useNotification";
import supabase from "../../services/supabase";

export const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();
  const { getPostById, toggleLikePost, hasLikedPost } = usePost();
  const { loadComments, addComment, deleteComment } = useComment();
  const { showSuccess, showError } = useNotification();

  // Estados para paginação de comentários
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5; // Quantidade de comentários por página
  
  // Verificar se o usuário é o autor do post ou administrador
  const isOwnerOrAdmin = post && user && (user.id === post.authorId || user.role === "admin");

  // Buscar post e comentários usando o hook usePost
  useEffect(() => {
    const fetchPostAndComments = async () => {
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
        
        // Buscar comentários do post usando o hook useComment
        const commentsRawData = await loadComments(id);
        
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
        
        // Processar comentários
        const processedComments = commentsRawData ? commentsRawData.map(c => ({
          id: c.id,
          postId: c.post_id,
          userId: c.user_id,
          content: c.content, // Alterado para corresponder ao formato do CommentItem
          text: c.content,   // Mantido por compatibilidade
          user: c.author_name || 'Anônimo',
          created_at: c.created_at, // Formato usado pelo CommentItem
          createdAt: c.created_at,  // Mantido por compatibilidade
          profiles: { username: c.author_name || 'Anônimo' }, // Formato usado pelo CommentItem
          user_id: c.user_id, // Formato usado pelo CommentItem
          // Metadados para UI
          isAuthor: user && c.user_id === user.id,
          isPostAuthor: postData.author_id === c.user_id,
          canDelete: user && (user.id === c.user_id || user.id === postData.author_id)
        })) : [];

        // Atualizar estados
        setPost(processedPost);
        setComments(processedComments || []);
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
      fetchPostAndComments();
    }
  }, [id, user, getPostById, loadComments, hasLikedPost]);

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

  // Função para adicionar um comentário
  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      showError('O comentário não pode estar vazio');
      return;
    }
    
    try {
      // Usar o hook useComment para adicionar o comentário
      await addComment(id, comment.trim());
      
      // Limpar o formulário
      setComment('');
      showSuccess('Comentário adicionado com sucesso!');
      
      // Recarregar os comentários para ter a versão mais atualizada
      const updatedComments = await loadComments(id);
      
      // Processar os comentários atualizados para a UI
      const processedComments = updatedComments.map(c => ({
        id: c.id,
        postId: c.post_id,
        userId: c.user_id,
        content: c.content,
        text: c.content,
        user: c.author_name || 'Anônimo',
        created_at: c.created_at,
        createdAt: c.created_at,
        profiles: { username: c.author_name || 'Anônimo' },
        user_id: c.user_id,
        isAuthor: user && c.user_id === user.id,
        isPostAuthor: post.authorId === c.user_id,
        canDelete: user && (user.id === c.user_id || user.id === post.authorId)
      }));
      
      setComments(processedComments);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      showError('Erro ao adicionar comentário: ' + (error.message || 'Falha na operação'));
    }
  };

  // Função para mudar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Opcionalmente, rolar para o topo da seção de comentários
    const commentsSection = document.querySelector(`.${style.commentsContainer}`);
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Função para excluir comentário
  const handleDeleteComment = async (commentId) => {
    if (!user || !commentId) return;
    
    try {
      // Confirmação de exclusão
      if (!window.confirm('Tem certeza que deseja excluir este comentário?')) {
        return;
      }
      
      // Verificar permissão para excluir
      const targetComment = comments.find(c => c.id === commentId);
      if (!targetComment) {
        showError('Comentário não encontrado');
        return;
      }
      
      // Apenas o autor do comentário ou o autor do post podem excluir
      const canDelete = user.id === targetComment.userId || user.id === post.authorId;
      if (!canDelete) {
        showError('Você não tem permissão para excluir este comentário');
        return;
      }
      
      // Excluir usando o hook useComment
      await deleteComment(commentId, post.id);
      
      // Remover do estado local
      setComments(comments.filter(c => c.id !== commentId));
      showSuccess('Comentário excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      showError(`Erro ao excluir comentário: ${error.message || 'Tente novamente.'}`);
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
        <hr />
        <h3 className={style.commentsTitle}>Comentários</h3>
        <form onSubmit={handleComment} className={style.commentForm}>
          <input
            type="text"
            placeholder="Seu nome"
            value={user ? user.name || user.email : userInput}
            onChange={(e) => setUserInput(e.target.value)}
            required
            disabled={!!user}
            autoComplete="off"
          />
          <input
            type="text"
            placeholder="Seu comentário"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            autoComplete="off"
            maxLength={300}
          />
          <button type="submit">Comentar</button>
        </form>

        {/* <div className={style.commentsContainer}>
          {comments.length > 0 ? (
            <>
              {comments
             j  .slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage)
                .map((c) => (
                  <CommentItem 
                    key={c.id || `${c.user}-${c.text}-${Math.random()}`}
                    comment={c}
                    postId={post.id}
                    currentUser={user}
                    onDelete={() => handleDeleteComment(c.id)}
                  />
                ))}
              <div className={style.paginationWrapper}>
                <Pagination 
                  currentPage={currentPage}
                  totalPages={Math.ceil(comments.length / commentsPerPage)}
                  onPageChange={handlePageChange}
                  siblingCount={1}
                  size="sm"
                />
              </div>
            </>
          ) : (
            <p style={{ color: "#aaa" }}>Nenhum comentário ainda.</p>
          )}
        </div> */}
      </div>
    </>
  );
};
