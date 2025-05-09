import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import supabase from '../services/supabase';

/**
 * Hook personalizado para acessar e manipular comentários
 * Facilita o reuso das funcionalidades de comentários em diferentes componentes
 * Esta versão usa Supabase diretamente em vez de depender do CommentContext
 */
export const useComment = () => {
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Carregar comentários de um post
  const loadComments = useCallback(async (postId) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Armazenar os comentários no estado local
      setComments(prev => ({
        ...prev,
        [postId]: data || []
      }));
      
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      setError('Falha ao carregar os comentários');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar um comentário
  const addComment = useCallback(async (postId, content) => {
    if (!user) {
      throw new Error('Você precisa estar logado para comentar');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const newComment = {
        post_id: postId,
        user_id: user.id,
        author_name: user.name || user.email,
        content,
        created_at: new Date().toISOString()
      };
      
      // Adicionar otimisticamente ao estado local
      const optimisticComment = {
        ...newComment,
        id: `temp-${Date.now()}`, // ID temporário até receber resposta do servidor
        isOptimistic: true
      };
      
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: [optimisticComment, ...postComments]
        };
      });
      
      // Enviar para o servidor
      const { data, error } = await supabase
        .from('comments')
        .insert(newComment)
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar o estado com o comentário real retornado pelo servidor
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map(c => 
            c.id === optimisticComment.id ? data : c
          )
        };
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      
      // Reverter a atualização otimista em caso de erro
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.filter(c => !c.isOptimistic)
        };
      });
      
      setError('Falha ao adicionar comentário');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Excluir um comentário
  const deleteComment = useCallback(async (commentId, postId) => {
    if (!user) {
      throw new Error('Você precisa estar logado para excluir comentários');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Remover otimisticamente do estado local
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.filter(c => c.id !== commentId)
        };
      });
      
      // Excluir do servidor
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      setError('Falha ao excluir comentário');
      
      // Se falhar, recarregar os comentários do post
      await loadComments(postId);
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, loadComments]);
  
  // Verificar se usuário curtiu um comentário
  const hasLikedComment = useCallback(async (commentId) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar curtida:', error);
      return false;
    }
  }, [user]);
  
  // Curtir um comentário
  const likeComment = useCallback(async (commentId, postId) => {
    if (!user) {
      throw new Error('Você precisa estar logado para curtir comentários');
    }
    
    try {
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Atualizar o estado local
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: (comment.likes || 0) + 1,
                liked: true
              };
            }
            return comment;
          })
        };
      });
      
      return { success: true, liked: true };
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
      throw error;
    }
  }, [user]);
  
  // Descurtir um comentário
  const unlikeComment = useCallback(async (commentId, postId) => {
    if (!user) {
      throw new Error('Você precisa estar logado para descurtir comentários');
    }
    
    try {
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: Math.max(0, (comment.likes || 0) - 1),
                liked: false
              };
            }
            return comment;
          })
        };
      });
      
      return { success: true, liked: false };
    } catch (error) {
      console.error('Erro ao descurtir comentário:', error);
      throw error;
    }
  }, [user]);
  
  // Toggle de curtida em um comentário
  const toggleLikeComment = useCallback(async (commentId, postId) => {
    if (!user) {
      throw new Error('Você precisa estar logado para interagir com comentários');
    }
    
    try {
      // Verificar se já curtiu
      const isLiked = await hasLikedComment(commentId);
      
      if (isLiked) {
        return await unlikeComment(commentId, postId);
      } else {
        return await likeComment(commentId, postId);
      }
    } catch (error) {
      console.error('Erro ao alternar curtida:', error);
      throw error;
    }
  }, [user, hasLikedComment, likeComment, unlikeComment]);
  
  // Obter os comentários de um post específico
  const getPostComments = useCallback((postId) => {
    return comments[postId] || [];
  }, [comments]);
  
  // Atualizar um comentário
  const updateComment = useCallback(async (commentId, postId, content) => {
    if (!user) {
      throw new Error('Você precisa estar logado para editar comentários');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Atualizar otimisticamente no estado local
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map(c => 
            c.id === commentId ? { ...c, content, isEdited: true } : c
          )
        };
      });
      
      // Atualizar no servidor
      const { data, error } = await supabase
        .from('comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar o estado local com a resposta do servidor
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map(c => 
            c.id === commentId ? data : c
          )
        };
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      setError('Falha ao atualizar comentário');
      
      // Se falhar, recarregar os comentários do post
      await loadComments(postId);
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, loadComments]);
  
  return {
    // Estado
    comments,
    loading,
    error,
    
    // Métodos principais
    loadComments,
    getPostComments,
    addComment,
    updateComment,
    deleteComment,
    
    // Métodos para curtidas
    likeComment,
    unlikeComment,
    hasLikedComment,
    toggleLikeComment
  };
};