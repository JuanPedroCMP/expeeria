import supabase from './supabase';

/**
 * Serviço de API para operações com comentários usando Supabase
 */
export const commentService = {
  /**
   * Busca comentários de um post
   * @param {string} postId - ID do post
   * @param {Object} options - Opções de filtragem
   * @param {number} options.limit - Limite de comentários
   * @param {number} options.page - Página atual
   * @returns {Promise} - Lista de comentários
   */
  async getCommentsByPost(postId, options = {}) {
    const { limit = 20, page = 1 } = options;
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        likes:id (count)
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(limit)
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return {
      comments: data,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  },

  /**
   * Busca respostas de um comentário
   * @param {string} commentId - ID do comentário pai
   * @returns {Promise} - Lista de respostas
   */
  async getReplies(commentId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        likes:id (count)
      `)
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  /**
   * Cria um novo comentário
   * @param {Object} commentData - Dados do comentário
   * @returns {Promise} - Comentário criado
   */
  async createComment(commentData) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...commentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active'
      })
      .select();
      
    if (error) throw error;
    return data[0];
  },

  /**
   * Atualiza um comentário existente
   * @param {string} id - ID do comentário
   * @param {Object} commentData - Dados atualizados
   * @returns {Promise} - Comentário atualizado
   */
  async updateComment(id, commentData) {
    const { data, error } = await supabase
      .from('comments')
      .update({
        ...commentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  /**
   * Exclui um comentário (exclusão lógica)
   * @param {string} id - ID do comentário
   * @returns {Promise} - Resultado da operação
   */
  async deleteComment(id) {
    const { data, error } = await supabase
      .from('comments')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },

  /**
   * Curte ou descurte um comentário
   * @param {string} commentId - ID do comentário
   * @param {string} userId - ID do usuário
   * @returns {Promise} - Resultado da operação
   */
  async toggleLike(commentId, userId) {
    // Verifica se o usuário já curtiu o comentário
    const { data: existingLike, error: checkError } = await supabase
      .from('comment_likes')
      .select()
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    // Se já existe um like, remove
    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (deleteError) throw deleteError;
      return { liked: false };
    } 
    
    // Se não existe, adiciona o like
    const { error: insertError } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      
    if (insertError) throw insertError;
    return { liked: true };
  },

  /**
   * Verifica se um usuário curtiu um comentário
   * @param {string} commentId - ID do comentário
   * @param {string} userId - ID do usuário
   * @returns {Promise} - Resultado da verificação
   */
  async checkLiked(commentId, userId) {
    const { data, error } = await supabase
      .from('comment_likes')
      .select()
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return { liked: !!data };
  },

  /**
   * Reporta um comentário
   * @param {string} commentId - ID do comentário
   * @param {string} userId - ID do usuário que reportou
   * @param {string} reason - Motivo do report
   * @returns {Promise} - Resultado da operação
   */
  async reportComment(commentId, userId, reason) {
    const { data, error } = await supabase
      .from('comment_reports')
      .insert({
        comment_id: commentId,
        user_id: userId,
        reason,
        created_at: new Date().toISOString(),
        status: 'pending' // pending, reviewed, dismissed
      })
      .select();
      
    if (error) throw error;
    
    // Atualiza o status do comentário para 'flagged' após um certo número de reports
    const { count } = await supabase
      .from('comment_reports')
      .select('*', { count: 'exact' })
      .eq('comment_id', commentId);
      
    if (count >= 3) { // Limiar para flaggar um comentário
      await this.updateComment(commentId, { status: 'flagged' });
    }
    
    return data[0];
  },

  /**
   * Busca comentários feitos por um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções de filtragem
   * @returns {Promise} - Lista de comentários
   */
  async getCommentsByUser(userId, options = {}) {
    const { limit = 10, page = 1 } = options;
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('comments')
      .select(`
        *,
        posts:post_id (
          id,
          title
        ),
        likes:id (count)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return {
      comments: data,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }
};