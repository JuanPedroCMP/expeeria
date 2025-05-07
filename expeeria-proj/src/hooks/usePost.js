import { useContext, useCallback } from 'react';
import { PostContext } from '../contexts/PostContext';

/**
 * Hook personalizado para acessar e manipular posts
 * Facilita o reuso das funcionalidades de posts em diferentes componentes
 */
export const usePost = () => {
  const postContext = useContext(PostContext);
  
  if (!postContext) {
    throw new Error("usePost deve ser usado dentro de um PostProvider");
  }
  
  const { 
    posts, 
    loading, 
    error, 
    loadAllPosts, 
    loadPost, 
    createPost, 
    updatePost, 
    deletePost, 
    likePost,
    unlikePost, 
    hasLiked 
  } = postContext;
  
  // Buscar um post por ID com cache local
  const getPostById = useCallback((id) => {
    const post = posts.find(post => post.id === id);
    
    if (post) {
      return Promise.resolve(post);
    }
    
    return loadPost(id);
  }, [posts, loadPost]);
  
  // Toggle de curtida em um post
  const toggleLikePost = useCallback(async (postId) => {
    const isLiked = hasLiked(postId);
    
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      return { success: true };
    } catch (error) {
      console.error("Erro ao alternar curtida do post:", error);
      throw error;
    }
  }, [hasLiked, unlikePost, likePost]);
  
  // Filtragem de posts
  const filterPosts = useCallback((filterConfig) => {
    const {
      search = '',
      categories = [],
      author = '',
      dateFrom = null,
      dateTo = null,
      orderBy = 'recentes'
    } = filterConfig;
    
    let filteredPosts = [...posts];
    
    // Filtro por texto
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        post => 
          (post.title && post.title.toLowerCase().includes(searchLower)) ||
          (post.content && post.content.toLowerCase().includes(searchLower)) ||
          (post.caption && post.caption.toLowerCase().includes(searchLower)) ||
          (post.author && post.author.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtro por categorias
    if (categories && categories.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        Array.isArray(post.area)
          ? categories.some(cat => post.area.includes(cat))
          : categories.includes(post.area)
      );
    }
    
    // Filtro por autor
    if (author) {
      const authorLower = author.toLowerCase();
      filteredPosts = filteredPosts.filter(
        post => post.author && post.author.toLowerCase().includes(authorLower)
      );
    }
    
    // Filtro por data
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0); // Início do dia
      
      filteredPosts = filteredPosts.filter(post => {
        const postDate = new Date(post.createdAt || post.created_at);
        return postDate >= fromDate;
      });
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // Final do dia
      
      filteredPosts = filteredPosts.filter(post => {
        const postDate = new Date(post.createdAt || post.created_at);
        return postDate <= toDate;
      });
    }
    
    // Ordenação
    if (orderBy === 'recentes') {
      filteredPosts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB - dateA;
      });
    } else if (orderBy === 'curtidos') {
      filteredPosts.sort((a, b) => {
        const likesA = typeof a.likes === 'number' ? a.likes : (a.likes?.length || 0);
        const likesB = typeof b.likes === 'number' ? b.likes : (b.likes?.length || 0);
        return likesB - likesA;
      });
    } else if (orderBy === 'comentados') {
      filteredPosts.sort((a, b) => {
        const commentsA = typeof a.comments === 'number' ? a.comments : (a.comments?.length || 0);
        const commentsB = typeof b.comments === 'number' ? b.comments : (b.comments?.length || 0);
        return commentsB - commentsA;
      });
    }
    
    return filteredPosts;
  }, [posts]);
  
  return {
    posts,
    loading,
    error,
    fetchPosts: loadAllPosts,
    fetchPost: loadPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    hasLikedPost: hasLiked,
    getPostById,
    toggleLikePost,
    filterPosts
  };
};