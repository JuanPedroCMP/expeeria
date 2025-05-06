```markdown
# Expeeria

## Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Como Rodar o Projeto](#como-rodar-o-projeto)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Principais Componentes e Páginas](#principais-componentes-e-páginas)
7. [Fluxo de Usuário](#fluxo-de-usuário)
8. [Permissões e Papéis](#permissões-e-papéis)
9. [Padrões de Código e Boas Práticas](#padrões-de-código-e-boas-práticas)
10. [Como Contribuir](#como-contribuir)
11. [Contato](#contato)

---

## 1. Visão Geral

O **Expeeria** é uma plataforma web colaborativa para compartilhar experiências, dicas e aprendizados em diversas áreas, como tecnologia, arte, sustentabilidade, saúde, viagens e mais. Usuários podem criar posts, comentar, seguir outros usuários, personalizar seus perfis e receber recomendações personalizadas.

---

## 2. Funcionalidades

- **Cadastro e login de usuários**
- **Edição de perfil** (nome, email, avatar, bio, interesses)
- **Nome de usuário único e fixo**
- **Criação, edição e exclusão de posts**
- **Upload de imagens para posts e perfil (Cloudinary)**
- **Comentários em posts**
- **Sistema de seguidores/seguindo**
- **Exploração de posts por categorias, pesquisa e ordenação**
- **Recomendações personalizadas na página inicial**
- **Permissão de administrador (admin)**
- **Proteção de rotas privadas**
- **Design responsivo e acessível**
- **Preview de Markdown nos posts**
- **Seleção de múltiplos interesses/categorias (até 3)**
- **Menu lateral recolhível acessível**
- **Feedback visual em todas as ações**

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
  public/
  server/
    db.json
  src/
    assets/
    components/
      Button/
      Card/
      CardBox/
      EditPost/
      Feed/
      HeadInfoUsuario/
      Navbar/
        MenuRecolhivel/
      NewPost/
      PrivateRoute/
      Recomendacoes/
      UploadImage/
    contexts/
      AppContext.jsx
      AuthContext.jsx
      PostContext.jsx
    hooks/
    layouts/
      LayoutPadrao/
    pages/
      CreatePost/
      Explore/
      Home/
      Login/
      NotFound/
      PostPage/
      Profile/
      SignUp/
    utils/
      categoriasPadrao.js
      categorizePost.js
    App.jsx
    main.jsx
    Router.jsx
    index.css
    App.css
  package.json
  vite.config.js
  README.md
```

---

## 6. Principais Componentes e Páginas

### **Navbar/MenuRecolhivel**
- Navegação principal, menu lateral responsivo, fecha ao clicar fora ou pressionar ESC.

### **Profile**
- Página de perfil do usuário, edição de nome, email, avatar, bio, interesses (checkboxes), visualização de seguidores/seguindo, posts do usuário.

### **NewPost**
- Criação e edição de posts, upload de banner (Cloudinary), seleção de até 3 categorias (checkboxes), preview de Markdown.

### **PostPage**
- Visualização detalhada de um post, banner, conteúdo em Markdown, comentários (com nome automático se logado), likes, botões de editar/excluir (se dono ou admin).

### **Feed**
- Lista de posts, cards centralizados, botão de like, visualização rápida.

### **Recomendacoes**
- Recomendações personalizadas na home, baseadas em quem o usuário segue e seus interesses.

### **Explore**
- Página de exploração de posts, com pesquisa, filtro por categoria, ordenação (recentes/populares), cards centralizados.

### **SignUp/Login**
- Cadastro e login, com validação, geração de username único, feedback de erro.

### **UploadImage**
- Upload de imagem para Cloudinary, preview, botão de remover, estilos modernos.

### **PrivateRoute**
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

## 12. Observações Finais

- **Upload de imagens:** Use o preset correto do Cloudinary para avatar e banner.
- **Banco de dados:** O arquivo `db.json` simula o backend, pode ser editado manualmente para testes.
- **Segurança:** Nunca suba tokens ou segredos no repositório (use `.env`).
- **Extensibilidade:** O projeto está pronto para receber novas áreas, categorias e funcionalidades.

---
