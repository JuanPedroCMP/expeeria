import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import style from "./PostPage.module.css";
import { Button, CommentItem, Pagination } from "../../components";
import { useAuth } from "../../hooks/useAuth";
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
  const { user } = useAuth();
  
  // Estados para paginação de comentários
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5; // Quantidade de comentários por página
  
  // Buscar post e comentários do Supabase
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        
        // Buscar o post com suas informações relacionadas
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            *,
            users!author_id (id, username, name, avatar),
            post_likes!post_id (count),
            post_categories!post_id (category)
          `)
          .eq('id', id)
          .single();
          
        if (postError) throw postError;
        
        if (!postData) {
          setError('Post não encontrado');
          setLoading(false);
          return;
        }
        
        // Buscar comentários do post
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            users!author_id (id, username, name, avatar)
          `)
          .eq('post_id', id)
          .order('created_at', { ascending: false });
          
        if (commentsError) throw commentsError;
        
        // Processar dados do post
        const processedPost = {
          id: postData.id,
          title: postData.title,
          caption: postData.caption,
          content: postData.content,
          imageUrl: postData.image_url,
          author: postData.users?.name || postData.users?.username || 'Usuário',
          authorId: postData.author_id,
          createdAt: postData.created_at,
          likeCount: postData.post_likes[0]?.count || 0,
          categories: postData.post_categories.map(cat => cat.category)
        };
        
        // Processar comentários
        const processedComments = commentsData.map(comment => ({
          id: comment.id,
          text: comment.content,
          user: comment.users?.name || comment.users?.username || 'Usuário',
          userId: comment.author_id,
          createdAt: comment.created_at,
          likeCount: comment.like_count || 0
        }));
        
        setPost(processedPost);
        setComments(processedComments);
        
        // Registrar visualização no localStorage para 'recentemente vistos'
        if (user) {
          try {
            const viewedPostsData = localStorage.getItem(`viewedPosts_${user.id}`);
            let viewedPosts = viewedPostsData ? JSON.parse(viewedPostsData) : [];
            
            // Manter apenas os últimos 10 posts visualizados
            viewedPosts = [id, ...viewedPosts.filter(postId => postId !== id)].slice(0, 10);
            localStorage.setItem(`viewedPosts_${user.id}`, JSON.stringify(viewedPosts));
          } catch (error) {
            console.error('Erro ao salvar post visualizado:', error);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar post:', error);
        setError('Falha ao carregar o post. Tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    fetchPostAndComments();
  }, [id, user]);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Você precisa estar logado para excluir!");
      return;
    }
    if (!post) return;
    
    // Verificar se o usuário é o autor do post ou administrador
    if (user.id !== post.authorId && user.role !== 'admin') {
      alert("Você não tem permissão para excluir este post.");
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
        
        alert("Post excluído com sucesso!");
        navigate('/'); // Redirecionar para a página inicial após excluir
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        alert("Erro ao excluir post. Tente novamente mais tarde.");
      }
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;
  if (!post) return <p>Post não encontrado.</p>;
  
  const isOwnerOrAdmin = user && (user.id === post.authorId || user.role === "admin");

  const handleComment = async (e) => {
    e.preventDefault();
    if (!(user || userInput) || !comment) return;
    
    try {
      // Preparar dados do comentário
      const commentData = {
        content: comment,
        post_id: post.id,
        author_id: user ? user.id : null,
        author_name: user ? null : userInput, // Se não for usuário logado, salvar o nome
        created_at: new Date().toISOString(),
        like_count: 0,
        status: 'active'
      };
      
      // Inserir comentário no Supabase
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Processar e adicionar o novo comentário à lista
      const processedComment = {
        id: newComment.id,
        text: newComment.content,
        user: user ? user.name || user.email : userInput,
        userId: user ? user.id : null,
        createdAt: newComment.created_at,
        likeCount: 0
      };
      
      setComments([processedComment, ...comments]);
      
      // Limpar campos
      setComment("");
      if (!user) setUserInput("");
      
      // Após adicionar um comentário, voltar para a primeira página
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Não foi possível adicionar o comentário. Tente novamente.');
    }
  };

  // Função para mudar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll para cima da seção de comentários
    const commentsSection = document.querySelector(`.${style.commentsTitle}`);
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Funu00e7u00e3o para curtir post
  const handleLike = async () => {
    if (!user) {
      alert("Vocu00ea precisa estar logado para curtir!");
      return;
    }
    
    try {
      // Verificar se o post existe
      if (!post) return;
      
      // Verificar se o usuário já curtiu o post
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 é o código para 'nenhum resultado encontrado'
        throw checkError;
      }
      
      if (existingLike) {
        // Usuário já curtiu, então remover o like
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
          
        if (deleteError) throw deleteError;
        
        // Atualizar o post localmente
        setPost({
          ...post,
          likeCount: Math.max(0, post.likeCount - 1)
        });
      } else {
        // Usuário ainda não curtiu, adicionar like
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
          
        if (insertError) throw insertError;
        
        // Atualizar o post localmente
        setPost({
          ...post,
          likeCount: post.likeCount + 1
        });
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      alert('Não foi possível processar sua curtida. Tente novamente.');
    }
  };
  
  // Funu00e7u00e3o para excluir comentu00e1rio
  const handleDeleteComment = async (commentId) => {
    if (!user) {
      alert("Vocu00ea precisa estar logado para excluir comentu00e1rios!");
      return;
    }
    
    try {
      // Buscar o comentário para verificar se o usuário é o autor
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('author_id')
        .eq('id', commentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Verificar se o usuário é o autor do comentário ou admin
      if (comment.author_id !== user.id && user.role !== 'admin') {
        alert("Você não tem permissão para excluir este comentário.");
        return;
      }
      
      if (window.confirm("Tem certeza que deseja excluir este comentário?")) {
        // Excluir comentário
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);
          
        if (error) throw error;
        
        // Atualizar a lista de comentários localmente
        setComments(comments.filter(c => c.id !== commentId));
        alert("Comentário excluído com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      alert('Erro ao excluir comentário. Tente novamente.');
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
        <h2>Erro ao carregar o post</h2>
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
  
  // Verificar se o usuário é dono do post ou administrador
  const isOwnerOrAdmin = user && (user.id === post.authorId || user.role === 'admin');

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

        <Button destino="/" texto="Voltar para a página inicial" />
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
        <button
          onClick={handleLike}
          className={style.likeBtn}
          disabled={!user}
        >
          ❤️ {post.likeCount || 0}
        </button>
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

        <div className={style.commentsContainer}>
          {comments.length > 0 ? (
            <>
              {comments
                .slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage)
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
        </div>
      </div>
    </>
  );
};
