/**
 * Modelo de Usuário para o Expeeria
 * Este arquivo define a estrutura da entidade Usuário para uso com MongoDB, PostgreSQL ou Firebase
 */

/**
 * @typedef {Object} User
 * @property {string} id - Identificador único do usuário (UUID)
 * @property {string} email - Email do usuário (único)
 * @property {string} password - Senha hash do usuário
 * @property {string} name - Nome completo do usuário
 * @property {string} username - Nome de usuário único (imutável)
 * @property {string} bio - Biografia ou descrição do usuário
 * @property {string} avatar - URL da imagem de perfil
 * @property {string[]} interests - Lista de interesses/categorias
 * @property {Date} createdAt - Data de criação da conta
 * @property {Date} updatedAt - Data da última atualização do perfil
 * @property {('user'|'admin'|'mod')} role - Nível de permissão
 * @property {('active'|'inactive'|'banned')} status - Status da conta
 * @property {string[]} followers - Lista de IDs dos seguidores
 * @property {string[]} following - Lista de IDs de quem o usuário segue
 * @property {Object} metadata - Informações adicionais flexíveis
 * @property {Date} metadata.lastLogin - Data do último login
 * @property {number} metadata.loginCount - Contador de logins
 * @property {Object} metadata.preferences - Preferências do usuário
 */

/**
 * Esquema do Usuário para MongoDB (usando Mongoose)
 */
const userSchema = {
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  interests: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'admin', 'mod'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  followers: [{ type: String }],
  following: [{ type: String }],
  metadata: {
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    preferences: { type: Object, default: {} }
  }
};

/**
 * Definição da tabela para SQL (PostgreSQL/MySQL)
 * 
 * CREATE TABLE users (
 *   id UUID PRIMARY KEY,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   password VARCHAR(255) NOT NULL,
 *   name VARCHAR(255) NOT NULL,
 *   username VARCHAR(50) UNIQUE NOT NULL,
 *   bio TEXT,
 *   avatar VARCHAR(255),
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   role VARCHAR(10) DEFAULT 'user',
 *   status VARCHAR(10) DEFAULT 'active',
 *   metadata JSONB
 * );
 * 
 * -- Tabelas relacionadas para interests, followers e following
 * CREATE TABLE user_interests (
 *   user_id UUID REFERENCES users(id),
 *   interest VARCHAR(100),
 *   PRIMARY KEY (user_id, interest)
 * );
 * 
 * CREATE TABLE user_followers (
 *   user_id UUID REFERENCES users(id),
 *   follower_id UUID REFERENCES users(id),
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   PRIMARY KEY (user_id, follower_id)
 * );
 */

/**
 * Definição para Firebase Firestore
 * Em Firestore, armazenaríamos isso na collection 'users'
 */
const firestoreUserExample = {
  id: 'uuid-string',
  email: 'user@example.com',
  password: 'hashed_password',
  name: 'Nome Completo',
  username: 'username_unico',
  bio: 'Biografia do usuário',
  avatar: 'https://exemplo.com/avatar.jpg',
  interests: ['Tecnologia', 'Educação'],
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'user',
  status: 'active',
  followers: ['id-usuario-1', 'id-usuario-2'],
  following: ['id-usuario-3', 'id-usuario-4'],
  metadata: {
    lastLogin: new Date(),
    loginCount: 12,
    preferences: {
      notifications: true,
      theme: 'dark'
    }
  }
};

/**
 * Função para converter o modelo atual para o novo formato
 * Útil durante a migração
 */
function convertLegacyUserToNewModel(legacyUser) {
  return {
    id: legacyUser.id,
    email: legacyUser.email,
    password: legacyUser.password, // Idealmente seria rehashed
    name: legacyUser.name,
    username: legacyUser.username,
    bio: legacyUser.bio || '',
    avatar: legacyUser.avatar || '',
    interests: legacyUser.interests || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    role: legacyUser.role || 'user',
    status: 'active',
    followers: legacyUser.followers || [],
    following: legacyUser.following || [],
    metadata: {
      lastLogin: new Date(),
      loginCount: 1,
      preferences: {}
    }
  };
}

export { userSchema, convertLegacyUserToNewModel };