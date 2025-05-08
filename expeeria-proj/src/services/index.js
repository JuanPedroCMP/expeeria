import { api, userService, postService as apiPostService, commentService as apiCommentService, uploadService } from './api';
import { default as supabase } from './supabase';
import { authService } from './authService';
import { postService } from './postService';
import { commentService } from './commentService';

// Exportar serviços unificados
export {
  api,
  supabase,
  authService,
  postService,
  commentService,
  userService,
  uploadService
};

// Também exportar serviços baseados em API REST para componentes legados, com nomes distintos
export {
  apiPostService,
  apiCommentService
};