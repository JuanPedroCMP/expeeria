# Expeeria

## 🌐 Acesse o site online

👉 **Acesse agora:** [https://expeeria.vercel.app](https://expeeria.vercel.app)

---

# 📖 Documentação Técnica — Expeeria

## 1. Variáveis de Ambiente

- **tokens.env**: Armazene segredos e tokens (ex: Cloudinary, APIs externas).
  
  Exemplo:
  ```env
VITE_HF_TOKEN=seu_token_aqui
CLOUDINARY_PRESET=expeeria_cloud
CLOUDINARY_CLOUD_NAME=deepc0do7
  ```
- Nunca suba este arquivo para o repositório.

---

## 2. Upload de Imagens

- O componente `UploadImage` aceita as props:
  - `onUpload`: callback para receber a URL da imagem.
  - `preset`: nome do preset do Cloudinary.
  - `previewStyle`: objeto de estilos para o preview.
- Exemplo de uso:

  ```jsx
  <UploadImage
    onUpload={setAvatar}
    preset="expeeria_avatar"
    previewStyle={{ width: 120, height: 120, borderRadius: "50%" }}
  />
  ```

---

## 3. Estrutura de Usuário

```json
{
  "id": "u001",
  "email": "exemplo@email.com",
  "password": "senha",
  "name": "Nome Completo",
  "username": "nomeusuario",
  "role": "user",
  "bio": "Texto opcional",
  "avatar": "url",
  "interests": ["Tecnologia", "Educação"],
  "followers": [],
  "following": []
}
```
- O campo `username` é único e imutável.
- O campo `role` pode ser `"user"` ou `"admin"`.

---

## 4. Estrutura de Post

```json
{
  "id": "p001",
  "title": "Título",
  "caption": "Resumo",
  "content": "Conteúdo em Markdown",
  "imageUrl": "url",
  "author": "email do autor",
  "userId": "id do autor",
  "area": ["Categoria1", "Categoria2"],
  "createdAt": "2025-05-05T09:00:00.000Z",
  "likes": 0,
  "comments": [
    { "id": "c001", "user": "nome ou email", "text": "Comentário" }
  ]
}
```

---

## 5. Dicas de Manutenção

- Sempre use arrays para `interests` e `area` (categorias).
- Para adicionar novas categorias, edite `categoriasPadrao.js`.
- Para criar um novo admin, adicione `"role": "admin"` ao usuário no `db.json`.
- Para resetar o banco, apague e recrie o arquivo `db.json`.

---

## 6. Exemplos de Uso dos Componentes

### Card

```jsx
<Card
  TituloCard="Título do Post"
  SubTitulo="Categoria"
  Descrisao="Resumo do post"
  likes={10}
  id="p001"
/>
```

### Button

```jsx
<Button destino="/explorar" texto="Explorar" tipo="primario" />
<Button destino="/criar_post" texto="Novo Post" tipo="destaque" />
```

---

## 7. Testes e Desenvolvimento

- Use o comando `npm run server` para rodar o backend fake.
- Use `npm run dev` para rodar o frontend.
- Teste uploads, login, permissões de admin e responsividade em diferentes navegadores.

---

## 8. Planos Futuros

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