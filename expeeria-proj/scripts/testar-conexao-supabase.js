// Script para testar a conexu00e3o com o Supabase

// CONFIGURAU00c7U00c3O: Substitua essas variáveis com os valores de seu arquivo .env.local
const SUPABASE_URL = 'https://gcwqtzpaekzfxljtgnrh.supabase.co'; // Substitua pelo seu VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd3F0enBhZWt6ZnhsanRnbnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDg3MTUsImV4cCI6MjA2MjMyNDcxNX0.pOU9Ibecq_qNx3NB4GsIA-8yIAXfQvsvpoh2MPgvC2Y'; // Substitua pelo seu VITE_SUPABASE_ANON_KEY

/**
 * INSTU00c7U00d5ES:
 * 1. Copie os valores de VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY do seu arquivo .env.local 
 *    e cole-os nas variáveis acima
 * 2. Execute o script com Node.js (versão 16+): node scripts/testar-conexao-supabase.js
 */

import { createClient } from '@supabase/supabase-js';

// Verificau00e7u00e3o de configurau00e7u00e3o
if (SUPABASE_URL === 'SUA_URL_DO_SUPABASE' || SUPABASE_ANON_KEY === 'SUA_CHAVE_ANON_DO_SUPABASE') {
  console.error('\u274C Erro: Por favor, substitua as variáveis de configurau00e7u00e3o no começo do script pelos seus valores reais!');
  console.log('1. Abra o arquivo .env.local');
  console.log('2. Copie os valores de VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  console.log('3. Cole-os nas variáveis correspondentes no começo deste script');
  console.log('4. Execute o script novamente');
  process.exit(1);
}

// Criar o cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verifica se a conexu00e3o com o Supabase está funcionando
async function verificarConexao() {
  console.log('Verificando conexu00e3o com o Supabase...');
  
  try {
    // Teste de conexu00e3o básica
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('\u274C Erro na conexu00e3o com o Supabase:', error.message);
      console.error('Detalhes do erro:', error);
      return false;
    }
    
    console.log('\u2705 Conexu00e3o com o Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('\u274C Erro inesperado ao testar conexu00e3o:', error.message);
    return false;
  }
}

// Testa acesso a tabelas básicas
async function testarTabelas() {
  console.log('\nTestando acesso às tabelas principais...');
  const tabelas = ['users', 'posts', 'comments', 'post_likes'];
  
  for (const tabela of tabelas) {
    try {
      const { data, error, count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`\u274C Erro ao acessar tabela ${tabela}:`, error.message);
      } else {
        console.log(`\u2705 Tabela ${tabela} acessível! (${count || 0} registros)`);
      }
    } catch (error) {
      console.error(`\u274C Erro inesperado ao acessar tabela ${tabela}:`, error.message);
    }
  }
}

// Função principal
async function executarTestes() {
  console.log('======== TESTE DE CONEXU00c3O COM O SUPABASE ========');
  console.log('URL do Supabase:', SUPABASE_URL.substring(0, 25) + '...');
  console.log('Chave Anônima:', SUPABASE_ANON_KEY.substring(0, 5) + '...');
  console.log('\n');
  
  const conexaoOk = await verificarConexao();
  
  if (conexaoOk) {
    await testarTabelas();
  } else {
    console.error('\n\u274C Não foi possível testar as tabelas devido a erro na conexu00e3o.\n');
  }
  
  console.log('\n======== FIM DO TESTE ========');
}

// Executar testes
executarTestes().catch(err => {
  console.error('Erro inesperado na execuu00e7u00e3o dos testes:', err);
  process.exit(1);
});
