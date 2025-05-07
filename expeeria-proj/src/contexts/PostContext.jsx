import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { postService } from '../services/postService';
import { commentService } from '../services/commentService';
import { AuthContext } from './AuthContext';
import supabase from '../services/supabase';

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
      const data = await postService.getPosts(params);
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
      // Buscar IDs de usuários que o usuário atual segue
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      if (!followingData || followingData.length === 0) {
        setFeedPosts([]);
        return [];
      }
      
      const followingIds = followingData.map(item => item.following_id);
      
      // Buscar posts dos usuários seguidos
      const { data, error: postsError } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .in('author_id', followingIds)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (postsError) throw postsError;
      
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
      // Montar a query com base nos filtros
      let query = supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .order('created_at', { ascending: false });
      
      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.trending) {
        query = query.order('like_count', { ascending: false });
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error: postsError } = await query;
      
      if (postsError) throw postsError;
      
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
      const { data, error: postsError } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;
      
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
      const post = await postService.getPostById(postId);
      setCurrentPost(post);
      return post;
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
      // Garantir que os dados estejam no formato esperado
      const newPostData = {
        ...postData,
        user_id: postData.user_id || user.id,
        like_count: postData.like_count || 0,
        comment_count: postData.comment_count || 0
      };
      
      // Remover campos que possam causar conflitos
      if (newPostData.author_id && newPostData.author_id !== newPostData.user_id) {
        delete newPostData.author_id;
      }
      
      const newPost = await postService.createPost(newPostData);
      
      // Atualizar os arrays locais com o novo post
      setPosts(current => [newPost, ...current]);
      setUserPosts(current => [newPost, ...current]);
      
      return newPost;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      setError('Falha ao criar o post. Por favor, tente novamente.');
      // Removendo o "throw error" para evitar que o erro seja propagado 
      // e cause problemas de carregamento infinito
      return null; // Retornar null para indicar falha
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
      // Verificar se o usuário já curtiu o post
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .match({ post_id: postId, user_id: user.id })
        .single();
      
      if (existingLike) {
        return { success: true }; // Já curtiu, não fazer nada
      }
      
      // Registrar curtida
      const { error: likeError } = await supabase
        .from('likes')
        .insert({ 
          post_id: postId, 
          user_id: user.id,
          created_at: new Date().toISOString()
        });
      
      if (likeError) throw likeError;
      
      // Incrementar contador de curtidas no post
      const { error: updateError } = await supabase.rpc('increment_likes', { post_id_param: postId });
      
      if (updateError) throw updateError;
      
      // Atualizar os arrays locais para refletir o like
      const updateArrayWithLike = (array) => 
        array.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              like_count: (post.like_count || 0) + 1,
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
          like_count: (prev.like_count || 0) + 1,
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
      // Remover curtida
      const { error: unlikeError } = await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: user.id });
      
      if (unlikeError) throw unlikeError;
      
      // Decrementar contador de curtidas no post
      const { error: updateError } = await supabase.rpc('decrement_likes', { post_id_param: postId });
      
      if (updateError) throw updateError;
      
      // Atualizar os arrays locais para refletir o unlike
      const updateArrayWithUnlike = (array) => 
        array.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              like_count: Math.max((post.like_count || 0) - 1, 0),
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
          like_count: Math.max((prev.like_count || 0) - 1, 0),
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
  const hasLiked = useCallback(async (postId) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('likes')
        .select()
        .match({ post_id: postId, user_id: user.id })
        .single();
      
      if (error && error.code !== 'PGRST116') return false; // PGRST116 é o código para 'no rows returned'
      
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar curtida:', error);
      return false;
    }
  }, [user]);

  // Adicionar um comentário a um post
  const addComment = useCallback(async (postId, commentText) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      const commentData = {
        post_id: postId,
        user_id: user.id,
        content: commentText,
        created_at: new Date().toISOString()
      };
      
      const newComment = await commentService.createComment(commentData);
      
      // Incrementar contador de comentários no post
      await supabase.rpc('increment_comments', { post_id_param: postId });
      
      // Atualizar o post atual com o novo comentário
      if (currentPost?.id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          comment_count: (prev.comment_count || 0) + 1
        }));
      }
      
      // Atualizar o contador de comentários nos arrays
      const updateArrayWithComment = (array) => 
        array.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comment_count: (post.comment_count || 0) + 1
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
      
      // Decrementar contador de comentários no post
      await supabase.rpc('decrement_comments', { post_id_param: postId });
      
      // Atualizar o post atual com o comentário removido
      if (currentPost?.id === postId) {
        setCurrentPost(prev => ({
          ...prev,
          comment_count: Math.max((prev.comment_count || 0) - 1, 0)
        }));
      }
      
      // Atualizar o contador de comentários nos arrays
      const updateArrayWithRemovedComment = (array) => 
        array.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comment_count: Math.max((post.comment_count || 0) - 1, 0)
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
      // Usar pesquisa textual do Supabase
      const { data, error: searchError } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .textSearch('content', query, {
          config: 'portuguese'
        });
      
      if (searchError) throw searchError;
      
      return data;
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
