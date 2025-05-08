-- Script para configurau00e7u00e3o completa do banco de dados Supabase para o Expeeria

-- Habilitar extensu00e3o UUID para gerau00e7u00e3o de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Esquema de seguranu00e7a para RLS (Row Level Security)
CREATE SCHEMA IF NOT EXISTS auth;

--------------------------------------------------
-- USUu00c1RIOS
--------------------------------------------------

-- Tabela principal de usuu00e1rios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Armazenaru00e1 referu00eancia ao auth.users
  name VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  avatar VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(10) DEFAULT 'user',
  status VARCHAR(10) DEFAULT 'active',
  metadata JSONB DEFAULT '{"loginCount": 0, "preferences": {}}'::jsonb
);

-- Tabela para interesses dos usuu00e1rios
CREATE TABLE user_interests (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interest VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, interest)
);

-- Tabela para relau00e7u00f5es de seguidores
CREATE TABLE user_followers (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, follower_id)
);

--------------------------------------------------
-- POSTS
--------------------------------------------------

-- Tabela principal de posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  caption VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  author_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{"readTime": 1}'::jsonb
);

-- u00cdndices para melhorar performance de consultas
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Tabela para categorias dos posts
CREATE TABLE post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  PRIMARY KEY (post_id, category)
);

-- Tabela para tags dos posts
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (post_id, tag)
);

-- Tabela para likes dos posts
CREATE TABLE post_likes (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id)
);

--------------------------------------------------
-- COMENTu00c1RIOS
--------------------------------------------------

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0
);

-- u00cdndices para consultas de comentu00e1rios
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Tabela para likes de comentu00e1rios
CREATE TABLE comment_likes (
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id)
);

--------------------------------------------------
-- NOTIFICAu00c7u00d5ES
--------------------------------------------------

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'follow', etc
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN DEFAULT FALSE,
  reference_id UUID, -- Referu00eancia genu00e9rica (post_id, comment_id, etc)
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

--------------------------------------------------
-- FUNu00c7u00d5ES E TRIGGERS
--------------------------------------------------

-- Funu00e7u00e3o para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at();

-- Funu00e7u00e3o para atualizar contadores de likes
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador de likes
CREATE TRIGGER trigger_update_post_like_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE PROCEDURE update_post_like_count();

-- Funu00e7u00e3o para atualizar contadores de comentu00e1rios
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador de comentu00e1rios
CREATE TRIGGER trigger_update_post_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE PROCEDURE update_post_comment_count();

--------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
--------------------------------------------------

-- Ativar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Polu00edticas para usuu00e1rios
CREATE POLICY "Usuu00e1rios podem visualizar perfis pu00fablicos"
  ON users FOR SELECT
  USING (status = 'active');

CREATE POLICY "Usuu00e1rios podem editar apenas seu pru00f3prio perfil"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Polu00edticas para posts
CREATE POLICY "Posts publicados su00e3o visu00edveis para todos"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Rascunhos su00e3o visu00edveis apenas para o autor"
  ON posts FOR SELECT
  USING (auth.uid() = author_id AND status = 'draft');

CREATE POLICY "Usuu00e1rios podem criar seus pru00f3prios posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Usuu00e1rios podem editar apenas seus pru00f3prios posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Usuu00e1rios podem excluir apenas seus pru00f3prios posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- Polu00edticas para likes
CREATE POLICY "Qualquer usuu00e1rio pode curtir um post publicado"
  ON post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM posts WHERE id = post_id AND status = 'published')
  );

CREATE POLICY "Usuu00e1rios podem remover seus pru00f3prios likes"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Polu00edticas para comentu00e1rios
CREATE POLICY "Comentu00e1rios su00e3o visu00edveis para todos em posts publicados"
  ON comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM posts WHERE id = post_id AND status = 'published')
  );

CREATE POLICY "Usuu00e1rios podem criar comentu00e1rios em posts publicados"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM posts WHERE id = post_id AND status = 'published')
  );

CREATE POLICY "Usuu00e1rios podem editar apenas seus pru00f3prios comentu00e1rios"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuu00e1rios podem excluir apenas seus pru00f3prios comentu00e1rios"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Polu00edticas para notificau00e7u00f5es
CREATE POLICY "Usuu00e1rios podem ver apenas suas pru00f3prias notificau00e7u00f5es"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Apenas o sistema pode criar notificau00e7u00f5es"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Usuu00e1rios podem marcar suas notificau00e7u00f5es como lidas"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
