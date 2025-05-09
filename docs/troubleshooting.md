# Soluu00e7u00e3o de Problemas (Troubleshooting) - Expeeria

Este documento fornece soluu00e7u00f5es para problemas comuns que podem ocorrer durante o desenvolvimento ou uso da plataforma Expeeria.

## u00cdndice

1. [Problemas de Autenticau00e7u00e3o](#problemas-de-autenticau00e7u00e3o)
2. [Problemas com Posts](#problemas-com-posts)
3. [Erros no Banco de Dados](#erros-no-banco-de-dados)
4. [Problemas de Performance](#problemas-de-performance)
5. [Erros Comuns em Deploy](#erros-comuns-em-deploy)

## Problemas de Autenticau00e7u00e3o

### Loop de Carregamento Infinito

**Problema:** A pu00e1gina fica em estado de carregamento infinito ao tentar verificar a sessu00e3o do usuu00e1rio.

**Soluu00e7u00e3o:**

1. O componente `PrivateRoute` agora implementa um timeout de seguranu00e7a:
   ```jsx
   // Timeout de seguranu00e7a no PrivateRoute
   useEffect(() => {
     if (loading) {
       const timer = setTimeout(() => {
         console.log('Timeout de seguranu00e7a do PrivateRoute acionado!');
         setTimeoutReached(true);
       }, 3000);
       return () => clearTimeout(timer);
     }
   }, [loading]);
   ```

2. Se o problema persistir, limpe o cache do navegador e os cookies.

3. Verifique se as variu00e1veis de ambiente estu00e3o configuradas corretamente:
   ```
   VITE_SUPABASE_URL=sua-url-do-supabase
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

### Erro "E-mail nu00e3o confirmado"

**Problema:** Ao tentar fazer login, recebe a mensagem que o e-mail nu00e3o foi confirmado.

**Soluu00e7u00e3o:**

1. Verifique sua caixa de entrada (e pasta de spam) pelo e-mail de confirmau00e7u00e3o do Supabase.

2. No Supabase Dashboard:
   - Acesse Authentication > Users e verifique o status do usuário
   - Você pode atualizar manualmente o status para 'confirmed' se necessário

### Problemas com a Sessão e LocalStorage

**Problema:** A sessão do usuário fica corrompida no localStorage, exigindo limpeza manual dos dados.

**Solução:**

1. **Auto-Recuperação de Sessão (Nova Funcionalidade)**: O sistema agora detecta automaticamente problemas na sessão e limpa o localStorage:
   ```jsx
   // Função em AuthContext.jsx que limpa dados desnecessu00e1rios do localStorage
   const cleanLocalStorage = () => {
    const keysToKeep = [];
    
    // Mantemos apenas as chaves essenciais e removemos as relacionadas ao Supabase
    const savedKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (keysToKeep.includes(key)) {
        savedKeys.push(key);
        continue;
      }
      
      // Remove todas as outras chaves, principalmente as do Supabase
      localStorage.removeItem(key);
    }
    
    console.log('LocalStorage limpo. Chaves mantidas:', savedKeys);
    return savedKeys;
  };
   ```

2. Se a auto-recuperação não funcionar, você ainda pode limpar manualmente o localStorage:
   - Abra o Console do Navegador (F12)
   - Digite `localStorage.clear()` e pressione Enter
   - Recarregue a página
   - Vu00e1 para `Authentication` > `Users`
   - Localize o usuu00e1rio e clique em "View User"
   - Marque o email como confirmado (para fins de desenvolvimento)

3. Em ambiente de desenvolvimento, vocu00ea pode desativar temporariamente a confirmau00e7u00e3o de e-mail:
   - No Supabase Dashboard, vu00e1 para `Authentication` > `Providers` > `Email`
   - Desmarque a opu00e7u00e3o "Confirm email"

### Sessu00e3o Perdida apu00f3s Recarregar a Pu00e1gina

**Problema:** O login funciona, mas ao recarregar a pu00e1gina a sessu00e3o u00e9 perdida.

**Soluu00e7u00e3o:**

Isso foi resolvido modificando a configurau00e7u00e3o de persistu00eancia do cliente Supabase:

```javascript
// src/services/supabase.js
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: window.localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
```

## Problemas com Posts

### Nu00e3o Consegue Carregar Posts na Pu00e1gina Inicial

**Problema:** A pu00e1gina inicial nu00e3o carrega posts ou apresenta erro ao buscar dados.

**Soluu00e7u00e3o:**

1. A consulta foi simplificada para reduzir pontos de falha:
   ```javascript
   // Consulta simplificada para reduzir chances de erro
   const { data: postsData, error: postsError } = await supabase
     .from('posts')
     .select('*')  // Consulta simplificada
     .eq('status', 'published')
     .order('created_at', { ascending: false })
     .limit(10); // Limitar resultados para melhor performance
   ```

2. Consultas separadas para autores:
   ```javascript
   // Obter IDs de autores u00fanicos
   const authorIds = [...new Set(postsData.map(post => post.author_id))];
   const { data: authorsData } = await supabase
     .from('users')
     .select('id, username, name, avatar')
     .in('id', authorIds);
   ```

### Problemas ao Visualizar Post Individual

**Problema:** Ao abrir um post individual, a pu00e1gina apresenta erro, nu00e3o carrega os dados corretamente ou trava.

**Soluu00e7u00e3o:**

1. **Nova Abordagem de Carregamento (Implementada)**: A pu00e1gina de post agora utiliza um mecanismo mais robusto para carregar dados:
   ```javascript
   // PostPage.jsx - Carregamento robusto e tratamento de erros
   const fetchPostAndComments = async () => {
     try {
       setLoading(true);
       setError(null);

       // Busca o post principal de forma separada
       const { data: postData, error: postError } = await supabase
         .from('posts')
         .select('*')
         .eq('id', id)
         .single();

       if (postError) {
         throw new Error(`Erro ao carregar post: ${postError.message}`);
       }

       // Busca separada para os comentu00e1rios
       const { data: commentsData, error: commentsError } = await supabase
         .from('comments')
         .select('*')
         .eq('post_id', id)
         .order('created_at', { ascending: false });

       if (commentsError) {
         console.error('Erro ao carregar comentu00e1rios:', commentsError);
         // Continu00faa mesmo com erro nos comentu00e1rios
       }

       // Configura os dados com tratamento adequado
       setPost(postData);
       setComments(commentsData || []);
     } catch (err) {
       console.error('Erro no carregamento:', err);
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Melhorias na UI**: O design da pu00e1gina foi aprimou00e7ado para oferecer melhor feedback:
   - Indicadores de carregamento mais claros
   - Mensagens de erro mais informativas
   - Layout responsivo otimizado
   - Animau00e7u00f5es suaves para melhor experiência

3. Verifique se hu00e1 posts publicados no banco de dados:
   - No Supabase Dashboard, vu00e1 para `Table Editor` > `posts`
   - Confirme que existem posts com `status = 'published'`

### Erro ao Visualizar Post Especu00edfico

**Problema:** Ao clicar em um post para visualizu00e1-lo, recebe erro ou tela em branco.

**Soluu00e7u00e3o:**

1. Tratamento de erros e carregamento melhorado em `PostPage.jsx`:
   ```jsx
   // Tratar estado de carregamento e erro
   if (loading) {
     return (
       <div className={styles.loadingContainer}>
         <LoadingSpinner size="lg" />
         <p>Carregando post...</p>
       </div>
     );
   }

   if (error) {
     return (
       <div className={styles.errorContainer}>
         <h2>Erro ao carregar o post</h2>
         <p>{error}</p>
         <Link to="/">Voltar para a pu00e1gina inicial</Link>
       </div>
     );
   }
   ```

2. Verifique o console do navegador para mensagens de erro especu00edficas.

3. Confirme que o ID do post u00e9 vu00e1lido e existe no banco de dados.

## Erros no Banco de Dados

### Erro "Foreign Key Constraint"

**Problema:** Ao criar posts ou comentu00e1rios, ocorre erro de violau00e7u00e3o de chave estrangeira.

**Soluu00e7u00e3o:**

1. Verifique se o perfil do usuu00e1rio foi criado corretamente:
   ```javascript
   // Verificar se o perfil existe e criar se necessu00e1rio
   async function ensureProfileExists(userId, email, name) {
     const { data: existingProfile } = await supabase
       .from('profiles')
       .select('*')
       .eq('id', userId)
       .single();
       
     if (!existingProfile) {
       const username = generateUsername(email);
       await supabase
         .from('profiles')
         .insert({
           id: userId,
           username,
           name: name || username,
         });
     }
   }
   ```

2. Certifique-se de que as tabelas relacionadas existem e estu00e3o configuradas corretamente.

## Problemas de Performance

### Carregamento Lento da Pu00e1gina Inicial

**Problema:** A pu00e1gina inicial demora muito para carregar.

**Soluu00e7u00e3o:**

1. Limitau00e7u00e3o da quantidade de posts carregados:
   ```javascript
   .limit(10) // Limitar resultados para melhor performance
   ```

2. Consultas otimizadas e separadas:
   - Primeiro carrega dados bu00e1sicos dos posts
   - Depois carrega informau00e7u00f5es de autores em consulta separada

3. Implementau00e7u00e3o de estados de carregamento adequados:
   ```jsx
   if (loading) {
     return <LoadingSpinner size="lg" />;
   }
   ```

### Problemas ao Carregar Muitas Imagens

**Problema:** Pu00e1ginas com muitas imagens tu00eam performance ruim.

**Soluu00e7u00e3o:**

1. Use lazy loading para imagens:
   ```jsx
   <img 
     src={post.imageUrl} 
     alt={post.title} 
     loading="lazy" 
   />
   ```

2. Considere implementar uma CDN para entrega de imagens (Cloudinary ju00e1 u00e9 utilizado).

## Erros Comuns em Deploy

### Problemas com Variu00e1veis de Ambiente

**Problema:** O projeto nu00e3o funciona corretamente apu00f3s deploy na Vercel.

**Soluu00e7u00e3o:**

1. Certifique-se de configurar as variu00e1veis de ambiente na Vercel:
   - Vu00e1 para o Dashboard da Vercel > Seu Projeto > Settings > Environment Variables
   - Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

2. Configure a URL do site no Supabase:
   - Dashboard do Supabase > Authentication > URL Configuration
   - Adicione a URL do seu projeto Vercel em "Site URL"

### Erros de CORS

**Problema:** Requisiu00e7u00f5es para o Supabase falham com erros de CORS apu00f3s deploy.

**Soluu00e7u00e3o:**

1. No Supabase Dashboard, vu00e1 para `API` > `Settings`
2. Em "API Settings", procure a seu00e7u00e3o "CORS" (Cross-Origin Resource Sharing)
3. Adicione a URL do seu site (ex: `https://seu-site-vercel.vercel.app`) na lista de domu00ednios permitidos

## Outros Problemas Comuns

### Hook `useAuth` Nu00e3o Retorna Propriedade `sessionChecked`

**Problema:** Componentes que dependem da propriedade `sessionChecked` nu00e3o funcionam corretamente.

**Soluu00e7u00e3o:**

Implementamos uma correu00e7u00e3o para garantir que essa propriedade sempre esteja disponu00edvel:

```javascript
// hooks/useAuth.js

// Garantir que sessionChecked exista antes de usu00e1-lo
if (authContext.sessionChecked === undefined) {
  console.error('ERRO CRu00cdTICO: sessionChecked nu00e3o estu00e1 definido no contexto de autenticau00e7u00e3o');
  // Foru00e7ar um valor default para evitar problemas no PrivateRoute
  authContext.sessionChecked = true;
}

// Garantia explu00edcita que sessionChecked seru00e1 retornado, mesmo se indefinido
const { 
  // ... outros valores
  sessionChecked = true 
} = authContext;
```

Esta abordagem garante que o hook sempre retorne um valor para `sessionChecked`, mesmo que seja `undefined` no contexto original.
