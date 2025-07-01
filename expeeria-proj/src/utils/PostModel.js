/**
 * Modelo de Post para o Expeeria
 * Este arquivo define a estrutura da entidade Post para uso com MongoDB, PostgreSQL ou Firebase
 */

/**
 * @typedef {Object} Post
 * @property {string} id - Identificador único do post (UUID)
 * @property {string} title - Título do post
 * @property {string} caption - Breve descrição ou resumo do post
 * @property {string} content - Conteúdo completo do post (Markdown)
 * @property {string} imageUrl - URL da imagem/banner do post
 * @property {string} authorId - ID do autor (referência ao usuário)
 * @property {string[]} categories - Categorias do post (antigo 'area')
 * @property {('published'|'draft'|'archived')} status - Status de publicação
 * @property {Date} createdAt - Data de criação
 * @property {Date} updatedAt - Data da última atualização
 * @property {Date} publishedAt - Data de publicação
 * @property {number} likeCount - Contador de likes
 * @property {number} commentCount - Contador de comentários
 * @property {number} viewCount - Contador de visualizações
 * @property {string[]} likes - IDs dos usuários que curtiram
 * @property {string[]} tags - Tags para melhorar a busca
 * @property {Object} metadata - Informações adicionais
 * @property {number} metadata.readTime - Tempo estimado de leitura em minutos
 * @property {Object} metadata.location - Dados de localização (se aplicável)
 */

/**
 * Esquema do Post para MongoDB (usando Mongoose)
 */
const postSchema = {
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  caption: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  authorId: { type: String, required: true, index: true },
  categories: [{ type: String }],
  status: { 
    type: String, 
    enum: ['published', 'draft', 'archived'], 
    default: 'published',
    index: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  likes: [{ type: String }],
  tags: [{ type: String }],
  metadata: {
    readTime: { type: Number },
    location: {
      country: { type: String },
      city: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
      }
    }
  }
};

/**
 * Definição da tabela para SQL (PostgreSQL/MySQL)
 * 
 * CREATE TABLE posts (
 *   id UUID PRIMARY KEY,
 *   title VARCHAR(255) NOT NULL,
 *   caption VARCHAR(255) NOT NULL,
 *   content TEXT NOT NULL,
 *   image_url VARCHAR(255),
 *   author_id UUID NOT NULL REFERENCES users(id),
 *   status VARCHAR(20) DEFAULT 'published',
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   published_at TIMESTAMP,
 *   like_count INTEGER DEFAULT 0,
 *   comment_count INTEGER DEFAULT 0,
 *   view_count INTEGER DEFAULT 0,
 *   metadata JSONB
 * );
 * 
 * CREATE INDEX idx_posts_author ON posts(author_id);
 * CREATE INDEX idx_posts_status ON posts(status);
 * CREATE INDEX idx_posts_created_at ON posts(created_at);
 * 
 * -- Tabelas relacionadas
 * CREATE TABLE post_categories (
 *   post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
 *   category VARCHAR(100),
 *   PRIMARY KEY (post_id, category)
 * );
 * 
 * CREATE TABLE post_tags (
 *   post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
 *   tag VARCHAR(50),
 *   PRIMARY KEY (post_id, tag)
 * );
 * 
 * CREATE TABLE post_likes (
 *   post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   PRIMARY KEY (post_id, user_id)
 * );
 */

/**
 * Definição para Firebase Firestore
 * Em Firestore, armazenaríamos isso na collection 'posts'
 */
const firestorePostExample = {
  id: 'uuid-string',
  title: 'Título do Post',
  caption: 'Resumo breve do post',
  content: '# Conteúdo em Markdown\n\nTexto completo do post...',
  imageUrl: 'https://exemplo.com/imagem.jpg',
  authorId: 'user-uuid-123',
  categories: ['Tecnologia', 'Educação'],
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date(),
  likeCount: 42,
  commentCount: 7,
  viewCount: 153,
  likes: ['user-id-1', 'user-id-2'],
  tags: ['programação', 'javascript', 'tutorial'],
  metadata: {
    readTime: 5,
    location: {
      country: 'Brasil',
      city: 'São Paulo'
    }
  }
};

/**
 * Função para converter o modelo atual para o novo formato
 * Útil durante a migração
 */
function convertLegacyPostToNewModel(legacyPost) {
  return {
    id: legacyPost.id,
    title: legacyPost.title,
    caption: legacyPost.caption || '',
    content: legacyPost.content,
    imageUrl: legacyPost.imageUrl || '',
    authorId: legacyPost.userId || legacyPost.author, // Adapta dependendo do campo usado
    categories: legacyPost.categories || legacyPost.area || [],
    status: 'published',
    createdAt: legacyPost.createdAt ? new Date(legacyPost.createdAt) : new Date(),
    updatedAt: new Date(),
    publishedAt: legacyPost.createdAt ? new Date(legacyPost.createdAt) : new Date(),
    likeCount: legacyPost.likes || 0,
    commentCount: (legacyPost.comments && legacyPost.comments.length) || 0,
    viewCount: 0,
    likes: [], // Precisaria converter de contador para array de IDs
    tags: [], // Extrair tags do conteúdo ou título
    metadata: {
      readTime: Math.ceil(legacyPost.content.length / 1000), // Estimativa básica
    }
  };
}

/**
 * Modelo para representação e validação de Posts no Expeeria
 */

