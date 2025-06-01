/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { examplePosts, getExamplePostById, getFilteredExamplePosts } from '../data/examplePosts';

/**
 * Hook personalizado para acessar posts de exemplo temporários
 * Substitui temporariamente a conexão com o banco de dados
 */
export const useExamplePosts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  
  // Carregar posts iniciais quando o hook for montado
  useEffect(() => {
    console.log('useExamplePosts hook montado - inicializando posts');
    setAllPosts(examplePosts);
    console.log('Posts inicializados:', examplePosts);
  }, []);
  
  const getPosts = () => {
    console.log('getPosts chamado');
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('getPosts completado:', examplePosts);
        setLoading(false);
        setAllPosts(examplePosts);
        resolve(examplePosts);
      }, 300); // Reduzido o tempo de carregamento para depuração
    });
  };
  
  const getPostById = (id) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const post = getExamplePostById(id);
        setLoading(false);
        if (post) {
          resolve(post);
        } else {
          setError('Post não encontrado');
          reject(new Error('Post não encontrado'));
        }
      }, 500);
    });
  };
  
  const filterPosts = (filters) => {
    return getFilteredExamplePosts(filters);
  };
  
  const likePost = (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  };
  
  const unlikePost = (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  };
  
  const hasLiked = (postId) => {
    // Simular verificação de like (sempre falso para demonstração)
    return false;
  };
  
  return {
    posts: allPosts,
    explorePosts: allPosts,
    currentPost: null,
    loading,
    error,
    loadAllPosts: getPosts,
    loadExplore: getPosts,
    loadPost: getPostById,
    filterPosts,
    likePost,
    unlikePost,
    hasLiked
  };
};
