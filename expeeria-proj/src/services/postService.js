import supabase from './supabase';

/**
 * Serviço de API para operações com posts usando Supabase
 */
export const postService = {
  /**
   * Busca todos os posts
   * @param {Object} options - Opções de filtragem
   * @param {number} options.limit - Limite de posts
   * @param {number} options.page - Página atual
   * @param {string} options.category - Categoria para filtrar
   * @returns {Promise} - Lista de posts
   */
  async getPosts(options = {}) {
    const { limit = 10, page = 1, category = null } = options;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        comments:id (count),
        likes:id (count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
      
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      posts: data,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  },

  /**
   * Busca um post pelo ID
   * @param {string} id - ID do post
   * @returns {Promise} - Post encontrado
   */
  async getPostById(id) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        comments:id (
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        ),
        likes:id (
          *,
          profiles:user_id (
            id,
            username
          )
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },

  /**
   * Cria um novo post
   * @param {Object} postData - Dados do post
   * @returns {Promise} - Post criado
   */
  async createPost(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...postData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (error) throw error;
    return data[0];
  },

  /**
   * Atualiza um post existente
   * @param {string} id - ID do post
   * @param {Object} postData - Dados atualizados
   * @returns {Promise} - Post atualizado
   */
  async updatePost(id, postData) {
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  /**
   * Exclui um post
   * @param {string} id - ID do post
   * @returns {Promise} - Resultado da operação
   */
  async deletePost(id) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  },

  /**
   * Curte ou descurte um post
   * @param {string} postId - ID do post
   * @param {string} userId - ID do usuário
   * @returns {Promise} - Resultado da operação
   */
  async toggleLike(postId, userId) {
    // Verifica se o usuário já curtiu o post
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    // Se já existe um like, remove
    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (deleteError) throw deleteError;
      return { liked: false };
    } 
    
    // Se não existe, adiciona o like
    const { error: insertError } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      
    if (insertError) throw insertError;
    return { liked: true };
  },

  /**
   * Verifica se um usuário curtiu um post
   * @param {string} postId - ID do post
   * @param {string} userId - ID do usuário
   * @returns {Promise} - Resultado da verificação
   */
  async checkLiked(postId, userId) {
    const { data, error } = await supabase
      .from('likes')
      .select()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return { liked: !!data };
  },

  /**
   * Busca posts por usuário
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções de filtragem
   * @returns {Promise} - Lista de posts
   */
  async getPostsByUser(userId, options = {}) {
    const { limit = 10, page = 1 } = options;
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        comments:id (count),
        likes:id (count)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return {
      posts: data,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  },

  /**
   * Busca posts populares
   * @param {number} limit - Limite de posts
   * @returns {Promise} - Lista de posts populares
   */
  async getPopularPosts(limit = 5) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        comments:id (count),
        likes:id (count)
      `)
      .order('likes', { foreignTable: 'id', ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  },

  /**
   * Busca posts por termo de pesquisa
   * @param {string} searchTerm - Termo de pesquisa
   * @returns {Promise} - Lista de posts
   */
  async searchPosts(searchTerm) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        comments:id (count),
        likes:id (count)
      `)
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};