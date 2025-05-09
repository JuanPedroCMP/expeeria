# Guia de Instalação do Expeeria

Este guia irá ajudá-lo a configurar o ambiente de desenvolvimento do Expeeria em sua máquina local.

## Pré-requisitos

- Node.js (versão 16.x ou superior)
- npm (versão 8.x ou superior) ou yarn
- Conta no Supabase (para configuração do backend)

## Passo 1: Clonar o Repositório

```bash
git clone https://github.com/JuanPedroCMP/expeeria.git
cd expeeria
```

## Passo 2: Instalar Dependências

Usando npm:

```bash
npm install
```

Ou usando yarn:

```bash
yarn install
```

## Passo 3: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

> **Nota**: Você pode obter estas informações no Dashboard do Supabase, na seção "Project Settings" > "API".

## Passo 4: Configurar o Banco de Dados Supabase

### Tabelas Necessárias

Execute os seguintes comandos SQL no Editor SQL do Supabase para criar as tabelas necessárias:

```sql
-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    name TEXT,
    avatar TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de posts
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    caption TEXT,
    content TEXT,
    image_url TEXT,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de comentu00e1rios
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    post_id UUID REFERENCES public.posts(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de likes em posts
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Tabela de categorias de posts
CREATE TABLE IF NOT EXISTS public.post_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Polu00edticas de Seguranu00e7a (RLS)

Configure as polu00edticas de seguranu00e7a de nu00edvel de linha (RLS) para proteger seus dados:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- Adicionar polu00edticas para perfis
CREATE POLICY "Perfis visu00edveis por todos" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Usuu00e1rios podem editar seus pru00f3prios perfis" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Adicionar polu00edticas para posts
CREATE POLICY "Posts publicados visu00edveis por todos" ON public.posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Usuu00e1rios podem criar posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Usuu00e1rios podem editar seus pru00f3prios posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);
```

## Passo 5: Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Ou usando yarn:

```bash
yarn dev
```

A aplicau00e7u00e3o estaru00e1 disponu00edvel em `http://localhost:5173`.

## Soluu00e7u00e3o de Problemas Comuns

### Problema com Autenticau00e7u00e3o

Se vocu00ea encontrar problemas de autenticau00e7u00e3o:

1. Verifique se as variu00e1veis de ambiente estu00e3o configuradas corretamente
2. No Supabase, em "Authentication" > "Settings", certifique-se de que o "Site URL" estu00e1 configurado para `http://localhost:5173`
3. Verifique se o Email Auth estu00e1 habilitado em "Authentication" > "Providers"

### Problemas com Atualizau00e7u00f5es em Posts

Se as atualizau00e7u00f5es em posts nu00e3o estiverem funcionando, verifique as polu00edticas RLS do banco de dados e certifique-se de que o usuu00e1rio tem permissu00e3o para editar os posts que estu00e3o sendo atualizados.

## Deploy

Para implantar o Expeeria em produu00e7u00e3o, recomendamos usar a Vercel, que possui integrau00e7u00e3o perfeita com projetos React + Vite.

1. Configure seu projeto na Vercel
2. Adicione as variu00e1veis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
3. Implante seu projeto

Consulte [docs/troubleshooting.md](./troubleshooting.md) para soluu00e7u00f5es especu00edficas para problemas comuns.
