# Expeeria – Conectando pessoas através do conhecimento

## 🌐 Acesse o site online

👉 **Acesse agora:** [https://expeeria.vercel.app](https://expeeria.vercel.app)

### ⚠️ IMPORTANTE ⚠️

  ⚠️  **O sitema de usuario (visualizar perfil, etc.) pode não funcionar corretamente pois ainda não está utilizando um banco de dados, isso será corrigido.**

  ⚠️  **Pode demorar até um minuto para carregar o site pela primeira vez, devido ao modo de suspenção automática do Render**

  Caso o sistema de usuario não esteja funcionando, para poder testar o sitema de usuario use um usuarío já feito, mas tente criar uma conta primero, se não der usse essa:

      email: "carol@eco.com"
      password: "carol123"
      name: "Carol Verde"

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Funcionalidades](#2-funcionalidades)
3. [Tecnologias Utilizadas](#3-tecnologias-utilizadas)
4. [Como Rodar o Projeto](#4-como-rodar-o-projeto)
5. [Estrutura de Pastas](#5-estrutura-de-pastas)
6. [Principais Componentes e Páginas](#6-principais-componentes-e-páginas)
7. [Fluxo de Usuário](#7-fluxo-de-usuário)
8. [Permissões e Papéis](#8-permissões-e-papéis)
9. [Padrões de Código e Boas Práticas](#9-padrões-de-código-e-boas-práticas)
10. [Integrantes do Grupo](#10-integrantes-do-grupo)
11. [Planos Futuros](#11-planos-futuros)
11. [Ideia da startup](#12-sobre-a-ideia-da-startup)

---

## 1. Visão Geral

O **Expeeria** é uma plataforma web colaborativa para compartilhar experiências, dicas e aprendizados em diversas áreas, como tecnologia, arte, sustentabilidade, saúde, viagens e mais. Usuários podem criar posts, comentar, seguir outros usuários, personalizar seus perfis e receber recomendações personalizadas.

---

## 2. Funcionalidades

- Cadastro e login de usuários
- Edição de perfil (nome, email, avatar, bio, interesses)
- Nome de usuário único e fixo
- Criação, edição e exclusão de posts
- Upload de imagens para posts e perfil (Cloudinary)
- Comentários em posts
- Sistema de seguidores/seguindo
- Exploração de posts por categorias, pesquisa e ordenação
- Recomendações personalizadas na página inicial
- Permissão de administrador (admin)
- Proteção de rotas privadas
- Design responsivo e acessível
- Preview de Markdown nos posts
- Seleção de múltiplos interesses/categorias (até 3)
- Menu lateral recolhível acessível
- Feedback visual em todas as ações

---

## 3. Tecnologias Utilizadas

- **Frontend:** React.js, React Router, CSS Modules
- **Backend:** JSON Server (API REST fake)
- **Gerenciamento de estado:** Context API
- **Upload de imagens:** Cloudinary
- **Markdown:** react-markdown
- **Outros:** Vite, Axios

---

## 4. Como Rodar o Projeto

```bash
# Instale as dependências
npm install

# Inicie o backend (JSON Server)
npm run server

# Em outro terminal, inicie o frontend
npm run dev
```

- O backend roda em `http://localhost:5000`
- O frontend roda em `http://localhost:3000`

---

## 5. Estrutura de Pastas

```
expeeria-proj/
├── public/
│   └── vite.svg
├── server/
│   └── db.json
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── CardBox/
│   │   ├── EditPost/
│   │   ├── Feed/
│   │   ├── HeadInfoUsuario/
│   │   ├── Navbar/
│   │   │   └── MenuRecolhivel/
│   │   ├── NewPost/
│   │   ├── PrivateRoute/
│   │   ├── Recomendacoes/
│   │   └── UploadImage/
│   ├── contexts/
│   ├── hooks/
│   ├── layouts/
│   │   └── LayoutPadrao/
│   ├── pages/
│   │   ├── CreatePost/
│   │   ├── Explore/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── NotFound/
│   │   ├── PostPage/
│   │   ├── Profile/
│   │   └── SignUp/
│   ├── services/
│   └── utils/
├── package.json
├── vite.config.js
├── README.md
└── ...
```

---

## 6. Principais Componentes e Páginas

### Navbar/MenuRecolhivel
- Navegação principal, menu lateral responsivo, fecha ao clicar fora ou pressionar ESC.

### Profile
- Página de perfil do usuário, edição de nome, email, avatar, bio, interesses (checkboxes), visualização de seguidores/seguindo, posts do usuário.

### NewPost
- Criação e edição de posts, upload de banner (Cloudinary), seleção de até 3 categorias (checkboxes), preview de Markdown.

### PostPage
- Visualização detalhada de um post, banner, conteúdo em Markdown, comentários (com nome automático se logado), likes, botões de editar/excluir (se dono ou admin).

### Feed
- Lista de posts, cards centralizados, botão de like, visualização rápida.

### Recomendacoes
- Recomendações personalizadas na home, baseadas em quem o usuário segue e seus interesses.

### Explore
- Página de exploração de posts, com pesquisa, filtro por categoria, ordenação (recentes/populares), cards centralizados.

### SignUp/Login
- Cadastro e login, com validação, geração de username único, feedback de erro.

### UploadImage
- Upload de imagem para Cloudinary, preview, botão de remover, estilos modernos.

### PrivateRoute
- Protege rotas privadas, redireciona para login se não autenticado.

---

## 7. Fluxo de Usuário

1. **Cadastro:** Usuário informa nome, email, senha. Um nome de usuário único é gerado automaticamente.
2. **Login:** Usuário acessa com email e senha.
3. **Perfil:** Pode editar nome, email, avatar, bio e interesses. O nome de usuário não pode ser alterado.
4. **Posts:** Usuário pode criar, editar e excluir seus próprios posts.
5. **Comentários:** Todos podem comentar nos posts.
6. **Seguir:** Usuários podem seguir/desseguir outros perfis.
7. **Admin:** Usuários com role `admin` têm permissões extras (ex: excluir qualquer post).

---

## 8. Permissões e Papéis

- **Usuário comum:** Pode editar apenas seu perfil e seus posts.
- **Admin:** Pode editar/excluir qualquer post e visualizar todos os perfis.
- **Nome de usuário:** Único e imutável após cadastro.

---

## 9. Padrões de Código e Boas Práticas

- **Componentização:** Componentes reutilizáveis, separados por responsabilidade.
- **CSS Modules:** Estilos isolados por componente.
- **Context API:** Para autenticação e gerenciamento de posts.
- **Validação de formulários:** Todos os campos obrigatórios são validados.
- **Acessibilidade:** Botões com `aria-label`, navegação por teclado, contraste de cores.
- **Responsividade:** Layout adaptado para desktop e mobile.
- **Feedback visual:** Mensagens de sucesso/erro, loading em uploads, botões desabilitados durante ações.

---

## 10. Integrantes do Grupo

- **Juan Pedro** (2°DS)
- **Rafael Sales** (2°DS)
- **Ricardo Costa** (2°DS)

---

## 11. Planos Futuros

- **Integrar a um banco de dados real** (ex: MongoDB, PostgreSQL, Supabase) para persistência dos dados dos usuários e posts.
- **Aprimorar a segurança e autenticação**: adicionar autenticação JWT, redefinição de senha, verificação de e-mail e permissões avançadas.
- **Melhorar o sistema de usuários**: perfis públicos/privados, badges, níveis de experiência, notificações e sistema de mensagens diretas.
- **Aprimorar posts**: adicionar ferramentas de formatação avançada (editor WYSIWYG, suporte a vídeos, enquetes, anexos, etc).
- **Integração com GitHub e outras plataformas**: login social, compartilhamento de posts, integração com LinkedIn, Google e Discord.
- **Construir uma plataforma de cursos gratuitos**: área de cursos, trilhas de aprendizado, quizzes, certificados e gamificação.
- **Sistema de comentários em tempo real** e notificações instantâneas.
- **Feed personalizado com IA**: recomendações baseadas em interesses, histórico e engajamento.
- **Aplicativo mobile (React Native)** para ampliar o acesso.
- **Dashboard administrativo**: moderação de conteúdo, analytics e relatórios.
- **Sistema de eventos e webinars**: calendário, inscrições e transmissão ao vivo.
- **Marketplace de serviços e mentorias**.
- **API pública para desenvolvedores**.
- **Acessibilidade e internacionalização**: suporte a múltiplos idiomas e recursos para PCD.

---

## 12. Sobre a Ideia da startup

O **Expeeria** é uma plataforma digital onde pessoas compartilham, trocam e adquirem conhecimentos práticos diretamente com outras pessoas — uma verdadeira rede de trocas de experiências e habilidades. O nome nasce da união de "Experience" (experiência) e "Peer" (par), refletindo o conceito central de aprendizado entre iguais.

### Proposta de Valor
- Conectar pessoas com habilidades complementares.
- Facilitar a troca de conhecimento real e aplicável, sem intermediários ou cursos longos.
- Valorizar experiências de vida, estudo e profissão como formas legítimas de ensino.

### Problemas que o Expeeria resolve
- Dificuldade de encontrar alguém para trocar habilidades específicas (ex: “eu te ensino Photoshop e você me ensina Excel”).
- Cursos teóricos sem prática e sem personalização.
- Falta de rede para aprender habilidades de forma gratuita e colaborativa.
- Isolamento de talentos com potencial de ensinar e colaborar.

### Filosofia do Projeto
- Conhecimento é uma moeda social.
- Todos têm algo a ensinar.
- Aprender pode ser humano, direto e colaborativo.
- Experiências reais valem tanto quanto diplomas.
- A educação pode ser descentralizada e mais acessível.

### Público-Alvo
- Estudantes que querem reforçar habilidades específicas e compartilhar o que sabem.
- Profissionais iniciantes que querem aprender de quem já está na área.
- Autodidatas e criadores de conteúdo que valorizam trocas diretas.
- Comunidades locais e grupos de estudo.

### Recursos-Chave (Visão Futura)
- Sistema de Match de Habilidades: estilo "Tinder para aprendizado", onde usuários indicam o que sabem e o que querem aprender.
- Perfis com portfólios, reputação e histórico de trocas.
- Chat e agendamento direto na plataforma.
- Gamificação: conquistas por ensinar, aprender, avaliar.
- Integração com GitHub, Behance, LinkedIn etc. para validar experiências.
- Feed de microaulas e experiências compartilhadas.

### Modelo de Uso
- 100% gratuito para os usuários.
- Possível modelo freemium: recursos premium para perfis profissionais, aulas gravadas, mentorias, etc.
- Potencial para se tornar uma plataforma de networking educativo.

### Inspiração e Diferenciais
Diferente de plataformas como Udemy ou Coursera, o Expeeria não é focado em cursos longos, mas sim em trocas rápidas, pontuais e práticas entre pessoas reais.

**Inspirações:** Tinder (match), Discord (comunidades), Duolingo (gamificação), Behance (portfólio de habilidades).

### Mensagem Principal 
> “Compartilhe conhecimento. Aprenda com experiências reais.”
>
> “Você ensina. Você aprende. Você cresce.”
>
> “Transforme o que você sabe em uma ponte para o que quer aprender.”

---

