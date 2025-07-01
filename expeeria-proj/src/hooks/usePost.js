import { useState, useCallback } from 'react';
import supabase from '../services/supabase';
import { useAuth } from './useAuth';

/**
 * Hook simplificado para acessar e manipular posts diretamente com o Supabase
 * Esta versão usa Supabase diretamente em vez de depender do PostContext
 */
export const usePost = () => {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Buscar um post por ID com cache local
  const getPostById = useCallback(async (id) => {
    // Verificar se já temos o post em cache
    const post = posts.find(post => post.id === id);
    
    if (post) {
      return post;
    }
    
    // Caso contrário, buscar do Supabase
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          post_categories (
            category
          ),
          users!author_id (
            id,
            name,
            username,
            avatar
          )
        `)
        .eq('id', id)
        .single();
      
      if (postError) throw postError;
      if (!data) throw new Error('Post não encontrado');
      
      // Guardar o post encontrado no estado local
      setCurrentPost(data);
      return data;
    } catch (err) {
      console.error('Erro ao buscar post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [posts]);
  
  // Carregar todos os posts
  const loadAllPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_categories (
            category
          ),
          users!author_id (
            id,
            name,
            username,
            avatar
          )
        `)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;
      
      setPosts(data);
      return data;
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Carregar um post específico pelo ID
  const loadPost = useCallback(async (id) => {
    return getPostById(id);
  }, [getPostById]);
  
  // Toggle de curtida em um post com verificação de autenticação
  const toggleLikePost = useCallback(async (postId) => {
    try {
      if (!user) {
        throw new Error('Você precisa estar logado para curtir posts');
      }
      
      if (!postId) {
        throw new Error('ID do post não especificado para curtir/descurtir');
      }
      
      // Verifica se o post existe antes de curtir/descurtir
      const postExists = posts.find(post => post.id === postId) || await getPostById(postId).catch(() => null);
      
      if (!postExists) {
        console.warn(`Tentativa de curtir post inexistente (ID: ${postId})`);
        throw new Error('Post não encontrado. Ele pode ter sido removido.');
      }
      
      // Verifica se já curtiu o post
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      let liked = false;
      
      // Se já curtiu, remove a curtida
      if (existingLike) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        liked = false;
      } 
      // Senão, adiciona a curtida
      else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
        liked = true;
      }
      
      // Atualiza o post no estado local
      if (currentPost && currentPost.id === postId) {
        setCurrentPost({
          ...currentPost,
          likeCount: currentPost.likeCount + (liked ? 1 : -1)
        });
      }
      
      return { success: true, liked };
    } catch (error) {
      console.error("Erro ao alternar curtida do post:", error);
      throw error;
    }
  }, [user, posts, getPostById, currentPost]);
  
  // Filtragem de posts - versão otimizada
  const filterPosts = useCallback((filterConfig) => {
    const {
      search = '',
      categories = [],
      author = '',
      dateFrom = null,
      dateTo = null,
      orderBy = 'recentes',
      limit = 0  // 0 significa sem limite
    } = filterConfig;
    
    // Verifica se temos posts para filtrar
    if (!posts || posts.length === 0) {
      return [];
    }
    
    try {
      // Clone dos posts para não modificar o array original
      let filteredPosts = [...posts];
      
      // Filtro por texto - otimizado para evitar verificações redundantes
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase().trim();
        filteredPosts = filteredPosts.filter(post => {
          // Verificar campos existentes para evitar erros
          const titleMatch = post.title ? post.title.toLowerCase().includes(searchLower) : false;
          const contentMatch = post.content ? post.content.toLowerCase().includes(searchLower) : false;
          const captionMatch = post.caption ? post.caption.toLowerCase().includes(searchLower) : false;
          
          // Verificar autor - pode estar em diferentes estruturas
          let authorMatch = false;
          if (post.author && typeof post.author === 'string') {
            authorMatch = post.author.toLowerCase().includes(searchLower);
          } else if (post.profiles?.username) {
            authorMatch = post.profiles.username.toLowerCase().includes(searchLower);
          } else if (post.profiles?.full_name) {
            authorMatch = post.profiles.full_name.toLowerCase().includes(searchLower);
          }
          
          return titleMatch || contentMatch || captionMatch || authorMatch;
        });
      }
      
      // Filtro por categorias - usar tabela post_categories
      if (categories && categories.length > 0) {
        filteredPosts = filteredPosts.filter(post => {
          // Verificar se o post tem categorias associadas
          if (post.post_categories && Array.isArray(post.post_categories)) {
            return categories.some(cat => 
              post.post_categories.some(pc => pc.category === cat)
            );
          }
          
          // Fallback para compatibilidade com dados antigos que usam 'area'
          if (post.area) {
            if (Array.isArray(post.area)) {
              return categories.some(cat => post.area.includes(cat));
            } else if (typeof post.area === 'string') {
              return categories.includes(post.area);
            }
          }
          
          return false;
        });
      }
      
      // Filtro por autor - melhorado para verificar diferentes campos
      if (author && author.trim() !== '') {
        const authorLower = author.toLowerCase().trim();
        filteredPosts = filteredPosts.filter(post => {
          // Verificar diferentes locais onde o autor pode estar
          if (post.author && typeof post.author === 'string') {
            return post.author.toLowerCase().includes(authorLower);
          } else if (post.profiles?.username) {
            return post.profiles.username.toLowerCase().includes(authorLower);
          } else if (post.profiles?.full_name) {
            return post.profiles.full_name.toLowerCase().includes(authorLower);
          }
          return false;
        });
      }
      
      // Filtro por data - com verificação de validade das datas
      if (dateFrom) {
        try {
          const fromDate = new Date(dateFrom);
          if (!isNaN(fromDate.getTime())) {  // Verificar se é uma data válida
            fromDate.setHours(0, 0, 0, 0); // Início do dia
            
            filteredPosts = filteredPosts.filter(post => {
              try {
                const dateField = post.createdAt || post.created_at;
                if (!dateField) return true; // Se não tiver data, manter o post
                
                const postDate = new Date(dateField);
                return !isNaN(postDate.getTime()) && postDate >= fromDate;
              } catch {
                return true; // Em caso de erro na comparação, manter o post
              }
            });
          }
        } catch (e) {
          console.warn('Data inválida no filtro dateFrom:', e);
        }
      }
      
      if (dateTo) {
        try {
          const toDate = new Date(dateTo);
          if (!isNaN(toDate.getTime())) {  // Verificar se é uma data válida
            toDate.setHours(23, 59, 59, 999); // Final do dia
            
            filteredPosts = filteredPosts.filter(post => {
              try {
                const dateField = post.createdAt || post.created_at;
                if (!dateField) return true; // Se não tiver data, manter o post
                
                const postDate = new Date(dateField);
                return !isNaN(postDate.getTime()) && postDate <= toDate;
              } catch {
                return true; // Em caso de erro na comparação, manter o post
              }
            });
          }
        } catch (e) {
          console.warn('Data inválida no filtro dateTo:', e);
        }
      }
      
      // Ordenação com tratamento de erro
      try {
        if (orderBy === 'recentes') {
          filteredPosts.sort((a, b) => {
            try {
              const dateA = new Date(a.createdAt || a.created_at || 0);
              const dateB = new Date(b.createdAt || b.created_at || 0);
              return dateB - dateA;
            } catch {
              return 0; // Em caso de erro, manter a ordem original
            }
          });
        } else if (orderBy === 'curtidos') {
          filteredPosts.sort((a, b) => {
            try {
              // Lidar com diferentes formatos de contagem de curtidas
              const likesA = typeof a.like_count === 'number' ? a.like_count : 
                           (typeof a.likes === 'number' ? a.likes : 
                           (a.likes?.length || a.likes?.count || 0));
                           
              const likesB = typeof b.like_count === 'number' ? b.like_count : 
                           (typeof b.likes === 'number' ? b.likes : 
                           (b.likes?.length || b.likes?.count || 0));
                           
              return likesB - likesA;
            } catch {
              return 0; // Em caso de erro, manter a ordem original
            }
          });
        } else if (orderBy === 'comentados') {
          filteredPosts.sort((a, b) => {
            try {
              // Lidar com diferentes formatos de contagem de comentários
              const commentsA = typeof a.comment_count === 'number' ? a.comment_count : 
                              (typeof a.comments === 'number' ? a.comments : 
                              (a.comments?.length || a.comments?.count || 0));
                              
              const commentsB = typeof b.comment_count === 'number' ? b.comment_count : 
                              (typeof b.comments === 'number' ? b.comments : 
                              (b.comments?.length || b.comments?.count || 0));
                              
              return commentsB - commentsA;
            } catch {
              return 0; // Em caso de erro, manter a ordem original
            }
          });
        }
      } catch (e) {
        console.warn('Erro na ordenação de posts:', e);
      }
      
      // Aplicar limite se especificado
      if (limit > 0 && filteredPosts.length > limit) {
        filteredPosts = filteredPosts.slice(0, limit);
      }
      
      return filteredPosts;
    } catch (error) {
      console.error('Erro ao filtrar posts:', error);
      return []; // Retornar array vazio em caso de erro para evitar quebrar a interface
    }
  }, [posts]);
  
  // Verificar se o usuário curtiu um post
  const hasLiked = useCallback(async (postId) => {
    if (!user || !postId) return false;
    
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error('Erro ao verificar curtida:', err);
      return false;
    }
  }, [user]);
  
  // Criar um novo post
  const createPost = useCallback(async (postData) => {
    if (!user) throw new Error('Você precisa estar logado para criar um post');
    
    setLoading(true);
    setError(null);
    
    try {
      // Extrair categories do postData e remover antes de inserir na tabela posts
      const { categories, ...postDataWithoutCategories } = postData;
      
      // Inserir o post na tabela posts
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          ...postDataWithoutCategories,
          author_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Se houver categorias, inserir na tabela post_categories
      if (categories && Array.isArray(categories) && categories.length > 0) {
        const categoriesData = categories.map(category => ({
          post_id: data.id,
          category: category
        }));
        
        const { error: categoriesError } = await supabase
          .from('post_categories')
          .insert(categoriesData);
          
        if (categoriesError) {
          console.error('Erro ao inserir categorias:', categoriesError);
          // Não falha o processo principal, apenas log do erro
        }
      }
      
      // Atualizar o cache local
      setPosts(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Atualizar um post existente
  const updatePost = useCallback(async (postId, postData) => {
    if (!user) throw new Error('Você precisa estar logado para editar um post');
    
    setLoading(true);
    setError(null);
    
    try {
      // Verificar se o usuário é o autor do post
      const { data: postToUpdate } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();
      
      if (!postToUpdate) throw new Error('Post não encontrado');
      if (postToUpdate.author_id !== user.id && user.role !== 'admin') {
        throw new Error('Você não tem permissão para editar este post');
      }
      
      // Atualizar o post
      const { data, error: updateError } = await supabase
        .from('posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Atualizar o cache local
      setPosts(prev => prev.map(post => post.id === postId ? data : post));
      if (currentPost?.id === postId) {
        setCurrentPost(data);
      }
      
      return data;
    } catch (err) {
      console.error('Erro ao atualizar post:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentPost]);
  
  return {
    // Estado
    posts,
    currentPost,
    loading,
    error,
    
    // Métodos com nomes legados para manter compatibilidade
    fetchPosts: loadAllPosts,
    fetchPost: loadPost,
    hasLikedPost: hasLiked,
    getPosts: loadAllPosts, // Alias adicionado para compatibilidade com componentes existentes
    
    // Métodos principais
    loadAllPosts,
    loadPost,
    createPost,
    updatePost,
    
    // Métodos auxiliares
    getPostById,
    toggleLikePost,
    filterPosts,
    hasLiked
  };
};