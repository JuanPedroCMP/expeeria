import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { postService, commentService } from '../services/api';
import { AuthContext } from './AuthContext';

// Criando o contexto de posts
export const PostContext = createContext({});

export function PostProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [explorePosts, setExplorePosts] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar todos os posts
  const loadAllPosts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await postService.getAllPosts(params);
      setPosts(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setError('Falha ao carregar os posts. Tente novamente mais tarde.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar posts para o feed do usuário (posts de quem ele segue)
  const loadFeed = useCallback(async (page = 1, limit = 10) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await postService.getFeed(page, limit);
      
      if (page === 1) {
        setFeedPosts(data);
      } else {
        setFeedPosts(current => [...current, ...data]);
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
      setError('Falha ao carregar seu feed. Tente novamente mais tarde.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar posts para a página explore (com filtros)
  const loadExplore = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await postService.getExplore(filters);
      setExplorePosts(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar exploração:', error);
      setError('Falha ao carregar posts para explorar. Tente novamente mais tarde.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar posts de um usuário específico
  const loadUserPosts = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await postService.getUserPosts(userId);
      setUserPosts(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar posts do usuário:', error);
      setError('Falha ao carregar os posts deste usuário.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar um post específico por ID
  const loadPost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await postService.getPostById(postId);
      setCurrentPost(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      setError('Falha ao carregar o post. O conteúdo pode ter sido removido.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar um novo post
  const createPost = useCallback(async (postData) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      const newPost = await postService.createPost({
        ...postData,
        authorId: user.id
      });
      
      // Atualizar os arrays locais com o novo post
      setPosts(current => [newPost, ...current]);
      setUserPosts(current => [newPost, ...current]);
      
      return newPost;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      setError('Falha ao criar o post. Por favor, tente novamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Atualizar um post existente
  const updatePost = useCallback(async (postId, postData) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedPost = await postService.updatePost(postId, postData);
      
      // Atualizar o post nos arrays locais
      const updateArray = (array) => 
        array.map(post => post.id === postId ? updatedPost : post);
      
      setPosts(updateArray);
      setUserPosts(updateArray);
      setFeedPosts(updateArray);
      setExplorePosts(updateArray);
      
      if (currentPost?.id === postId) {
        setCurrentPost(updatedPost);
      }
      
      return updatedPost;
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      setError('Falha ao atualizar o post. Por favor, tente novamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, currentPost]);

  // Excluir um post
  const deletePost = useCallback(async (postId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      await postService.deletePost(postId);
      
      // Remover o post dos arrays locais
      const filterArray = (array) => array.filter(post => post.id !== postId);
      
      setPosts(filterArray);
      setUserPosts(filterArray);
      setFeedPosts(filterArray);
      setExplorePosts(filterArray);
      
      if (currentPost?.id === postId) {
        setCurrentPost(null);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      setError('Falha ao excluir o post. Por favor, tente novamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, currentPost]);

  // Curtir um post
  const likePost = useCallback(async (postId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      await postService.likePost(postId);
      
      // Atualizar os arrays locais para refletir o like
      const updateArrayWithLike = (array) => 
        array.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likeCount: (post.likeCount || 0) + 1,
              likes: [...(post.likes || []), user.id]
            };
          }
          return post;
        });
      
      setPosts(updateArrayWithLike);
      setUserPosts(updateArrayWithLike);
      setFeedPosts(updateArrayWithLike);
      setExplorePosts(updateArrayWithLike);
      
      if (currentPost?.id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          likeCount: (prev.likeCount || 0) + 1,
          likes: [...(prev.likes || []), user.id]
        }));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      throw error;
    }
  }, [user, currentPost]);

  // Descurtir um post
  const unlikePost = useCallback(async (postId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      await postService.unlikePost(postId);
      
      // Atualizar os arrays locais para refletir o unlike
      const updateArrayWithUnlike = (array) => 
        array.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likeCount: Math.max((post.likeCount || 0) - 1, 0),
              likes: (post.likes || []).filter(id => id !== user.id)
            };
          }
          return post;
        });
      
      setPosts(updateArrayWithUnlike);
      setUserPosts(updateArrayWithUnlike);
      setFeedPosts(updateArrayWithUnlike);
      setExplorePosts(updateArrayWithUnlike);
      
      if (currentPost?.id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          likeCount: Math.max((prev.likeCount || 0) - 1, 0),
          likes: (prev.likes || []).filter(id => id !== user.id)
        }));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao descurtir post:', error);
      throw error;
    }
  }, [user, currentPost]);

  // Verificar se o usuário curtiu um post específico
  const hasLiked = useCallback((postId) => {
    if (!user) return false;
    
    const post = posts.find(p => p.id === postId) || 
                 currentPost?.id === postId ? currentPost : null;
    
    return post?.likes?.includes(user.id) || false;
  }, [user, posts, currentPost]);

  // Adicionar um comentário a um post
  const addComment = useCallback(async (postId, commentText) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      const newComment = await commentService.addComment(postId, {
        content: commentText,
        userId: user.id
      });
      
      // Atualizar o post atual com o novo comentário
      if (currentPost?.id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1
        }));
      }
      
      // Atualizar o contador de comentários nos arrays
      const updateArrayWithComment = (array) => 
        array.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              commentCount: (post.commentCount || 0) + 1
            };
          }
          return post;
        });
      
      setPosts(updateArrayWithComment);
      setUserPosts(updateArrayWithComment);
      setFeedPosts(updateArrayWithComment);
      setExplorePosts(updateArrayWithComment);
      
      return newComment;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  }, [user, currentPost]);

  // Remover um comentário de um post
  const deleteComment = useCallback(async (commentId, postId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      await commentService.deleteComment(commentId);
      
      // Atualizar o post atual com o comentário removido
      if (currentPost?.id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          commentCount: Math.max((prev.commentCount || 0) - 1, 0)
        }));
      }
      
      // Atualizar o contador de comentários nos arrays
      const updateArrayWithRemovedComment = (array) => 
        array.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              commentCount: Math.max((post.commentCount || 0) - 1, 0)
            };
          }
          return post;
        });
      
      setPosts(updateArrayWithRemovedComment);
      setUserPosts(updateArrayWithRemovedComment);
      setFeedPosts(updateArrayWithRemovedComment);
      setExplorePosts(updateArrayWithRemovedComment);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover comentário:', error);
      throw error;
    }
  }, [user, currentPost]);

  // Buscar posts com base em um termo de pesquisa
  const searchPosts = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await postService.searchPosts(query);
      return results;
    } catch (error) {
      console.error('Erro na pesquisa de posts:', error);
      setError('Falha ao pesquisar. Por favor, tente novamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PostContext.Provider
      value={{
        // Estado
        posts,
        userPosts,
        explorePosts,
        feedPosts,
        currentPost,
        loading,
        error,
        
        // Métodos de carregamento
        loadAllPosts,
        loadFeed,
        loadExplore,
        loadUserPosts,
        loadPost,
        
        // Métodos CRUD
        createPost,
        updatePost,
        deletePost,
        
        // Interações
        likePost,
        unlikePost,
        hasLiked,
        addComment,
        deleteComment,
        
        // Busca
        searchPosts,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}
