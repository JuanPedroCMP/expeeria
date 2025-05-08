# Expeeria – Plataforma Educacional Colaborativa

<div align="center">
  <img src="https://i.ibb.co/vDmDnXk/expeeria-logo.png" alt="Expeeria Logo" width="300px" />
  
  ### 🌟 Compartilhe experiências. Aprenda. Conecte-se.
  
  [![Acesse o site](https://img.shields.io/badge/Expeeria-Acessar%20Site-0575e6?style=for-the-badge)](https://expeeria.vercel.app)
  [![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=for-the-badge)](https://expeeria.vercel.app)
</div>

## ⚠️ AVISO IMPORTANTE ⚠️

**Atualmente existe um problema de conexão com o banco de dados Supabase** que não foi possível resolver a tempo. Por essa razão:  

- **O sistema de usuários não está funcionando** (registro, login, perfis)  
- **A criação e visualização de posts está comprometida**  
- **A página de apresentação** (/presentation) **está funcionando com dados de exemplo** incorporados diretamente no componente  

A interface e navegação entre páginas estão disponíveis para demonstração do design e layout do projeto.

## 🌐 Acesse a Demonstração

👉 **Acesse agora:** [https://expeeria.vercel.app/presentation](https://expeeria.vercel.app/presentation)

> Recomendamos acessar diretamente a página de apresentação (/presentation) que foi especialmente preparada para funcionar sem dependência do banco de dados.

## 🔍 Página de Apresentação

A página de apresentação (/presentation) foi desenvolvida como uma solução para os problemas de conexão com o banco de dados. Ela apresenta:

- **Posts de exemplo incorporados** diretamente no componente React
- **Design completo e moderno** com animações e gradientes
- **Interface responsiva** adaptada para todos os tamanhos de tela
- **Cards de conteúdo** exibindo posts educacionais em várias categorias
- **Seções informativas** sobre o projeto e seus objetivos

As informações exibidas nesta página foram estruturadas para demonstrar a proposta do Expeeria, mesmo sem a funcionalidade completa do banco de dados.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Funcionalidades](#2-funcionalidades)
3. [Tecnologias Utilizadas](#3-tecnologias-utilizadas)
4. [Como Rodar o Projeto](#4-como-rodar-o-projeto)
5. [Principais Componentes e Páginas](#6-principais-componentes-e-páginas)
6. [Fluxo de Usuário](#7-fluxo-de-usuário)
7. [Permissões e Papéis](#8-permissões-e-papéis)
8. [Soluções Técnicas Implementadas](#9-soluções-técnicas-implementadas)
9. [Padrões de Código e Boas Práticas](#10-padrões-de-código-e-boas-práticas)
10. [Integrantes do Grupo](#10-integrantes-do-grupo)
11. [Planos Futuros](#11-planos-futuros)
12. [Ideia da Startup](#12-sobre-a-ideia-da-startup)

---

## 1. Visão Geral

O **Expeeria** é uma plataforma colaborativa que conecta pessoas através da troca de conhecimentos e experiências. Nossa missão é criar um ambiente onde:

- 🌱 **Experiências são valorizadas** como formas legítimas de ensino e aprendizado
- 🤝 **Conexões significativas** são estabelecidas entre pessoas com interesses complementares
- 📚 **Conhecimento é compartilhado** de forma direta, prática e acessível
- 🚀 **Comunidades crescem** através da colaboração mútua

Desenvolvido para atender diversas áreas como tecnologia, arte, sustentabilidade, saúde, viagens e mais, o Expeeria permite que usuários criem conteúdo, interajam, personalizem seus perfis e descubram novos conhecimentos através de recomendações personalizadas.

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

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Frontend</b></td>
      <td align="center"><b>Backend</b></td>
      <td align="center"><b>Ferramentas</b></td>
    </tr>
    <tr>
      <td>
        <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /><br/>
        <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" /><br/>
        <img src="https://img.shields.io/badge/CSS_Modules-000000?style=for-the-badge&logo=css3&logoColor=1572B6" alt="CSS Modules" />
      </td>
      <td>
        <img src="https://img.shields.io/badge/JSON_Server-000000?style=for-the-badge&logo=json&logoColor=white" alt="JSON Server" /><br/>
        <img src="https://img.shields.io/badge/REST_API-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="REST API" /><br/>
        <img src="https://img.shields.io/badge/Context_API-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="Context API" />
      </td>
      <td>
        <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" /><br/>
        <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" /><br/>
        <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
      </td>
    </tr>
  </table>
</div>

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

## 9. Soluções Técnicas Implementadas

### Posts de Exemplo

Para contornar o problema de conexão com o banco de dados, implementamos as seguintes soluções:

- **Hook `useExamplePosts`**: Desenvolvido para simular a interação com o backend, fornecendo dados de exemplo estruturados
- **Dados Incorporados**: Posts educacionais com estrutura completa (título, descrição, categoria, autor) diretamente no componente
- **Renderização Condicional**: Sistema de tratamento para garantir que a interface seja mostrada mesmo sem dados reais
- **CSS Modular**: Estilos dedicados para a página de apresentação sem depender de componentes externos

### Problemas Conhecidos

- **Autenticação**: O hook `useAuth.js` não retorna corretamente a propriedade 'sessionChecked' utilizada pelo componente PrivateRoute
- **Conexão com Supabase**: Há um erro na configuração ou conexão com o banco de dados que impede o funcionamento adequado das funcionalidades principais

---

## 10. Padrões de Código e Boas Práticas

Implementamos diversas práticas de desenvolvimento moderno para garantir a qualidade e manutenibilidade do código:

| 💡 Prática | 📝 Descrição |
|------------|-------------|
| **🧩 Componentização** | Arquitetura modular com componentes reutilizáveis, facilitando manutenção e expansão do projeto |
| **🎨 CSS Modules** | Estilos isolados por componente, evitando conflitos e tornando o código mais legível |
| **🔄 Context API** | Sistema eficiente para gerenciamento global de estado, utilizado para autenticação e gerenciamento de posts |
| **✅ Validação** | Todos os formulários possuem validação de dados, garantindo a consistência das informações |
| **♿ Acessibilidade** | Interface projetada com atributos `aria-label`, navegação por teclado e contraste adequado de cores |
| **📱 Responsividade** | Design adaptativo para qualquer dispositivo, de smartphones a desktops |
| **🔔 Feedback visual** | Sistema completo de notificações, incluindo mensagens de sucesso/erro e indicadores de carregamento |
| **🔐 Segurança** | Proteção de rotas privadas e validação de permissões no frontend |

---

## 10. Integrantes do Grupo

<div align="center">
  <table>
    <tr>
      <td align="center">
        <b>Juan Pedro</b><br />
        <small>2º DS</small><br />
      </td>
      <td align="center">
        <b>Rafael Sales</b><br />
        <small>2º DS</small><br />
      </td>
      <td align="center">
        <b>Ricardo Costa</b><br />
        <small>2º DS</small><br />
      </td>
    </tr>
  </table>
</div>

---

## 11. Planos Futuros

<div align="center">
  <h3>🚀 Roadmap do Expeeria</h3>
</div>

### Fase 1: Infraestrutura Robusta
- 🔐 **Banco de dados permanente**: Migração para MongoDB, PostgreSQL ou Supabase
- 🛡️ **Segurança avançada**: Implementação de JWT, redefinição de senha e verificação de email
- 📱 **Responsividade completa**: Otimização para todos os dispositivos

### Fase 2: Experiência de Usuário Aprimorada
- 🧩 **Sistema de perfis expandido**: Badges, níveis de experiência e perfis personalizáveis
- 💬 **Sistema de mensagens diretas**: Comunicação privada entre usuários
- 🔍 **Busca avançada**: Filtros complexos e sugestões inteligentes
- 📝 **Editor avançado**: WYSIWYG, suporte a vídeos, enquetes e anexos

### Fase 3: Integrações e Expansão
- 🔄 **Login social**: Integração com GitHub, Google, LinkedIn e Discord
- 📚 **Plataforma de cursos gratuitos**: Trilhas de aprendizado, quizzes e certificados
- 🎮 **Gamificação**: Sistema de pontos, conquistas e rankings
- 📲 **Aplicativo mobile**: Versão React Native para iOS e Android

### Fase 4: Inovação e Crescimento
- 🤖 **Feed personalizado com IA**: Recomendações baseadas em interesses e comportamento
- 📊 **Dashboard administrativo**: Moderação de conteúdo, analytics e relatórios
- 📅 **Sistema de eventos**: Webinars, calendário e transmissões ao vivo
- 🏆 **Marketplace de mentorias**: Conexão entre mentores e aprendizes

### Fase 5: Consolidação e Expansão Global
- 🌐 **Suporte multilíngue**: Internacionalização completa da plataforma
- ♿ **Acessibilidade total**: Recursos avançados para PCD
- 🧰 **API pública**: Ferramentas para desenvolvedores externos
- 🌱 **Expansão de comunidades**: Suporte para grupos locais e temas especializados

---

## 12. Sobre a Ideia da startup

O **Expeeria** é uma plataforma digital onde pessoas compartilham, trocam e adquirem conhecimentos práticos diretamente com outras pessoas — uma verdadeira rede de trocas de experiências e habilidades. O nome nasce da união de **"Experience" (experiência) e "Peer" (par)**, refletindo o conceito central de aprendizado entre iguais.

### Proposta de Valor
- Conectar pessoas com habilidades complementares.
- Facilitar a troca de conhecimento real e aplicável, sem intermediários ou cursos longos.
- Valorizar experiências de vida, estudo e profissão como formas legítimas de ensino.

### Problemas que o Expeeria resolve
- Dificuldade de encontrar alguém para trocar habilidades específicas (ex: “eu te ensino Photoshop e você me ensina Excel”).
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

### Recursos-Chave (Para o futuro)
- Sistema de Match de Habilidades: estilo "Tinder para aprendizado", onde usuários indicam o que sabem e o que querem aprender.
- Perfis com portfólios, reputação e histórico de trocas.
- Chat e agendamento direto na plataforma.
- Gamificação: conquistas por ensinar, aprender, avaliar.
- Integração com GitHub, Behance, LinkedIn etc. para validar experiências.
- Feed de microaulas e experiências compartilhadas.

### Modelo de Uso
- 100% gratuito para os usuários.
- Potencial para se tornar uma plataforma de networking educativo.

### Mensagem Principal 
> “Compartilhe conhecimento. Aprenda com experiências reais.”
>
> “Você ensina. Você aprende. Você cresce.”
>
> “Transforme o que você sabe em uma ponte para o que quer aprender.”

