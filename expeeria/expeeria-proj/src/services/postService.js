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
          users!author_id (  
            id,
            username,
            name,
            avatar
          ),
          comments!post_id (count),
          post_likes!post_id (count)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);
        
      if (category) {
        // Usando subconsulta para buscar posts pela categoria usando a tabela de categorias
        query = query.in('id', supabase
          .from('post_categories')
          .select('post_id')
          .eq('category', category));
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
          users!author_id (
            id,
            username,
            name,
            avatar
          ),
          comments!post_id (
            *,
            users!user_id (
              id,
              username,
              avatar
            )
          ),
          post_likes!post_id (
            *,
            users!user_id (
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
      
      if (!postData.author_id) {
        throw new Error('Usuário não autenticado. Faça login para criar um post.');
      }
      
      // Verificar se o usuário existe
      const { data: userExists, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', postData.author_id)
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
        image_url: postData.image_url || null,
        author_id: postData.author_id,
        status: postData.status || 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: postData.status === 'published' ? new Date().toISOString() : null,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        metadata: JSON.stringify({ readTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 225)) })
      };
      
      // Criar o post
      const { data, error } = await supabase
        .from('posts')
        .insert(newPostData)
        .select('*')
        .single();
      
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
      
      // Se houver categorias, adicionar à tabela de categorias
      if (postData.categories && Array.isArray(postData.categories) && postData.categories.length > 0) {
        const categoriesData = postData.categories.map(category => ({
          post_id: data.id,
          category: category.trim()
        }));
        
        const { error: categoryError } = await supabase
          .from('post_categories')
          .insert(categoriesData);
          
        if (categoryError) {
          console.error('Erro ao adicionar categorias:', categoryError);
          // Não impedimos o fluxo principal, pois o post já foi criado
        }
      }
      
      // Se houver tags, adicionar à tabela de tags
      if (postData.tags && Array.isArray(postData.tags) && postData.tags.length > 0) {
        const tagsData = postData.tags.map(tag => ({
          post_id: data.id,
          tag: tag.trim().toLowerCase()
        }));
        
        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(tagsData);
          
        if (tagError) {
          console.error('Erro ao adicionar tags:', tagError);
          // Não impedimos o fluxo principal, pois o post já foi criado
        }
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error.message ? new Error(error.message) : new Error('Não foi possível criar o post. Tente novamente.');
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
      
      // Verificar se o post existe e é do usuário
      const { data: existingPost, error: checkError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', id)
        .single();
        
      if (checkError || !existingPost) {
        throw new Error('Post não encontrado ou você não tem permissão para editá-lo');
      }
      
      if (existingPost.author_id !== postData.author_id) {
        throw new Error('Você não tem permissão para editar este post');
      }
      
      // Dados a serem atualizados
      const updateData = {
        ...postData,
        updated_at: new Date().toISOString()
      };
      
      // Atualizar o post
      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erro ao atualizar post ${id}:`, error);
      throw error.message ? new Error(error.message) : new Error('Não foi possível atualizar o post. Tente novamente.');
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
      
      // Verificar se o post existe antes de excluir
      const { data: existingPost, error: checkError } = await supabase
        .from('posts')
        .select('id')
        .eq('id', id)
        .single();
        
      if (checkError || !existingPost) {
        throw new Error('Post não encontrado');
      }
      
      // Graças ao ON DELETE CASCADE, não precisamos excluir manualmente os registros relacionados
      // como likes, comentários, categorias, etc.
      
      // Excluir o post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return { success: true, message: 'Post excluído com sucesso' };
    } catch (error) {
      console.error(`Erro ao excluir post ${id}:`, error);
      throw error.message ? new Error(error.message) : new Error('Não foi possível excluir o post. Tente novamente.');
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
      if (!userId) throw new Error('ID do usuário não fornecido');
      
      // Verificar se o usuário já curtiu o post
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      let result;
      
      if (existingLike) {
        // Se já curtiu, remove a curtida
        const { error: unlikeError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
          
        if (unlikeError) throw unlikeError;
        
        // Não precisamos atualizar o contador manualmente
        // O trigger update_post_like_count criado no SQL faz isso automaticamente
        
        result = { liked: false };
      } else {
        // Se não curtiu, adiciona a curtida
        const { error: likeError } = await supabase
          .from('post_likes')
          .insert({ 
            post_id: postId, 
            user_id: userId,
            created_at: new Date().toISOString()
          });
          
        if (likeError) throw likeError;
        
        // Não precisamos atualizar o contador manualmente
        // O trigger update_post_like_count criado no SQL faz isso automaticamente
        
        result = { liked: true };
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao alternar curtida:', error);
      
      if (error.message === 'ID do usuário não fornecido') {
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
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) throw error;
      
      return { liked: !!data };
    } catch (error) {
      console.error(`Erro ao verificar curtida do post ${postId}:`, error);
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
          users!author_id (  
            id,
            username,
            name,
            avatar
          ),
          comments!post_id (count),
          post_likes!post_id (count)
        `, { count: 'exact' })
        .eq('author_id', userId)
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
          users!author_id (  
            id,
            username,
            name,
            avatar
          ),
          comments!post_id (count),
          post_likes!post_id (count)
        `)
        .limit(limit)
        .order('like_count', { ascending: false });
        
      if (error) throw error;
      
      // Se não houver dados, retorna array vazio
      if (!data || data.length === 0) {
        return [];
      }
      
      return data;
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
          users!author_id (  
            id,
            username,
            name,
            avatar
          ),
          comments!post_id (count),
          post_likes!post_id (count)
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
      
      // Consulta usando a tabela de categorias
      const postIdsQuery = supabase
        .from('post_categories')
        .select('post_id')
        .eq('category', category);
      
      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          users!author_id (  
            id,
            username,
            name,
            avatar
          ),
          comments!post_id (count),
          post_likes!post_id (count)
        `, { count: 'exact' })
        .in('id', postIdsQuery)
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