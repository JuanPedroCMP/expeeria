import { useContext, useCallback } from 'react';
import { PostContext } from '../contexts/PostContext';

/**
 * Hook personalizado para acessar e manipular posts
 * Facilita o reuso das funcionalidades de posts em diferentes componentes
 */
export const usePost = () => {
  const postContext = useContext(PostContext);
  
  if (!postContext) {
    console.error('Erro crítico: usePost usado fora de um PostProvider');
    throw new Error("usePost deve ser usado dentro de um PostProvider. Verifique se o componente está dentro do PostProvider no App.jsx ou página específica");
  }
  
  // Desestruturar todos os valores disponíveis do contexto com nomes consistentes
  const { 
    posts, 
    userPosts,
    explorePosts,
    feedPosts,
    currentPost,
    loading, 
    error, 
    loadAllPosts, 
    loadFeed,
    loadExplore,
    loadUserPosts,
    loadPost, 
    createPost, 
    updatePost, 
    deletePost, 
    likePost,
    unlikePost, 
    hasLiked,
    addComment,
    deleteComment,
    searchPosts
  } = postContext;
  
  // Buscar um post por ID com cache local
  const getPostById = useCallback((id) => {
    const post = posts.find(post => post.id === id);
    
    if (post) {
      return Promise.resolve(post);
    }
    
    return loadPost(id);
  }, [posts, loadPost]);
  
  // Toggle de curtida em um post com verificação de autenticação
  const toggleLikePost = useCallback(async (postId) => {
    try {
      if (!postId) {
        throw new Error('ID do post não especificado para curtir/descurtir');
      }
      
      // Verifica se o post existe antes de curtir/descurtir
      const postExists = posts.find(post => post.id === postId) || await getPostById(postId).catch(() => null);
      
      if (!postExists) {
        console.warn(`Tentativa de curtir post inexistente (ID: ${postId})`);
        throw new Error('Post não encontrado. Ele pode ter sido removido.');
      }
      
      const isLiked = hasLiked(postId);
      
      // Aplicar otimisticamente a mudança na interface antes da resposta da API
      // para melhorar a experiência do usuário
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      
      return { success: true, liked: !isLiked };
    } catch (error) {
      console.error("Erro ao alternar curtida do post:", error);
      
      // Tratamento de erros específicos
      if (error.message.includes('não autenticado') || error.message.includes('login')) {
        throw new Error('Faça login para curtir posts');
      }
      
      throw error;
    }
  }, [hasLiked, unlikePost, likePost, posts, getPostById]);
  
  // Filtragem de posts - versão otimizada
  const filterPosts = useCallback((filterConfig) => {
    const {
      search = '',
      categories = [],
      author = '',
      dateFrom = null,
      dateTo = null,
      orderBy = 'recentes',
      limit = 0  // 0 significa sem limite
    } = filterConfig;
    
    // Verifica se temos posts para filtrar
    if (!posts || posts.length === 0) {
      return [];
    }
    
    try {
      // Clone dos posts para não modificar o array original
      let filteredPosts = [...posts];
      
      // Filtro por texto - otimizado para evitar verificações redundantes
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase().trim();
        filteredPosts = filteredPosts.filter(post => {
          // Verificar campos existentes para evitar erros
          const titleMatch = post.title ? post.title.toLowerCase().includes(searchLower) : false;
          const contentMatch = post.content ? post.content.toLowerCase().includes(searchLower) : false;
          const captionMatch = post.caption ? post.caption.toLowerCase().includes(searchLower) : false;
          
          // Verificar autor - pode estar em diferentes estruturas
          let authorMatch = false;
          if (post.author && typeof post.author === 'string') {
            authorMatch = post.author.toLowerCase().includes(searchLower);
          } else if (post.profiles?.username) {
            authorMatch = post.profiles.username.toLowerCase().includes(searchLower);
          } else if (post.profiles?.full_name) {
            authorMatch = post.profiles.full_name.toLowerCase().includes(searchLower);
          }
          
          return titleMatch || contentMatch || captionMatch || authorMatch;
        });
      }
      
      // Filtro por categorias - melhorado para lidar com diferentes formatos
      if (categories && categories.length > 0) {
        filteredPosts = filteredPosts.filter(post => {
          // Tratar diferentes formatos de armazenamento de área/categoria
          if (!post.area) return false;
          
          if (Array.isArray(post.area)) {
            return categories.some(cat => post.area.includes(cat));
          } else if (typeof post.area === 'string') {
            return categories.includes(post.area);
          }
          return false;
        });
      }
      
      // Filtro por autor - melhorado para verificar diferentes campos
      if (author && author.trim() !== '') {
        const authorLower = author.toLowerCase().trim();
        filteredPosts = filteredPosts.filter(post => {
          // Verificar diferentes locais onde o autor pode estar
          if (post.author && typeof post.author === 'string') {
            return post.author.toLowerCase().includes(authorLower);
          } else if (post.profiles?.username) {
            return post.profiles.username.toLowerCase().includes(authorLower);
          } else if (post.profiles?.full_name) {
            return post.profiles.full_name.toLowerCase().includes(authorLower);
          }
          return false;
        });
      }
      
      // Filtro por data - com verificação de validade das datas
      if (dateFrom) {
        try {
          const fromDate = new Date(dateFrom);
          if (!isNaN(fromDate.getTime())) {  // Verificar se é uma data válida
            fromDate.setHours(0, 0, 0, 0); // Início do dia
            
            filteredPosts = filteredPosts.filter(post => {
              try {
                const dateField = post.createdAt || post.created_at;
                if (!dateField) return true; // Se não tiver data, manter o post
                
                const postDate = new Date(dateField);
                return !isNaN(postDate.getTime()) && postDate >= fromDate;
              } catch {
                return true; // Em caso de erro na comparação, manter o post
              }
            });
          }
        } catch (e) {
          console.warn('Data inválida no filtro dateFrom:', e);
        }
      }
      
      if (dateTo) {
        try {
          const toDate = new Date(dateTo);
          if (!isNaN(toDate.getTime())) {  // Verificar se é uma data válida
            toDate.setHours(23, 59, 59, 999); // Final do dia
            
            filteredPosts = filteredPosts.filter(post => {
              try {
                const dateField = post.createdAt || post.created_at;
                if (!dateField) return true; // Se não tiver data, manter o post
                
                const postDate = new Date(dateField);
                return !isNaN(postDate.getTime()) && postDate <= toDate;
              } catch {
                return true; // Em caso de erro na comparação, manter o post
              }
            });
          }
        } catch (e) {
          console.warn('Data inválida no filtro dateTo:', e);
        }
      }
      
      // Ordenação com tratamento de erro
      try {
        if (orderBy === 'recentes') {
          filteredPosts.sort((a, b) => {
            try {
              const dateA = new Date(a.createdAt || a.created_at || 0);
              const dateB = new Date(b.createdAt || b.created_at || 0);
              return dateB - dateA;
            } catch {
              return 0; // Em caso de erro, manter a ordem original
            }
          });
        } else if (orderBy === 'curtidos') {
          filteredPosts.sort((a, b) => {
            try {
              // Lidar com diferentes formatos de contagem de curtidas
              const likesA = typeof a.like_count === 'number' ? a.like_count : 
                           (typeof a.likes === 'number' ? a.likes : 
                           (a.likes?.length || a.likes?.count || 0));
                           
              const likesB = typeof b.like_count === 'number' ? b.like_count : 
                           (typeof b.likes === 'number' ? b.likes : 
                           (b.likes?.length || b.likes?.count || 0));
                           
              return likesB - likesA;
            } catch {
              return 0; // Em caso de erro, manter a ordem original
            }
          });
        } else if (orderBy === 'comentados') {
          filteredPosts.sort((a, b) => {
            try {
              // Lidar com diferentes formatos de contagem de comentários
              const commentsA = typeof a.comment_count === 'number' ? a.comment_count : 
                              (typeof a.comments === 'number' ? a.comments : 
                              (a.comments?.length || a.comments?.count || 0));
                              
              const commentsB = typeof b.comment_count === 'number' ? b.comment_count : 
                              (typeof b.comments === 'number' ? b.comments : 
                              (b.comments?.length || b.comments?.count || 0));
                              
              return commentsB - commentsA;
            } catch {
              return 0; // Em caso de erro, manter a ordem original
            }
          });
        }
      } catch (e) {
        console.warn('Erro na ordenação de posts:', e);
      }
      
      // Aplicar limite se especificado
      if (limit > 0 && filteredPosts.length > limit) {
        filteredPosts = filteredPosts.slice(0, limit);
      }
      
      return filteredPosts;
    } catch (error) {
      console.error('Erro ao filtrar posts:', error);
      return []; // Retornar array vazio em caso de erro para evitar quebrar a interface
    }
  }, [posts]);
  
  return {
    // Estado
    posts,
    userPosts,
    explorePosts,
    feedPosts,
    currentPost,
    loading,
    error,
    
    // Métodos com nomes legados para manter compatibilidade
    fetchPosts: loadAllPosts,
    fetchPost: loadPost,
    hasLikedPost: hasLiked,
    
    // Métodos nativos do contexto
    loadAllPosts,
    loadFeed,
    loadExplore,
    loadUserPosts,
    loadPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    hasLiked,
    addComment,
    deleteComment,
    searchPosts,
    
    // Métodos auxiliares deste hook
    getPostById,
    toggleLikePost,
    filterPosts
  };
};