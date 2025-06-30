import React, { createContext, useState, useCallback, useContext } from 'react';
import { commentService } from '../services/commentService';
import { AuthContext } from './AuthContext';

// Criando o contexto de comentários
export const CommentContext = createContext({});

export function CommentProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar comentários de um post específico
  const loadComments = useCallback(async (postId, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await commentService.getCommentsByPost(postId, options);
      
      setComments(prev => ({
        ...prev,
        [postId]: result.comments
      }));
      
      return result;
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      setError('Falha ao carregar os comentários. Tente novamente mais tarde.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar um comentário
  const addComment = useCallback(async (postId, content, parentId = null) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      const newComment = await commentService.createComment({
        post_id: postId,
        user_id: user.id,
        content,
        parent_id: parentId
      });
      
      // Se for uma resposta a outro comentário, não adiciona à lista principal
      if (!parentId) {
        // Adicionar o comentário ao estado local
        setComments(prev => {
          const postComments = prev[postId] || [];
          return {
            ...prev,
            [postId]: [newComment, ...postComments]
          };
        });
      }
      
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
            comment.id === commentId ? { ...comment, ...updatedComment } : comment
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
      const result = await commentService.deleteComment(commentId);
      
      // Remover o comentário do estado local apenas se for uma exclusão bem-sucedida
      if (result) {
        setComments(prev => {
          const postComments = prev[postId] || [];
          return {
            ...prev,
            [postId]: postComments.filter(comment => comment.id !== commentId)
          };
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      setError('Falha ao excluir comentário. Por favor, tente novamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Curtir ou descurtir um comentário
  const toggleLikeComment = useCallback(async (commentId, postId) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      const { liked } = await commentService.toggleLike(commentId, user.id);
      
      // Atualizar o estado local para refletir a mudança na curtida
      setComments(prev => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map(comment => {
            if (comment.id === commentId) {
              const currentLikesCount = comment.likes || 0;
              return {
                ...comment,
                // Se curtiu, incrementa o contador, senão decrementa
                likes: liked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1),
                liked
              };
            }
            return comment;
          })
        };
      });
      
      return { liked };
    } catch (error) {
      console.error('Erro ao interagir com comentário:', error);
      throw error;
    }
  }, [user]);

  // Verificar se o usuário curtiu um comentário
  const checkCommentLiked = useCallback(async (commentId) => {
    if (!user) return { liked: false };
    
    try {
      return await commentService.checkLiked(commentId, user.id);
    } catch (error) {
      console.error('Erro ao verificar curtida:', error);
      return { liked: false };
    }
  }, [user]);

  // Obter respostas a um comentário
  const loadReplies = useCallback(async (commentId) => {
    setLoading(true);
    try {
      const replies = await commentService.getReplies(commentId);
      return replies;
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reportar um comentário
  const reportComment = useCallback(async (commentId, reason) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      return await commentService.reportComment(commentId, user.id, reason);
    } catch (error) {
      console.error('Erro ao reportar comentário:', error);
      throw error;
    }
  }, [user]);

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
        toggleLikeComment,
        checkCommentLiked,
        loadReplies,
        reportComment,
        getPostComments
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}