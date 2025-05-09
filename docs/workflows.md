# Workflows do Expeeria

Este documento descreve os principais fluxos de usuário e casos de uso da plataforma Expeeria. Cada workflow apresenta as etapas detalhadas que um usuário segue para realizar ações específicas.

## Índice

1. [Registro e Login](#registro-e-login)
2. [Edição de Perfil](#edição-de-perfil)
3. [Criação e Edição de Posts](#criação-e-edição-de-posts)
4. [Interação com Posts](#interação-com-posts)
5. [Exploração de Conteúdo](#exploração-de-conteúdo)

## Registro e Login

### Registro (Sign Up)

1. **Acesso à página de cadastro**
   - Usuário acessa a página inicial
   - Clica no botão "Cadastre-se" no cabeçalho

2. **Preenchimento do formulário**
   - Informa nome completo
   - Fornece um email válido
   - Define uma senha (mínimo 6 caracteres)
   - Confirma a senha

3. **Submissão e validação**
   - Sistema valida os dados fornecidos
   - Verifica se o email já está cadastrado
   - Registra o usuário no Supabase Auth

4. **Criação de perfil**
   - Após registro bem-sucedido, sistema cria automaticamente um perfil básico para o usuário
   - Gera um nome de usuário único baseado no email

5. **Confirmação de email**
   - Sistema envia email de confirmação
   - Usuário deve confirmar email antes de acessar funcionalidades completas

### Login (Sign In)

1. **Acesso à página de login**
   - Usuário acessa a página inicial
   - Clica no botão "Entrar" no cabeçalho

2. **Inserção de credenciais**
   - Fornece email registrado
   - Insere senha

3. **Validação e autenticação**
   - Sistema verifica credenciais com Supabase Auth
   - Confirma se o email foi verificado

4. **Estabelecimento da sessão**
   - Após autenticação bem-sucedida, sistema cria sessão
   - Usuário é redirecionado para a página inicial logada
   - Sessão é mantida entre recarregamentos de página

## Edição de Perfil

1. **Acesso à página de perfil**
   - Usuário clica na foto de perfil no cabeçalho
   - Seleciona "Meu Perfil"
   - Clica no botão "Editar Perfil"

2. **Alteração de informações**
   - Atualiza nome de exibição
   - Modifica bio/descrição
   - Altera interesses (categorias)

3. **Upload de avatar**
   - Clica na área de imagem
   - Seleciona nova foto de perfil
   - Pré-visualiza imagem selecionada
   - Confirma seleção

4. **Salvamento das alterações**
   - Clica em "Salvar alterações"
   - Sistema valida informações
   - Atualiza dados no banco de dados
   - Exibe confirmação de sucesso

## Criação e Edição de Posts

### Criação de Post

1. **Iniciar criação**
   - No cabeçalho ou na barra lateral, usuário clica em "Criar Post"

2. **Preenchimento do formulário**
   - Define título
   - Adiciona descrição breve (caption)
   - Insere conteúdo principal (suporte a markdown)
   - Seleciona até 3 categorias para o post

3. **Upload de imagem de capa**
   - Opcional: usuário seleciona imagem de capa
   - Pré-visualiza imagem selecionada

4. **Pré-visualização**
   - Usuário pode alternar entre edição e visualização
   - Visualiza como o markdown será renderizado

5. **Publicação**
   - Clica em "Publicar"
   - Sistema valida o conteúdo
   - Cria registro no banco de dados
   - Redireciona para o post publicado

### Edição de Post

1. **Acessar post para edição**
   - Usuário navega até seu post
   - Clica no menu de opções (três pontos)
   - Seleciona "Editar"

2. **Modificação do conteúdo**
   - Altera campos desejados
   - Atualiza categorias se necessário
   - Substitui imagem de capa se desejado

3. **Salvamento das alterações**
   - Clica em "Salvar alterações"
   - Sistema atualiza post no banco de dados
   - Redireciona para o post atualizado

## Interação com Posts

### Visualização de Post

1. **Acesso ao post**
   - Usuário clica em um card de post na página inicial ou de exploração
   - Sistema carrega o conteúdo completo do post

2. **Leitura e visualização**
   - Post é exibido com formatação markdown renderizada
   - Informações do autor são mostradas
   - Contagem de likes é exibida

### Comentários

1. **Visualização de comentários**
   - Comentários são carregados abaixo do conteúdo do post
   - Exibidos em ordem cronológica

2. **Adição de comentário**
   - Usuário digita comentário na caixa de texto
   - Clica em "Comentar"
   - Comentário é adicionado em tempo real

### Curtidas (Likes)

1. **Curtir um post**
   - Usuário clica no ícone de coração
   - Contagem de likes é incrementada
   - Estado visual do botão muda

2. **Descurtir um post**
   - Usuário clica novamente no ícone de coração
   - Contagem de likes é decrementada
   - Estado visual do botão retorna ao normal

## Exploração de Conteúdo

1. **Acesso à página de exploração**
   - Usuário clica em "Explorar" na barra lateral ou no cabeçalho

2. **Filtragem de conteúdo**
   - Utiliza a barra de pesquisa para buscar por termos específicos
   - Seleciona categorias para filtrar posts relacionados
   - Escolhe ordenação (recentes ou populares)

3. **Navegação pelos resultados**
   - Visualiza cards de posts nos resultados
   - Clica nos cards para acessar o conteúdo completo

4. **Interação com o autor**
   - Clica no nome do autor para visitar seu perfil
   - Visualiza outros posts do mesmo autor

---

## Fluxos de Erro

### Recuperação de Falhas na Autenticação

1. **Timeout de login**
   - Se o processo de verificação de sessão demorar mais de 3 segundos
   - Sistema libera a tela automaticamente
   - Usuário pode tentar novamente ou prosseguir sem login

2. **Fallback de carregamento de posts**
   - Se a busca complexa falhar na página inicial
   - Sistema tenta uma consulta simplificada
   - Exibe posts mesmo sem todas as informações associadas

3. **Tratamento de sessão inválida**
   - Se a sessão for detectada como inválida
   - Sistema limpa a sessão local
   - Solicita novo login do usuário
   - Preserva URL para redirecionamento após novo login
