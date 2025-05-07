import React, { createContext, useState, useCallback, useContext } from 'react';
import { commentService } from '../services/api';
import { AuthContext } from './AuthContext';

// Criando o contexto de comentários
export const CommentContext = createContext({});

export function CommentProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar comentários de um post específico
  const loadComments = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await commentService.getPostComments(postId);
      
      setComments(prev => ({
        ...prev,
        [postId]: data
      }));
      
      return data;
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      setError('Falha ao carregar os comentários. Tente novamente mais tarde.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar um comentário
  const addComment = useCallback(async (postId, content) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      const newComment = await commentService.addComment(postId, {
        content,
        userId: user.id
      });
      
      // Adicionar o comentário ao estado local
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: [newComment, ...postComments]
        };
      });
      
      return newComment;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      setError('Falha ao adicionar comentário. Por favor, tente novamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Atualizar um comentário
  const updateComment = useCallback(async (commentId, postId, content) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedComment = await commentService.updateComment(commentId, { content });
      
      // Atualizar o comentário no estado local
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map(comment => 
            comment.id === commentId ? updatedComment : comment
          )
        };
      });
      
      return updatedComment;
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      setError('Falha ao atualizar comentário. Por favor, tente novamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Excluir um comentário
  const deleteComment = useCallback(async (commentId, postId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      await commentService.deleteComment(commentId);
      
      // Remover o comentário do estado local
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.filter(comment => comment.id !== commentId)
        };
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      setError('Falha ao excluir comentário. Por favor, tente novamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Curtir um comentário
  const likeComment = useCallback(async (commentId, postId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      await commentService.likeComment(commentId);
      
      // Atualizar o comentário no estado local
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: [...(comment.likes || []), user.id]
              };
            }
            return comment;
          })
        };
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
      throw error;
    }
  }, [user]);

  // Remover curtida de um comentário
  const unlikeComment = useCallback(async (commentId, postId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      await commentService.unlikeComment(commentId);
      
      // Atualizar o comentário no estado local
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: (comment.likes || []).filter(id => id !== user.id)
              };
            }
            return comment;
          })
        };
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover curtida do comentário:', error);
      throw error;
    }
  }, [user]);

  // Verificar se o usuário curtiu um comentário
  const hasLikedComment = useCallback((commentId, postId) => {
    if (!user) return false;
    
    const postComments = comments[postId] || [];
    const comment = postComments.find(c => c.id === commentId);
    
    return comment?.likes?.includes(user.id) || false;
  }, [user, comments]);

  // Obter os comentários de um post específico
  const getPostComments = useCallback((postId) => {
    return comments[postId] || [];
  }, [comments]);

  return (
    <CommentContext.Provider
      value={{
        comments,
        loading,
        error,
        loadComments,
        addComment,
        updateComment,
        deleteComment,
        likeComment,
        unlikeComment,
        hasLikedComment,
        getPostComments
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}