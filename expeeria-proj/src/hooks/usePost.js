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
    fetchPosts, 
    fetchPost, 
    createPost, 
    updatePost, 
    deletePost, 
    likePost,
    unlikePost,
    hasLikedPost 
  } = postContext;
  
  // Buscar um post por ID com cache local
  const getPostById = useCallback((id) => {
    const post = posts.find(post => post.id === id);
    
    if (post) {
      return Promise.resolve(post);
    }
    
    return fetchPost(id);
  }, [posts, fetchPost]);
  
  // Toggle de curtida em um post
  const toggleLikePost = useCallback(async (postId) => {
    const isLiked = hasLikedPost(postId);
    
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
  }, [hasLikedPost, unlikePost, likePost]);
  
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
      filteredPosts = filteredPosts.filter(
        post => new Date(post.createdAt) >= fromDate
      );
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredPosts = filteredPosts.filter(
        post => new Date(post.createdAt) <= toDate
      );
    }
    
    // Ordenação
    if (orderBy === 'recentes') {
      filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (orderBy === 'curtidos') {
      filteredPosts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (orderBy === 'comentados') {
      filteredPosts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
    }
    
    return filteredPosts;
  }, [posts]);
  
  return {
    posts,
    loading,
    error,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    hasLikedPost,
    getPostById,
    toggleLikePost,
    filterPosts
  };
};