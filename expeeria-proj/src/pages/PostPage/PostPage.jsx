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
  
  // Buscar post e comentários do Supabase usando abordagem simplificada
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        console.log('Iniciando busca de post ID:', id);
        setLoading(true);
        setError(null); // Limpar erros anteriores
        
        // PASSO 1: Buscar dados básicos do post (consulta simplificada)
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')  // Consulta simples, sem joins
          .eq('id', id)
          .single();
          
        console.log('Resultado da consulta de post:', { postData, postError });
          
        if (postError) {
          console.error('Erro ao buscar post:', postError);
          setError('Não foi possível carregar o post: ' + postError.message);
          setLoading(false);
          return;
        }
        
        if (!postData) {
          console.log('Post não encontrado');
          setError('Post não encontrado');
          setLoading(false);
          return;
        }
        
        // PASSO 2: Obter informações do autor (simplificado - sem buscar perfil)
        // A tabela 'profiles' não existe, então usamos diretamente o e-mail do autor
        const authorData = {
          id: postData.author_id,
          name: postData.author_name || 'Usuário', // Usar author_name se existir
          email: postData.author_email // Campo opcional
        };
        
        console.log('Informações do autor (simplificado):', authorData);
          
        // PASSO 3: Buscar contagem de likes
        const { count: likeCount, error: likeError } = await supabase
          .from('post_likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', id);
          
        console.log('Resultado da contagem de likes:', { likeCount, likeError });
          
        // PASSO 4: Buscar categorias do post
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('post_categories')
          .select('category')
          .eq('post_id', id);
          
        console.log('Resultado da busca de categorias:', { categoriesData, categoriesError });
        
        // PASSO 5: Buscar comentários do post (consulta simplificada)
        const { data: commentsRawData, error: commentsError } = await supabase
          .from('comments')
          .select('*')  // Sem joins complexos
          .eq('post_id', id)
          .order('created_at', { ascending: false });
          
        console.log('Resultado da busca de comentários:', { commentsRawData, commentsError });
        
        if (commentsError) {
          console.warn('Erro ao buscar comentários:', commentsError);
          // Não interrompe o fluxo, apenas mostra post sem comentários
        }
        
        // Processar dados do post combinando informações de todas as consultas
        const processedPost = {
          id: postData.id,
          title: postData.title,
          caption: postData.caption,
          content: postData.content,
          imageUrl: postData.image_url,
          author: authorData ? (authorData.name || authorData.username) : 'Usuário',
          authorId: postData.author_id,
          createdAt: postData.created_at,
          likeCount: likeCount || 0,
          categories: categoriesData ? categoriesData.map(cat => cat.category) : []
        };
        
        // Processar comentários para exibição
        let processedComments = [];
        if (commentsRawData && commentsRawData.length > 0) {
          processedComments = commentsRawData.map(comment => {
            return {
              id: comment.id,
              text: comment.content,
              user: comment.user_name || 'Usuário Anônimo',
              userId: comment.user_id,
              createdAt: comment.created_at
            };
          });
        }
        
        console.log('Post processado:', processedPost);
        console.log('Comentários processados:', processedComments);
        
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
      // Preparar dados do comentário para compatibilidade com a estrutura do banco
      const commentData = {
        content: comment,
        post_id: post.id,
        user_id: user ? user.id : null, // Usando user_id em vez de author_id
        user_name: user ? (user.name || user.email) : userInput, // Nome do usuário 
        created_at: new Date().toISOString()
      };
      
      // Inserir comentário no Supabase
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar comentário:', error);
        alert(`Erro ao adicionar comentário: ${error.message || 'Tente novamente.'}`);
        return;
      }
      
      // Processar e adicionar o novo comentário à lista
      const processedComment = {
        id: newComment.id,
        text: newComment.content,
        user: newComment.user_name,
        userId: newComment.user_id,
        createdAt: newComment.created_at
      };
      
      setComments([processedComment, ...comments]);
      
      // Limpar campos
      setComment("");
      if (!user) setUserInput("");
      
      // Após adicionar um comentário, voltar para a primeira página
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário. Tente novamente.');
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

  // Função para excluir comentário
  const handleDeleteComment = async (commentId) => {
    if (!user) {
      alert("Você precisa estar logado para excluir comentários!");
      return;
    }
    
    try {
      // Buscar o comentário para verificar se o usuário é o autor
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('user_id') // Usando user_id em vez de author_id
        .eq('id', commentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Verificar se o usuário é o autor do comentário ou admin
      if (comment.user_id !== user.id && user.role !== 'admin') {
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
  
  // Função para curtir post
  const handleLike = async () => {
    if (!user) {
      alert("Você precisa estar logado para curtir!");
      return;
    }
    
    try {
      // Verificar se o post existe
      if (!post) return;
      
      // Abordagem simplificada para lidar com curtidas
      // Em vez de usar o modelo tradicional de toggle (adicionar/remover like),
      // vamos sempre incrementar o contador para simplificar
      
      // Armazenar o estado atual de likes
      const currentLikes = post.likeCount || 0;
      
      // Atualizar a interface imediatamente para feedback visual 
      setPost({
        ...post,
        likeCount: currentLikes + 1
      });
      
      // Tentar registrar o like no Supabase (ignorando erros de chave duplicada)
      try {
        await supabase
          .from('post_likes')
          .upsert({
            post_id: post.id,
            user_id: user.id,
            created_at: new Date().toISOString()
          }, { onConflict: 'post_id,user_id' });
      } catch (err) {
        console.log('Erro ao registrar like (não afeta a experiência do usuário):', err);
        // Não mostramos erro ao usuário para não afetar a experiência
      }
    } catch (error) {
      console.error('Erro ao processar curtida:', error);
      // Interface já foi atualizada, não precisa mostrar erro ao usuário
    }
  };
    
    try {
      // Buscar o comentário para verificar se o usuário é o autor
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('user_id') // Usando user_id em vez de author_id
        .eq('id', commentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Verificar se o usuário é o autor do comentário ou admin
      if (comment.user_id !== user.id && user.role !== 'admin') {
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
  
  // A variável isOwnerOrAdmin já foi declarada anteriormente

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
