import { useContext, useCallback } from 'react';
import { CommentContext } from '../contexts/CommentContext';

/**
 * Hook personalizado para acessar e manipular comentários
 * Facilita o reuso das funcionalidades de comentários em diferentes componentes
 */
export const useComment = () => {
  const commentContext = useContext(CommentContext);
  
  if (!commentContext) {
    throw new Error("useComment deve ser usado dentro de um CommentProvider");
  }
  
  const { 
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
  } = commentContext;
  
  // Adicionar um comentário de forma otimista (atualiza a UI antes da resposta do servidor)
  const addCommentOptimistic = useCallback(async (postId, content) => {
    try {
      return await addComment(postId, content);
    } catch (error) {
      // Se falhar, o context já vai reverter a mudança
      console.error("Erro ao adicionar comentário:", error);
      throw error;
    }
  }, [addComment]);
  
  // Excluir um comentário de forma otimista
  const deleteCommentOptimistic = useCallback(async (commentId, postId) => {
    try {
      return await deleteComment(commentId, postId);
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      throw error;
    }
  }, [deleteComment]);
  
  // Toggle de curtida em um comentário
  const toggleLikeComment = useCallback(async (commentId, postId) => {
    const isLiked = hasLikedComment(commentId, postId);
    
    try {
      if (isLiked) {
        await unlikeComment(commentId, postId);
      } else {
        await likeComment(commentId, postId);
      }
      return { success: true };
    } catch (error) {
      console.error("Erro ao alternar curtida do comentário:", error);
      throw error;
    }
  }, [hasLikedComment, unlikeComment, likeComment]);
  
  return {
    comments,
    loading,
    error,
    loadComments,
    addComment: addCommentOptimistic,
    updateComment,
    deleteComment: deleteCommentOptimistic,
    likeComment,
    unlikeComment,
    hasLikedComment,
    getPostComments,
    toggleLikeComment
  };
};