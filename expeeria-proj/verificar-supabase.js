// Script para testar conexão com o Supabase (usando CommonJS para evitar problemas com Node.js)
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente do arquivo .env.local se existir
let supabaseUrl, supabaseAnonKey;

// Tenta carregar variáveis de ambiente de diferentes locais
const envFiles = ['.env.local', '.env'];
let envLoaded = false;

for (const file of envFiles) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    console.log(`Carregando variáveis de ambiente de ${file}`);
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    
    // Primeiro tenta encontrar variáveis VITE_ (para compatibilidade com Vite)
    supabaseUrl = envConfig.VITE_SUPABASE_URL;
    supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;
    
    // Se não encontrar, tenta sem o prefixo VITE_
    if (!supabaseUrl) supabaseUrl = envConfig.SUPABASE_URL;
    if (!supabaseAnonKey) supabaseAnonKey = envConfig.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      envLoaded = true;
      break;
    }
  }
}

// Se não conseguir carregar do arquivo .env, usa valores padrão apenas para teste
if (!envLoaded) {
  console.log('\n\x1b[33mVariáveis de ambiente não encontradas! Usando valores padrão.\x1b[0m');
  console.log('Para configurar corretamente, crie um arquivo .env.local com:');
  console.log('VITE_SUPABASE_URL=sua_url_supabase');
  console.log('VITE_SUPABASE_ANON_KEY=sua_chave_anon\n');
  
  // Solicite ao usuário inserir as credenciais
  console.log('\x1b[36mPor favor insira suas credenciais do Supabase:');
  supabaseUrl = process.env.SUPABASE_URL || process.argv[2] || '';
  supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.argv[3] || '';
}

// Função principal para testar conexão
async function testarConexaoSupabase() {
  console.log('Verificando conexão com o Supabase...');
  console.log('URL: ' + supabaseUrl);
  
  // Criar cliente do Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Testar a conexão tentando acessar as tabelas do novo esquema
    console.log('\n--- Testando tabelas ---');
    const tabelas = ['users', 'posts', 'comments', 'user_interests', 'user_followers', 'post_categories', 'post_tags', 'post_likes', 'comment_likes', 'notifications'];
    
    let algumaTabelaExiste = false;
    
    for (const tabela of tabelas) {
      try {
        const { data, error, status, statusText } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabela '${tabela}': ${error.message} (${status}: ${statusText})`);
        } else {
          console.log(`✅ Tabela '${tabela}': OK (${data.length} registros recebidos)`);
          algumaTabelaExiste = true;
        }
      } catch (err) {
        console.log(`❌ Tabela '${tabela}': ${err.message}`);
      }
    }
    
    // Testar autenticação anônima
    console.log('\n--- Testando autenticação ---');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`❌ Autenticação: ${authError.message}`);
    } else {
      console.log(`✅ Autenticação: OK (${authData.session ? 'Sessão ativa' : 'Sem sessão'})`);
    }
    
    // Resultado final
    console.log('\n--- Resultado final ---');
    if (algumaTabelaExiste) {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
      console.log('Algumas tabelas foram encontradas.');
    } else {
      console.log('⚠️ Conexão com API do Supabase funciona, mas não encontrou tabelas.');
      console.log('Você precisa criar as tabelas usando o SQL que foi fornecido.');
    }
    
  } catch (erro) {
    console.error('❌ ERRO GRAVE ao tentar conectar ao Supabase:');
    console.error(erro);
    console.log('\nVerifique:');
    console.log('1. Se o URL e a chave anônima estão corretos');
    console.log('2. Se seu projeto no Supabase está ativo');
    console.log('3. Se você tem conexão com a internet');
  }
}

// Executar o teste
testarConexaoSupabase();