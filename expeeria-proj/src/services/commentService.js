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
    try {
      if (!postId) throw new Error('ID do post não fornecido');
      
      const { 
        page = 1, 
        limit = 20,
        orderBy = 'created_at',
        orderDirection = 'desc'
      } = options;
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Buscar apenas comentários do primeiro nível (sem parent_id)
      let query = supabase
        .from('comments')
        .select(`
          *,
          user:user_id(id, username, avatar_url),
          likes:comment_likes(count)
        `, { count: 'exact' })
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
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar comentários do post:', error);
      throw new Error('Não foi possível carregar os comentários. Tente novamente mais tarde.');
    }
  },
  
  /**
   * Cria um novo comentário
   * @param {Object} commentData - Dados do comentário
   * @returns {Promise<Object>} - Comentário criado
   */
  async createComment(commentData) {
    try {
      if (!commentData.post_id) throw new Error('ID do post não fornecido');
      if (!commentData.user_id) throw new Error('Usuário não autenticado');
      if (!commentData.content?.trim()) throw new Error('O conteúdo do comentário não pode estar vazio');
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: commentData.post_id,
          user_id: commentData.user_id,
          content: commentData.content.trim(),
          parent_id: commentData.parent_id || null,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          user:user_id(id, username, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Erro ao criar comentário');
      
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
      
      if (error.message === 'Usuário não autenticado') {
        throw new Error('Você precisa estar logado para comentar.');
      } else if (error.message.includes('conteúdo do comentário')) {
        throw new Error(error.message);
      }
      
      throw new Error('Não foi possível criar o comentário. Tente novamente.');
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
      if (!commentId) throw new Error('ID do comentário não fornecido');
      if (!updates.content?.trim()) throw new Error('O conteúdo do comentário não pode estar vazio');
      
      const { data, error } = await supabase
        .from('comments')
        .update({
          content: updates.content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Comentário não encontrado');
      
      return {
        content: data.content,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      
      if (error.message.includes('conteúdo do comentário')) {
        throw new Error(error.message);
      }
      
      throw new Error('Não foi possível atualizar o comentário. Tente novamente.');
    }
  },
  
  /**
   * Exclui um comentário
   * @param {string} commentId - ID do comentário
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteComment(commentId) {
    try {
      if (!commentId) throw new Error('ID do comentário não fornecido');
      
      // Primeiro verificar se há respostas e excluí-las
      const { data: replies } = await supabase
        .from('comments')
        .select('id')
        .eq('parent_id', commentId);
        
      // Excluir as respostas se existirem
      if (replies && replies.length > 0) {
        const replyIds = replies.map(reply => reply.id);
        
        // Excluir as curtidas das respostas
        const { error: replyLikesError } = await supabase
          .from('comment_likes')
          .delete()
          .in('comment_id', replyIds);
          
        if (replyLikesError) throw replyLikesError;
        
        // Excluir as respostas
        const { error: repliesError } = await supabase
          .from('comments')
          .delete()
          .in('id', replyIds);
          
        if (repliesError) throw repliesError;
      }
      
      // Excluir curtidas do comentário principal
      const { error: likesError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId);
      
      if (likesError) throw likesError;
      
      // Excluir o comentário principal
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      throw new Error('Não foi possível excluir o comentário. Tente novamente.');
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
      if (!commentId) throw new Error('ID do comentário não fornecido');
      if (!userId) throw new Error('Usuário não autenticado');
      
      // Verifica primeiro se a tabela comment_likes existe, se não, tenta usar a tabela likes
      const { error: checkTableError } = await supabase
        .from('comment_likes')
        .select('*')
        .limit(1);
      
      // Se houver erro de tabela não encontrada, tente usar a tabela likes com campo adicional
      const useGenericLikesTable = checkTableError && 
        checkTableError.message.includes('does not exist');
      
      const tableName = useGenericLikesTable ? 'likes' : 'comment_likes';
      
      // Verificar se o usuário já curtiu o comentário
      const { data: existingLike, error: checkError } = await supabase
        .from(tableName)
        .select('*')
        .eq(useGenericLikesTable ? 'target_id' : 'comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      // Se já existe curtida, remover
      if (existingLike) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', existingLike.id);
        
        if (deleteError) throw deleteError;
        
        return { liked: false };
      }
      
      // Se não existe, adicionar curtida
      const insertData = useGenericLikesTable 
        ? {
            target_id: commentId,
            user_id: userId,
            target_type: 'comment',
            created_at: new Date().toISOString()
          }
        : {
            comment_id: commentId,
            user_id: userId,
            created_at: new Date().toISOString()
          };
      
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(insertData);
      
      if (insertError) throw insertError;
      
      return { liked: true };
    } catch (error) {
      console.error('Erro ao alternar curtida em comentário:', error);
      
      if (error.message === 'Usuário não autenticado') {
        throw new Error('Você precisa estar logado para curtir comentários.');
      }
      
      throw new Error('Não foi possível processar sua curtida. Tente novamente.');
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
      if (!commentId || !userId) return { liked: false };
      
      // Verifica primeiro se a tabela comment_likes existe, se não, tenta usar a tabela likes
      const { error: checkTableError } = await supabase
        .from('comment_likes')
        .select('*')
        .limit(1);
      
      // Se houver erro de tabela não encontrada, tente usar a tabela likes com campo adicional
      const useGenericLikesTable = checkTableError && 
        checkTableError.message.includes('does not exist');
      
      const tableName = useGenericLikesTable ? 'likes' : 'comment_likes';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(useGenericLikesTable ? 'target_id' : 'comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return { liked: !!data };
    } catch (error) {
      console.error('Erro ao verificar curtida em comentário:', error);
      return { liked: false };
    }
  },
  
  /**
   * Busca respostas a um comentário
   * @param {string} parentId - ID do comentário pai
   * @returns {Promise<Array>} - Respostas ao comentário
   */
  async getReplies(parentId) {
    try {
      if (!parentId) throw new Error('ID do comentário pai não fornecido');
      
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
      throw new Error('Não foi possível carregar as respostas. Tente novamente mais tarde.');
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
      if (!commentId) throw new Error('ID do comentário não fornecido');
      if (!userId) throw new Error('Usuário não autenticado');
      if (!reason) throw new Error('Motivo do report não fornecido');
      
      // Verificar se o usuário já reportou este comentário
      const { data: existingReport, error: checkError } = await supabase
        .from('comment_reports')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingReport) {
        throw new Error('Você já reportou este comentário anteriormente');
      }
      
      const { error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          user_id: userId,
          reason,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      return { success: true, message: 'Comentário reportado com sucesso' };
    } catch (error) {
      console.error('Erro ao reportar comentário:', error);
      
      if (error.message === 'Usuário não autenticado') {
        throw new Error('Você precisa estar logado para reportar um comentário.');
      } else if (error.message.includes('já reportou')) {
        throw new Error(error.message);
      }
      
      throw new Error('Não foi possível reportar o comentário. Tente novamente.');
    }
  },
  
  /**
   * Conta o número de comentários de um post
   * @param {string} postId - ID do post
   * @returns {Promise<number>} - Número de comentários
   */
  async countCommentsByPost(postId) {
    try {
      if (!postId) return 0;
      
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar comentários:', error);
      return 0;
    }
  }
};