/**
 * Serviço de API aprimorado para o Expeeria
 * Implementa comunicação com backend e gerenciamento de estado
 */

import axios from 'axios';

// Criando uma instância configurada do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Tratamento de token expirado (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('Refresh token não encontrado');
        
        // Tentar renovar o token com o refresh token
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
          refreshToken,
        });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
          
          // Reenviar a requisição original com o novo token
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se a renovação do token falhar, redirecionar para login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }
    
    // Tratamento de erros de servidor (5xx)
    if (error.response?.status >= 500) {
      console.error('Erro no servidor:', error.response?.data);
      // Aqui poderia integrar com uma ferramenta de monitoramento como Sentry
    }
    
    return Promise.reject(error);
  }
);

// Serviços de usuários
const userService = {
  // Autenticação
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  // Perfil e gerenciamento de usuários
  getCurrentUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  updateUserProfile: async (userId, profileData) => {
    const response = await api.put(`/users/${userId}`, profileData);
    
    // Atualizar o usuário no localStorage se for o usuário atual
    const currentUser = userService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...response.data
      }));
    }
    
    return response.data;
  },
  
  // Interações sociais
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },
  
  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },
  
  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },
  
  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },
};

// Serviços de posts
const postService = {
  // CRUD de posts
  getAllPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },
  
  getPostById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },
  
  getUserPosts: async (userId) => {
    const response = await api.get(`/users/${userId}/posts`);
    return response.data;
  },
  
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },
  
  updatePost: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },
  
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
  
  // Interações com posts
  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },
  
  unlikePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  },
  
  // Feed e descoberta
  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get('/feed', { 
      params: { page, limit } 
    });
    return response.data;
  },
  
  getExplore: async (filters = {}) => {
    const response = await api.get('/explore', { 
      params: filters 
    });
    return response.data;
  },
  
  // Categorias
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  // Pesquisa
  searchPosts: async (query) => {
    const response = await api.get('/search', { 
      params: { q: query } 
    });
    return response.data;
  },
};

// Serviços de comentários
const commentService = {
  getPostComments: async (postId) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },
  
  addComment: async (postId, commentData) => {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  },
  
  updateComment: async (commentId, commentData) => {
    const response = await api.put(`/comments/${commentId}`, commentData);
    return response.data;
  },
  
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
  
  likeComment: async (commentId) => {
    const response = await api.post(`/comments/${commentId}/like`);
    return response.data;
  },
  
  unlikeComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}/like`);
    return response.data;
  },
};

// Serviço de upload de imagens
const uploadService = {
  uploadImage: async (file, preset = 'expeeria_cloud') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'deepc0do7');
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'deepc0do7'}/image/upload`,
        formData
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  },
  
  // eslint-disable-next-line no-unused-vars
  deleteImage: async (publicId) => {
    // Implementar quando necessário - requer autenticação com API key e secret
    console.warn('Função deleteImage ainda não implementada');
  },
};

export { 
  api, 
  userService, 
  postService, 
  commentService, 
  uploadService 
};