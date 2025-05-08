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
    try {
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
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);
        
      if (category) {
        query = query.eq('area', category);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        posts: data || [],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      throw new Error('Não foi possível carregar os posts. Tente novamente mais tarde.');
    }
  },

  /**
   * Busca um post pelo ID
   * @param {string} id - ID do post
   * @returns {Promise} - Post encontrado
   */
  async getPostById(id) {
    try {
      if (!id) throw new Error('ID do post não fornecido');
      
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
      if (!data) throw new Error('Post não encontrado');
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar post ${id}:`, error);
      
      if (error.message === 'Post não encontrado') {
        throw new Error('O post que você está procurando não existe ou foi removido.');
      }
      
      throw new Error('Não foi possível carregar o post. Tente novamente.');
    }
  },

  /**
   * Cria um novo post
   * @param {Object} postData - Dados do post
   * @returns {Promise} - Post criado
   */
  async createPost(postData) {
    try {
      // Validação de campos obrigatórios
      if (!postData.title || postData.title.trim() === '') {
        throw new Error('O título do post é obrigatório');
      }
      
      if (!postData.user_id) {
        throw new Error('Usuário não autenticado. Faça login para criar um post.');
      }
      
      // Verificar se o usuário existe
      const { data: userExists, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', postData.user_id)
        .single();
        
      if (userError || !userExists) {
        console.error('Erro ao verificar usuário:', userError);
        throw new Error('Usuário não encontrado ou sem permissão para criar posts');
      }
      
      // Validação e configuração de tamanho máximo para conteúdo
      const content = postData.content || '';
      if (content.length > 50000) {
        throw new Error('O conteúdo do post é muito grande. Limite de 50.000 caracteres.');
      }
      
      // Garantir que os campos obrigatórios estejam presentes e formatados corretamente
      const newPostData = {
        title: postData.title.trim(),
        caption: (postData.caption || '').trim(),
        content: content,
        area: postData.area || 'geral',  // Valor padrão se não for fornecido
        user_id: postData.user_id,
        imageUrl: postData.imageUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        like_count: 0,  // Iniciar com zero curtidas
        comment_count: 0  // Iniciar com zero comentários
      };
      
      // Registro para depuração
      console.log('Criando novo post:', newPostData);
      
      // Criar post com transação
      const { data, error } = await supabase
        .from('posts')
        .insert(newPostData)
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `);
        
      if (error) {
        console.error('Erro detalhado do Supabase ao criar post:', error);
        
        // Mensagens de erro mais específicas com base no erro do Supabase
        if (error.code === '23505') {
          throw new Error('Já existe um post com este título. Use um título diferente.');
        } else if (error.code === '23503') {
          throw new Error('Erro de referência: verifique se todos os campos estão corretos.');
        } else {
          throw new Error('Não foi possível criar o post. Por favor, tente novamente.');
        }
      }
      
      if (!data || data.length === 0) {
        throw new Error('Post criado, mas não foi possível recuperar os dados. Recarregue a página.');
      }
      
      return data[0];
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
      
      if (error.message === 'Usuário não autenticado') {
        throw new Error('Você precisa estar logado para criar um post.');
      }
      
      throw new Error(error.message || 'Não foi possível criar o post. Tente novamente.');
    }
  },

  /**
   * Atualiza um post existente
   * @param {string} id - ID do post
   * @param {Object} postData - Dados atualizados
   * @returns {Promise} - Post atualizado
   */
  async updatePost(id, postData) {
    try {
      if (!id) throw new Error('ID do post não fornecido');
      
      const updateData = {
        ...postData,
        updated_at: new Date().toISOString()
      };
      
      // Remove campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.user_id;
      delete updateData.created_at;
      
      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Post não encontrado');
      
      return data;
    } catch (error) {
      console.error(`Erro ao atualizar post ${id}:`, error);
      throw new Error('Não foi possível atualizar o post. Tente novamente.');
    }
  },

  /**
   * Exclui um post
   * @param {string} id - ID do post
   * @returns {Promise} - Resultado da operação
   */
  async deletePost(id) {
    try {
      if (!id) throw new Error('ID do post não fornecido');
      
      // Primeiro excluir todos os likes relacionados ao post
      const { error: likesError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', id);
        
      if (likesError) throw likesError;
      
      // Em seguida, excluir todos os comentários relacionados
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('post_id', id);
        
      if (commentsError) throw commentsError;
      
      // Por fim, excluir o post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao excluir post ${id}:`, error);
      throw new Error('Não foi possível excluir o post. Tente novamente.');
    }
  },

  /**
   * Curte ou descurte um post
   * @param {string} postId - ID do post
   * @param {string} userId - ID do usuário
   * @returns {Promise} - Resultado da operação
   */
  async toggleLike(postId, userId) {
    try {
      if (!postId) throw new Error('ID do post não fornecido');
      if (!userId) throw new Error('Usuário não autenticado');
      
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
    } catch (error) {
      console.error('Erro ao alternar curtida:', error);
      
      if (error.message === 'Usuário não autenticado') {
        throw new Error('Você precisa estar logado para curtir posts.');
      }
      
      throw new Error('Não foi possível processar sua curtida. Tente novamente.');
    }
  },

  /**
   * Verifica se um usuário curtiu um post
   * @param {string} postId - ID do post
   * @param {string} userId - ID do usuário
   * @returns {Promise} - Resultado da verificação
   */
  async checkLiked(postId, userId) {
    try {
      if (!postId || !userId) return { liked: false };
      
      const { data, error } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return { liked: !!data };
    } catch (error) {
      console.error('Erro ao verificar curtida:', error);
      return { liked: false };
    }
  },

  /**
   * Busca posts por usuário
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções de filtragem
   * @returns {Promise} - Lista de posts
   */
  async getPostsByUser(userId, options = {}) {
    try {
      if (!userId) throw new Error('ID do usuário não fornecido');
      
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
        posts: data || [],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
      };
    } catch (error) {
      console.error(`Erro ao buscar posts do usuário ${userId}:`, error);
      throw new Error('Não foi possível carregar os posts deste usuário.');
    }
  },

  /**
   * Busca posts populares
   * @param {number} limit - Limite de posts
   * @returns {Promise} - Lista de posts populares
   */
  async getPopularPosts(limit = 5) {
    try {
      // Usando uma abordagem mais robusta para ordenar por curtidas
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
        .limit(limit);
        
      if (error) throw error;
      
      // Se não houver dados, retorna array vazio
      if (!data || data.length === 0) {
        return [];
      }
      
      // Ordenar por número de curtidas (após buscar os dados)
      const sortedData = [...data].sort((a, b) => {
        const likesA = a.likes?.count || 0;
        const likesB = b.likes?.count || 0;
        return likesB - likesA;
      });
      
      return sortedData;
    } catch (error) {
      console.error('Erro ao buscar posts populares:', error);
      throw new Error('Não foi possível carregar os posts populares.');
    }
  },

  /**
   * Busca posts por termo de pesquisa
   * @param {string} searchTerm - Termo de pesquisa
   * @returns {Promise} - Lista de posts
   */
  async searchPosts(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return [];
      }
      
      const term = searchTerm.trim();
      
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
        .or(`title.ilike.%${term}%,content.ilike.%${term}%,caption.ilike.%${term}%`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Erro ao pesquisar posts com termo "${searchTerm}":`, error);
      throw new Error('Não foi possível realizar a pesquisa. Tente novamente.');
    }
  },
  
  /**
   * Busca posts por categoria
   * @param {string} category - Categoria para filtrar
   * @param {Object} options - Opções de filtragem
   * @returns {Promise} - Lista de posts
   */
  async getPostsByCategory(category, options = {}) {
    try {
      if (!category) throw new Error('Categoria não fornecida');
      
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
        .eq('area', category)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);
        
      if (error) throw error;
      
      return {
        posts: data || [],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
      };
    } catch (error) {
      console.error(`Erro ao buscar posts da categoria ${category}:`, error);
      throw new Error('Não foi possível carregar os posts desta categoria.');
    }
  }
};