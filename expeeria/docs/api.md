# Documentação da API Supabase do Expeeria

Este documento descreve a estrutura da API, tabelas do banco de dados e operações disponíveis no Expeeria, que utiliza o Supabase como backend.

## Esquema do Banco de Dados

### Tabelas Principais

#### `auth.users`
Tabela gerenciada pelo Supabase Auth para autenticação de usuários.

| Coluna | Tipo | Descrição |
|--------|------|------------|
| id | UUID | Identificador único do usuário (PK) |
| email | TEXT | Email do usuário |
| ... | ... | Outras colunas gerenciadas pelo Supabase Auth |

#### `public.profiles`
Armazena informações adicionais sobre os usuários.

| Coluna | Tipo | Descrição |
|--------|------|------------|
| id | UUID | Referência ao id do usuário em auth.users (PK) |
| username | TEXT | Nome de usuário único |
| name | TEXT | Nome de exibição |
| avatar | TEXT | URL da imagem de avatar |
| bio | TEXT | Biografia/descrição do usuário |
| created_at | TIMESTAMP | Data de criação do perfil |

#### `public.posts`
Armazena as publicações dos usuários.

| Coluna | Tipo | Descrição |
|--------|------|------------|
| id | UUID | Identificador único do post (PK) |
| title | TEXT | Título do post |
| caption | TEXT | Descrição breve/subtítulo |
| content | TEXT | Conteúdo principal no formato markdown |
| image_url | TEXT | URL da imagem de capa |
| author_id | UUID | ID do autor (FK para auth.users.id) |
| status | TEXT | Status do post (draft, published) |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data da última atualização |

#### `public.comments`
Comentários em posts.

| Coluna | Tipo | Descrição |
|--------|------|------------|
| id | UUID | Identificador único do comentário (PK) |
| content | TEXT | Conteúdo do comentário |
| author_id | UUID | ID do autor (FK para auth.users.id) |
| post_id | UUID | ID do post (FK para posts.id) |
| created_at | TIMESTAMP | Data de criação |

#### `public.post_likes`
Registra curtidas em posts.

| Coluna | Tipo | Descrição |
|--------|------|------------|
| id | UUID | Identificador único (PK) |
| post_id | UUID | ID do post (FK para posts.id) |
| user_id | UUID | ID do usuário (FK para auth.users.id) |
| created_at | TIMESTAMP | Data da curtida |

#### `public.post_categories`
Associação entre posts e categorias.

| Coluna | Tipo | Descrição |
|--------|------|------------|
| id | UUID | Identificador único (PK) |
| post_id | UUID | ID do post (FK para posts.id) |
| category | TEXT | Nome da categoria |
| created_at | TIMESTAMP | Data de criação |

## Endpoints e Operações

### Autenticação

#### Registro de Usuário

```javascript
// authService.js
async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
  
  // Criar perfil para o usuário
  if (data?.user) {
    await createProfile(data.user.id, email, name);
  }
  
  return { data, error };
}
```

#### Login de Usuário

```javascript
// authService.js
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}
```

### Gerenciamento de Perfil

#### Obter Perfil de Usuário

```javascript
// userService.js
async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  return { data, error };
}
```

#### Atualizar Perfil

```javascript
// userService.js
async function updateUserProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId);
    
  return { data, error };
}
```

### Posts

#### Listar Posts

```javascript
// postService.js
async function getPosts(options = {}) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles!author_id (id, username, name, avatar),
      post_likes!post_id (count),
      post_categories!post_id (category)
    `)
    .eq('status', 'published');
    
  // Aplicar filtros opcionais
  if (options.category) {
    query = query.like('post_categories.category', `%${options.category}%`);
  }
  
  // Ordenação
  if (options.orderBy === 'popular') {
    query = query.order('post_likes.count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query;
  return { data, error };
}
```

#### Obter Post Específico

```javascript
// postService.js
async function getPostById(postId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!author_id (id, username, name, avatar),
      post_likes!post_id (count),
      post_categories!post_id (category)
    `)
    .eq('id', postId)
    .single();
    
  return { data, error };
}
```

#### Criar Post

```javascript
// postService.js
async function createPost(postData) {
  // Inserir post básico
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      title: postData.title,
      caption: postData.caption,
      content: postData.content,
      image_url: postData.imageUrl,
      author_id: postData.authorId,
      status: 'published'
    })
    .select()
    .single();
    
  if (postError) return { error: postError };
  
  // Adicionar categorias
  if (postData.categories && postData.categories.length > 0) {
    const categoryEntries = postData.categories.map(category => ({
      post_id: post.id,
      category
    }));
    
    const { error: categoryError } = await supabase
      .from('post_categories')
      .insert(categoryEntries);
      
    if (categoryError) return { error: categoryError, post };
  }
  
  return { data: post };
}
```

### Comentários

#### Listar Comentários de um Post

```javascript
// commentService.js
async function getCommentsByPostId(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles!author_id (id, username, name, avatar)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
    
  return { data, error };
}
```

#### Adicionar Comentário

```javascript
// commentService.js
async function addComment(postId, authorId, content) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: authorId,
      content
    })
    .select();
    
  return { data, error };
}
```

### Likes

#### Dar/Remover Like em Post

```javascript
// likeService.js
async function toggleLike(postId, userId) {
  // Verificar se já existe like
  const { data: existingLike } = await supabase
    .from('post_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (existingLike) {
    // Remover like existente
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
      
    return { removed: true, error };
  } else {
    // Adicionar novo like
    const { data, error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId
      });
      
    return { added: true, error };
  }
}
```

## Políticas de Segurança (RLS)

O Expeeria implementa políticas de segurança em nível de linha (Row Level Security) para proteger os dados no Supabase. Abaixo estão as principais políticas implementadas:

### Perfis

```sql
-- Perfis visíveis por todos
CREATE POLICY "Perfis visíveis por todos" ON public.profiles
    FOR SELECT USING (true);

-- Usuários podem editar seus próprios perfis
CREATE POLICY "Usuários podem editar seus próprios perfis" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
```

### Posts

```sql
-- Posts publicados visíveis por todos
CREATE POLICY "Posts publicados visíveis por todos" ON public.posts
    FOR SELECT USING (status = 'published');

-- Usuários podem criar posts
CREATE POLICY "Usuários podem criar posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Usuários podem editar seus próprios posts
CREATE POLICY "Usuários podem editar seus próprios posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);
```

### Comentários

```sql
-- Comentários visíveis por todos
CREATE POLICY "Comentários visíveis por todos" ON public.comments
    FOR SELECT USING (true);

-- Usuários podem criar comentários
CREATE POLICY "Usuários podem criar comentários" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Usuários podem editar/excluir seus próprios comentários
CREATE POLICY "Usuários podem editar seus próprios comentários" ON public.comments
    FOR DELETE USING (auth.uid() = author_id);
```
