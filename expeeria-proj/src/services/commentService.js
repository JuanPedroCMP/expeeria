import supabase from './supabase';

/**
 * Serviço para gerenciar comentários usando Supabase
 */
export const commentService = {
  /**
   * Busca comentários de um post específico
   * @param {string} postId - ID do post
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Comentários do post
   */
  async getCommentsByPost(postId, options = {}) {
    const { 
      page = 1, 
      limit = 20,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options;
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    try {
      // Buscar apenas comentários do primeiro nível (sem parent_id)
      let query = supabase
        .from('comments')
        .select(`
          *,
          user:user_id(id, username, avatar_url),
          likes:comment_likes(count)
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(from, to);
      
      const { data: comments, error, count } = await query;
      
      if (error) throw error;
      
      // Processar os comentários para um formato mais amigável
      const processedComments = comments?.map(comment => ({
        id: comment.id,
        postId: comment.post_id,
        userId: comment.user_id,
        content: comment.content,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        user: comment.user,
        likes: comment.likes[0]?.count || 0
      })) || [];
      
      return {
        comments: processedComments,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar comentários do post:', error);
      throw error;
    }
  },
  
  /**
   * Cria um novo comentário
   * @param {Object} commentData - Dados do comentário
   * @returns {Promise<Object>} - Comentário criado
   */
  async createComment(commentData) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: commentData.post_id,
          user_id: commentData.user_id,
          content: commentData.content,
          parent_id: commentData.parent_id || null,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          user:user_id(id, username, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        parentId: data.parent_id,
        user: data.user,
        likes: 0
      };
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      throw error;
    }
  },
  
  /**
   * Atualiza um comentário existente
   * @param {string} commentId - ID do comentário
   * @param {Object} updates - Dados a serem atualizados
   * @returns {Promise<Object>} - Comentário atualizado
   */
  async updateComment(commentId, updates) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          content: updates.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        content: data.content,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      throw error;
    }
  },
  
  /**
   * Exclui um comentário
   * @param {string} commentId - ID do comentário
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteComment(commentId) {
    try {
      // Primeiro excluir todas as curtidas relacionadas
      const { error: likesError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId);
      
      if (likesError) throw likesError;
      
      // Depois excluir o comentário
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      throw error;
    }
  },
  
  /**
   * Alterna a curtida em um comentário
   * @param {string} commentId - ID do comentário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} - Status da curtida
   */
  async toggleLike(commentId, userId) {
    try {
      // Verificar se o usuário já curtiu o comentário
      const { data: existingLike, error: checkError } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // Se já existe curtida, remover
      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (deleteError) throw deleteError;
        
        return { liked: false };
      }
      
      // Se não existe curtida, adicionar
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
      
      return { liked: true };
    } catch (error) {
      console.error('Erro ao alternar curtida em comentário:', error);
      throw error;
    }
  },
  
  /**
   * Verifica se um usuário curtiu um comentário
   * @param {string} commentId - ID do comentário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} - Status da curtida
   */
  async checkLiked(commentId, userId) {
    try {
      const { data, error } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      return { liked: !!data };
    } catch (error) {
      console.error('Erro ao verificar curtida em comentário:', error);
      throw error;
    }
  },
  
  /**
   * Busca respostas a um comentário
   * @param {string} parentId - ID do comentário pai
   * @returns {Promise<Array>} - Respostas ao comentário
   */
  async getReplies(parentId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id(id, username, avatar_url),
          likes:comment_likes(count)
        `)
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Processar as respostas para um formato mais amigável
      return data?.map(reply => ({
        id: reply.id,
        postId: reply.post_id,
        userId: reply.user_id,
        content: reply.content,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
        parentId: reply.parent_id,
        user: reply.user,
        likes: reply.likes[0]?.count || 0
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar respostas do comentário:', error);
      throw error;
    }
  },
  
  /**
   * Reporta um comentário
   * @param {string} commentId - ID do comentário
   * @param {string} userId - ID do usuário que está reportando
   * @param {string} reason - Motivo do report
   * @returns {Promise<Object>} - Status do report
   */
  async reportComment(commentId, userId, reason) {
    try {
      const { data, error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          user_id: userId,
          reason,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao reportar comentário:', error);
      throw error;
    }
  }
};