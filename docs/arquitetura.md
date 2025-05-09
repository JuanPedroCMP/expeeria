# Arquitetura do Expeeria

## Visão Geral da Estrutura

O Expeeria é construído com uma arquitetura moderna baseada em React, utilizando Vite como ferramenta de build e Supabase como backend. Este documento descreve a estrutura do projeto, seus principais componentes e como eles se relacionam.

## Estrutura de Diretórios

```
expeeria/
├── public/              # Arquivos estáticos acessíveis publicamente
├── src/                 # Código-fonte do aplicativo
│   ├── assets/          # Recursos estáticos (imagens, ícones, etc.)
│   ├── components/      # Componentes React reutilizáveis
│   ├── contexts/        # Contextos React para gerenciamento de estado
│   ├── hooks/           # Hooks personalizados
│   ├── layouts/         # Layouts de página
│   ├── pages/           # Componentes de página
│   ├── services/        # Serviços para comunicação com APIs
│   ├── styles/          # Estilos globais e variáveis
│   ├── utils/           # Funções utilitárias
│   ├── App.jsx          # Componente raiz do aplicativo
│   └── main.jsx         # Ponto de entrada do aplicativo
├── .env.local           # Variáveis de ambiente locais
└── vite.config.js       # Configuração do Vite
```

## Principais Componentes e suas Responsabilidades

### Contextos

#### AuthContext (src/contexts/AuthContext.jsx)

Gerencia o estado de autenticação do usuário em toda a aplicação:

- Disponibiliza o estado do usuário logado
- Fornece métodos para login, logout e registro
- Controla a verificação inicial da sessão do usuário
- Garante persistência da sessão entre recarregamentos de página

#### ThemeContext (src/contexts/ThemeContext.jsx)

Responsável pelo gerenciamento do tema da aplicação (claro/escuro).

### Serviços

#### authService (src/services/authService.js)

Encapsula a lógica de autenticação e interação com o Supabase Auth:

- Registro de usuário
- Login
- Verificação de email
- Gerenciamento de perfil

#### supabase (src/services/supabase.js)

Configura e exporta o cliente Supabase para uso em toda a aplicação, garantindo a persistência da sessão.

### Componentes

#### PrivateRoute (src/components/PrivateRoute)

Protege rotas que exigem autenticação, redirecionando usuários não autenticados para a página de login.

### Hooks

#### useAuth (src/hooks/useAuth.js)

Facilita o acesso ao contexto de autenticação em componentes funcionais, disponibilizando:

- Estado do usuário
- Estado de carregamento
- Métodos de autenticação
- Verificação da sessão

## Fluxo de Dados

1. **Inicialização da Aplicação**:
   - `main.jsx` renderiza o componente `App`
   - `App` inicializa os provedores de contexto
   - `AuthProvider` verifica a sessão existente no Supabase

2. **Autenticação**:
   - Usuário entra com credenciais na página de login
   - `authService.signIn` valida com Supabase
   - `AuthContext` atualiza o estado global
   - Componentes reagem à mudança de estado

3. **Rotas Protegidas**:
   - `PrivateRoute` verifica o estado de autenticação via `useAuth`
   - Redireciona ou renderiza o componente filho conforme necessário

## Integração com Supabase

O Expeeria utiliza o Supabase como backend-as-a-service para:

- **Autenticação**: Gerenciamento de usuários e sessões
- **Banco de Dados**: Armazenamento de posts, comentários e perfis
- **Storage**: Armazenamento de imagens de perfil e posts

A conexão é configurada em `src/services/supabase.js` usando as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Considerações sobre Performance

- Consultas otimizadas para minimizar a carga no Supabase
- Carregamento de dados dividido em etapas na página inicial
- Mecanismo de timeout no `PrivateRoute` para evitar bloqueios de carregamento