/**
 * Cria um novo objeto de Post com valores padrão
 * @param {Object} data - Dados iniciais do post (opcional)
 * @returns {Object} Objeto do post com todos os campos necessários
 */
export function createPost(data = {}) {
  return {
    id: data.id || null,
    title: data.title || '',
    content: data.content || '',
    imageUrl: data.imageUrl || '',
    authorId: data.authorId || null,
    author: data.author || null,
    categories: data.categories || [],
    tags: data.tags || [],
    likes: data.likes || [],
    likeCount: data.likeCount || 0,
    commentCount: data.commentCount || 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    status: data.status || 'published',
    metadata: data.metadata || {},
    ...data  // Permite campos adicionais que não estão explicitamente listados
  };
}

/**
 * Verifica se um post é válido
 * @param {Object} post - Objeto do post a ser validado
 * @returns {Object} Objeto com resultado da validação { isValid, errors }
 */
export function validatePost(post) {
  const errors = {};
  
  // Validação do título
  if (!post.title || post.title.trim() === '') {
    errors.title = 'O título é obrigatório';
  } else if (post.title.length < 5) {
    errors.title = 'O título deve ter pelo menos 5 caracteres';
  } else if (post.title.length > 100) {
    errors.title = 'O título deve ter no máximo 100 caracteres';
  }
  
  // Validação do conteúdo
  if (!post.content || post.content.trim() === '') {
    errors.content = 'O conteúdo é obrigatório';
  } else if (post.content.length < 10) {
    errors.content = 'O conteúdo deve ter pelo menos 10 caracteres';
  }
  
  // Validação do autor
  if (!post.authorId) {
    errors.authorId = 'O autor é obrigatório';
  }
  
  // Validação de categorias
  if (post.categories && !Array.isArray(post.categories)) {
    errors.categories = 'As categorias devem ser uma lista';
  }
  
  // Validação de status
  const validStatuses = ['draft', 'published', 'archived'];
  if (post.status && !validStatuses.includes(post.status)) {
    errors.status = 'Status inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Formata um post para exibição
 * @param {Object} post - Objeto do post a ser formatado
 * @returns {Object} Post formatado para exibição
 */
export function formatPostForDisplay(post) {
  return {
    ...post,
    // Formatar datas para exibição amigável
    createdAt: post.createdAt ? new Date(post.createdAt).toLocaleString() : '',
    updatedAt: post.updatedAt ? new Date(post.updatedAt).toLocaleString() : '',
    // Adicionar campos calculados ou formatados
    isLiked: false, // Deve ser atualizado com base no usuário atual
    excerpt: post.content ? truncateText(post.content, 150) : '',
    readTime: calculateReadTime(post.content || '')
  };
}

/**
 * Trunca um texto para um determinado comprimento
 * @param {string} text - Texto a ser truncado
 * @param {number} length - Comprimento máximo
 * @returns {string} Texto truncado
 */
function truncateText(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Calcula o tempo estimado de leitura baseado no conteúdo
 * @param {string} content - Conteúdo do post
 * @returns {string} Tempo estimado de leitura formatado
 */
function calculateReadTime(content) {
  // Uma pessoa média lê cerca de 200-250 palavras por minuto
  const wordCount = content.split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 225));
  
  return readTimeMinutes === 1 
    ? '1 minuto de leitura' 
    : `${readTimeMinutes} minutos de leitura`;
}

/**
 * Categoriza um post com base em seu conteúdo
 * @param {Object} post - Post a ser categorizado
 * @returns {Array} Lista de categorias sugeridas
 */
export function categorizePost(post) {
  // Se já tiver categorias, retorná-las
  if (post.categories && post.categories.length > 0) {
    return post.categories;
  }
  
  // Lógica simples de categorização baseada em palavras-chave
  const content = (post.title + ' ' + post.content).toLowerCase();
  const categories = [];
  
  const categoryKeywords = {
    'Tecnologia': ['tecnologia', 'tech', 'programação', 'código', 'software', 'desenvolvimento', 'app', 'aplicativo'],
    'Arte': ['arte', 'design', 'desenho', 'pintura', 'criação', 'criativo', 'artístico'],
    'Música': ['música', 'áudio', 'som', 'instrumento', 'canção', 'banda', 'álbum'],
    'Ciência': ['ciência', 'científico', 'pesquisa', 'estudo', 'descoberta', 'experimento'],
    'Educação': ['educação', 'escola', 'ensino', 'aprendizado', 'estudar', 'conhecimento', 'aula'],
    'Esportes': ['esporte', 'atleta', 'jogo', 'competição', 'treino', 'exercício'],
    'Viagem': ['viagem', 'turismo', 'viajar', 'destino', 'aventura', 'explorar'],
    'Culinária': ['comida', 'culinária', 'receita', 'cozinha', 'gastronomia', 'prato'],
    'Saúde': ['saúde', 'bem-estar', 'fitness', 'medicina', 'nutrição', 'exercício'],
    'Outros': []
  };
  
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        categories.push(category);
        break;
      }
    }
  });
  
  // Se nenhuma categoria foi encontrada, adicionar "Outros"
  if (categories.length === 0) {
    categories.push('Outros');
  }
  
  return [...new Set(categories)]; // Remover duplicatas
}

export { postSchema, convertLegacyPostToNewModel };