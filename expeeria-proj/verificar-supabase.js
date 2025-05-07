// Script para testar conexão com o Supabase (usando ES modules)
import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase diretamente no script (apenas para teste)
const supabaseUrl = 'https://bqjsyidyxnhungvniyij.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxanN5aWR5eG5odW5ndm5peWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzI5MDcsImV4cCI6MjA2MjIwODkwN30.dU4qcCV1D7zEI26Sxi2Hu8PKdJADpxf3l-tlXrqrWLw';

// Função principal para testar conexão
async function testarConexaoSupabase() {
  console.log('Verificando conexão com o Supabase...');
  console.log('URL: ' + supabaseUrl);
  
  // Criar cliente do Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Testar a conexão tentando acessar algumas tabelas
    console.log('\n--- Testando tabelas ---');
    const tabelas = ['profiles', 'posts', 'comments', 'likes', 'followers'];
    
    let algumaTabelaExiste = false;
    
    for (const tabela of tabelas) {
      try {
        const { data, error, status, statusText } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabela '${tabela}': ${error.message} (${status || 'unknown status'})`);
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