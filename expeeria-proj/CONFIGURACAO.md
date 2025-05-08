# Instruções para Configuração do Projeto Expeeria

## Pré-requisitos

- Node.js (versão 16.x ou superior)
- NPM ou Yarn
- Conta no Supabase (https://supabase.com)
- Conta no Cloudinary (opcional, para uploads de imagens)

## Passos para Iniciar o Projeto

### 1. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```
# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key

# Configurações do Cloudinary (opcional)
VITE_CLOUDINARY_CLOUD_NAME=seu-cloud-name
VITE_CLOUDINARY_API_KEY=sua-api-key
VITE_CLOUDINARY_API_SECRET=seu-api-secret
```

> **IMPORTANTE**: Nunca compartilhe ou cometa esse arquivo no repositório.

### 2. Instale as Dependências

```bash
npm install
# ou se preferir yarn
yarn
```

### 3. Inicie o Projeto em Desenvolvimento

```bash
npm run dev
# ou se preferir yarn
yarn dev
```

### 4. Acesse o Projeto

O projeto estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

## Estrutura do Projeto

- `/src/components`: Componentes reutilizáveis da UI
- `/src/contexts`: Contextos React para gerenciamento de estado
- `/src/hooks`: Hooks personalizados para lógica de negócio
- `/src/pages`: Páginas da aplicação
- `/src/services`: Serviços de comunicação com APIs externas
- `/src/utils`: Utilitários e funções auxiliares

## Principais Funcionalidades

- **Autenticação**: Login/cadastro via Supabase Auth
- **Posts**: Criação, edição, listagem e exclusão de posts
- **Comentários**: Sistema completo de comentários nos posts
- **Upload de Imagens**: Integração com Cloudinary para armazenamento de imagens
- **Feed Personalizado**: Carregamento de posts dos usuários seguidos
- **Exploração**: Descoberta de conteúdo categorizado

## Banco de Dados Supabase

O projeto utiliza Supabase como backend. Certifique-se de configurar as seguintes tabelas:

- `profiles`: Informações dos usuários
- `posts`: Posts dos usuários
- `comments`: Comentários nos posts
- `follows`: Relações de seguir/seguindo entre usuários
- `likes`: Curtidas em posts

## Solução de Problemas

- **Erro de Autenticação**: Verifique se as variáveis do Supabase estão corretas
- **Falha nos Uploads**: Confirme as credenciais do Cloudinary
- **Posts não carregam**: Verifique a estrutura da tabela posts no Supabase

## Contato e Suporte

Para mais informações ou suporte, entre em contato com a equipe de desenvolvimento.
