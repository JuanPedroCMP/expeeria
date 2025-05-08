# Configuração do Banco de Dados Supabase para o Expeeria

Este guia explica como configurar e conectar o Supabase ao projeto Expeeria.

## 1. Criação do Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha uma organização, defina um nome para o projeto (ex: "expeeria") e uma senha forte
4. Escolha a região mais próxima do Brasil (como us-east-1)
5. Aguarde a criação do projeto (pode levar alguns minutos)

## 2. Configuração do Banco de Dados

1. No dashboard do Supabase, navegue até "SQL Editor"
2. Crie uma nova consulta ("New Query")
3. Cole todo o conteúdo do arquivo `setup_schema.sql` fornecido neste diretório
4. Execute o script completo clicando em "Run"
5. Verifique se todas as tabelas foram criadas corretamente na seção "Table Editor"

## 3. Configuração da Autenticação

1. Na seção "Authentication" > "Settings", configure:
   - Ative "Enable Email Signup"
   - Configure "Site URL" com o URL do seu site (em desenvolvimento, use `http://localhost:5173`)
   - Em "Redirect URLs", adicione `http://localhost:5173/login` e `http://localhost:5173/signup`

2. Em "Email Templates", personalize os emails de confirmação e recuperação de senha (opcional)

## 4. Obtenção das Credenciais

1. No menu lateral, acesse "Project Settings" > "API"
2. Você precisará de:
   - **Project URL**: URL do projeto
   - **API Key**: Chave anônima (public)
   - **Service Role Key**: Chave de serviço (para uso apenas no backend)

## 5. Configuração do Projeto Expeeria

1. Crie/edite o arquivo `.env.local` na raiz do projeto `expeeria-proj` com as seguintes informações:

```
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

2. Para testar a conexão, execute o arquivo `verificar-supabase.js` na raiz do projeto:

```bash
node verificar-supabase.js
```

## 6. Dados Iniciais (Opcional)

Para carregar dados de exemplo no banco, execute o script `load_sample_data.sql` disponível neste diretório.

## 7. Solução de Problemas

### Problema com CORS

Se encontrar erros de CORS durante o desenvolvimento:

1. No dashboard do Supabase, vá para "Project Settings" > "API"
2. Na seção "CORS (Cross-Origin Resource Sharing)", adicione seu domínio de desenvolvimento (ex: `http://localhost:5173`)

### Problemas de Conexão

Se encontrar problemas de conexão:

1. Verifique se as credenciais no arquivo `.env.local` estão corretas
2. Certifique-se de que o Supabase está online acessando o painel
3. Verifique se não há bloqueios de rede (como firewalls corporativos) impedindo a conexão

### Erros de Autenticação

Se encontrar erros durante o processo de login ou signup:

1. Verifique as configurações de autenticação no painel do Supabase
2. Confirme que os URLs de redirecionamento estão configurados corretamente
3. Verifique os logs do cliente Supabase no console do navegador
