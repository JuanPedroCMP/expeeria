/**
 * Modelo de Comentário para o Expeeria
 * Este arquivo define a estrutura da entidade Comentário para uso com MongoDB, PostgreSQL ou Firebase
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - Identificador único do comentário (UUID)
 * @property {string} postId - ID do post relacionado
 * @property {string} userId - ID do usuário que criou o comentário
 * @property {string} content - Conteúdo do comentário
 * @property {Date} createdAt - Data de criação
 * @property {Date} updatedAt - Data da última atualização
 * @property {('active'|'deleted'|'flagged')} status - Status do comentário
 * @property {string[]} likes - IDs dos usuários que curtiram o comentário
 * @property {string} parentId - ID do comentário pai (para respostas aninhadas)
 */

/**
 * Esquema do Comentário para MongoDB (usando Mongoose)
 */
const commentSchema = {
  id: { type: String, required: true, unique: true },
  postId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['active', 'deleted', 'flagged'], 
    default: 'active' 
  },
  likes: [{ type: String }],
  parentId: { type: String, default: null, index: true }
};

/**
 * Definição da tabela para SQL (PostgreSQL/MySQL)
 * 
 * CREATE TABLE comments (
 *   id UUID PRIMARY KEY,
 *   post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
 *   user_id UUID NOT NULL REFERENCES users(id),
 *   content TEXT NOT NULL,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   status VARCHAR(20) DEFAULT 'active',
 *   parent_id UUID REFERENCES comments(id) ON DELETE SET NULL
 * );
 * 
 * CREATE INDEX idx_comments_post ON comments(post_id);
 * CREATE INDEX idx_comments_user ON comments(user_id);
 * CREATE INDEX idx_comments_parent ON comments(parent_id);
 * 
 * CREATE TABLE comment_likes (
 *   comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   PRIMARY KEY (comment_id, user_id)
 * );
 */

/**
 * Definição para Firebase Firestore
 * Em Firestore, armazenaríamos isso na collection 'comments'
 */
const firestoreCommentExample = {
  id: 'uuid-string',
  postId: 'post-uuid-123',
  userId: 'user-uuid-456',
  content: 'Este é um excelente post, obrigado por compartilhar!',
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'active',
  likes: ['user-id-1', 'user-id-2'],
  parentId: null // ou ID de outro comentário se for uma resposta
};

/**
 * Função para converter o modelo atual para o novo formato
 * Útil durante a migração
 */
function convertLegacyCommentToNewModel(legacyComment, postId) {
  return {
    id: legacyComment.id,
    postId: postId,
    userId: '', // Precisaria determinar o ID do usuário baseado no nome/email
    content: legacyComment.text,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
    likes: [],
    parentId: null
  };
}

/**
 * Modelo para representação e validação de Comentários no Expeeria
 */

/**
 * Cria um novo objeto de Comentário com valores padrão
 * @param {Object} data - Dados iniciais do comentário (opcional)
 * @returns {Object} Objeto do comentário com todos os campos necessários
 */
export function createComment(data = {}) {
  return {
    id: data.id || null,
    content: data.content || '',
    postId: data.postId || null,
    authorId: data.authorId || null,
    author: data.author || null, // Objeto com informações básicas do autor
    parentId: data.parentId || null, // Para respostas a outros comentários
    likes: data.likes || [],
    likeCount: data.likeCount || 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    status: data.status || 'active', // active, deleted, flagged
    isEdited: data.isEdited || false,
    ...data  // Permite campos adicionais
  };
}

/**
 * Verifica se um comentário é válido
 * @param {Object} comment - Objeto do comentário a ser validado
 * @returns {Object} Objeto com resultado da validação { isValid, errors }
 */
export function validateComment(comment) {
  const errors = {};
  
  // Validação do conteúdo
  if (!comment.content || comment.content.trim() === '') {
    errors.content = 'O conteúdo do comentário é obrigatório';
  } else if (comment.content.length < 2) {
    errors.content = 'O comentário deve ter pelo menos 2 caracteres';
  } else if (comment.content.length > 1000) {
    errors.content = 'O comentário deve ter no máximo 1000 caracteres';
  }
  
  // Validação do post
  if (!comment.postId) {
    errors.postId = 'O ID do post é obrigatório';
  }
  
  // Validação do autor
  if (!comment.authorId) {
    errors.authorId = 'O ID do autor é obrigatório';
  }
  
  // Validação de status
  const validStatuses = ['active', 'deleted', 'flagged'];
  if (comment.status && !validStatuses.includes(comment.status)) {
    errors.status = 'Status inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Formata um comentário para exibição
 * @param {Object} comment - Objeto do comentário a ser formatado
 * @param {Object} currentUser - Usuário atual para personalização (opcional)
 * @returns {Object} Comentário formatado para exibição
 */
export function formatCommentForDisplay(comment, currentUser = null) {
  const isAuthor = currentUser && currentUser.id === comment.authorId;
  const isLiked = currentUser && comment.likes.includes(currentUser.id);
  
  return {
    ...comment,
    // Formatar datas para exibição amigável
    createdAt: comment.createdAt ? formatDate(comment.createdAt) : '',
    updatedAt: comment.updatedAt ? formatDate(comment.updatedAt) : '',
    // Adicionar campos calculados
    isAuthor,
    isLiked,
    canEdit: isAuthor && comment.status === 'active',
    canDelete: isAuthor && comment.status === 'active',
    // Tratar conteúdo de comentários deletados
    displayContent: comment.status === 'deleted' 
      ? 'Este comentário foi excluído' 
      : comment.content
  };
}

/**
 * Formata uma data de forma amigável
 * @param {string} dateString - String ISO de data
 * @returns {string} Data formatada
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);
  
  // Exibição relativa para datas recentes
  if (diffSec < 60) {
    return 'agora mesmo';
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'} atrás`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'} atrás`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} atrás`;
  }
  
  // Para datas mais antigas, usar formato completo
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Organiza comentários em uma estrutura hierárquica (thread)
 * @param {Array} comments - Lista de comentários
 * @returns {Array} Lista hierárquica com comentários e suas respostas
 */
export function organizeCommentsInThreads(comments) {
  const commentMap = {};
  const rootComments = [];
  
  // Primeiro passo: mapear todos os comentários por ID
  comments.forEach(comment => {
    // Criar uma cópia para não modificar o original
    const commentCopy = { ...comment, replies: [] };
    commentMap[comment.id] = commentCopy;
  });
  
  // Segundo passo: montar a estrutura hierárquica
  comments.forEach(comment => {
    const commentWithReplies = commentMap[comment.id];
    
    if (comment.parentId) {
      // Este é um comentário de resposta, adicionar ao pai
      const parentComment = commentMap[comment.parentId];
      if (parentComment) {
        parentComment.replies.push(commentWithReplies);
      } else {
        // O pai não existe, tratar como comentário raiz
        rootComments.push(commentWithReplies);
      }
    } else {
      // Comentário raiz
      rootComments.push(commentWithReplies);
    }
  });
  
  // Ordenar comentários raiz e respostas por data
  const sortByDate = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
  
  rootComments.sort(sortByDate);
  rootComments.forEach(comment => {
    comment.replies.sort(sortByDate);
  });
  
  return rootComments;
}

export { commentSchema, convertLegacyCommentToNewModel };